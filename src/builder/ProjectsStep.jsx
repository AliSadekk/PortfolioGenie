import { useState } from 'react';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Label from '../components/Label';
import Button from '../components/Button';
import { Plus, Trash2, ChevronDown, ChevronUp, ExternalLink, GitBranch } from 'lucide-react';

const MAX_PROJECTS = 20;

export default function ProjectsStep({
  projects = [],
  addProject,
  updateProject,
  removeProject,
  onOpenGithubImport,
}) {
  const [expandedIndex, setExpandedIndex] = useState(projects.length > 0 ? 0 : null);

  const handleAddProject = () => {
    if (projects.length >= MAX_PROJECTS) return;
    const newIndex = projects.length;
    addProject({
      name: '',
      description: '',
      techStack: [],
      repoUrl: '',
      liveUrl: '',
    });
    setExpandedIndex(newIndex);
  };

  const handleTechStackChange = (index, value) => {
    const list = value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 12);
    updateProject(index, { techStack: list });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-semibold">Projects</h2>
          <p className="text-sm text-muted mt-1">
            Showcase your best software projects, libraries, or open-source contributions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenGithubImport && (
            <Button variant="secondary" onClick={onOpenGithubImport} className="text-xs">
              <GitBranch className="h-3.5 w-3.5" />
              Import from GitHub
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleAddProject}
            disabled={projects.length >= MAX_PROJECTS}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add project
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted font-mono">{projects.length}/{MAX_PROJECTS} projects</p>

      {projects.length === 0 ? (
        <div className="border border-dashed border-line p-8 text-center rounded-[2px]">
          <p className="text-sm text-muted">No projects added yet.</p>
          <Button variant="secondary" onClick={handleAddProject} className="mt-4 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Add your first project
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj, i) => {
            const isExpanded = expandedIndex === i;
            return (
              <div key={i} className="border border-line rounded-[2px] bg-paper">
                <div className="flex items-center justify-between p-4 border-b border-line/60">
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExpanded ? null : i)}
                    className="flex items-center gap-2 font-medium text-ink hover:text-brand text-left truncate flex-1 focus:outline-none"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4 shrink-0 text-muted" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted" />}
                    <span className="truncate">{proj.name || `Untitled Project ${i + 1}`}</span>
                  </button>
                  <Button
                    variant="danger"
                    className="text-xs px-2 py-1 h-7"
                    onClick={() => removeProject(i)}
                    aria-label={`Remove project ${proj.name || i + 1}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-4">
                    <div>
                      <Label htmlFor={`proj-name-${i}`}>Project Name</Label>
                      <Input
                        id={`proj-name-${i}`}
                        value={proj.name || ''}
                        onChange={(e) => updateProject(i, { name: e.target.value.slice(0, 80) })}
                        placeholder="e.g. Markdown Blog Engine"
                        maxLength={80}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`proj-desc-${i}`}>Description</Label>
                      <Textarea
                        id={`proj-desc-${i}`}
                        value={proj.description || ''}
                        onChange={(e) => updateProject(i, { description: e.target.value.slice(0, 500) })}
                        placeholder="What problem does it solve? Key highlights and architecture…"
                        rows={3}
                        maxLength={500}
                      />
                      <p className="text-xs text-muted mt-1 text-right font-mono">
                        {(proj.description || '').length}/500
                      </p>
                    </div>

                    <div>
                      <Label htmlFor={`proj-tech-${i}`}>Tech Stack (comma-separated, up to 12)</Label>
                      <Input
                        id={`proj-tech-${i}`}
                        value={Array.isArray(proj.techStack) ? proj.techStack.join(', ') : ''}
                        onChange={(e) => handleTechStackChange(i, e.target.value)}
                        placeholder="e.g. Next.js, TypeScript, Tailwind, Redis"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`proj-repo-${i}`}>Repository URL</Label>
                        <Input
                          id={`proj-repo-${i}`}
                          type="url"
                          value={proj.repoUrl || ''}
                          onChange={(e) => updateProject(i, { repoUrl: e.target.value.slice(0, 300) })}
                          placeholder="https://github.com/..."
                          maxLength={300}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`proj-live-${i}`}>Live Demo URL</Label>
                        <Input
                          id={`proj-live-${i}`}
                          type="url"
                          value={proj.liveUrl || ''}
                          onChange={(e) => updateProject(i, { liveUrl: e.target.value.slice(0, 300) })}
                          placeholder="https://example.com"
                          maxLength={300}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
