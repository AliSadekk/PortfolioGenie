import { useState } from 'react';
import Input from '../components/Input';
import Label from '../components/Label';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { X, Plus } from 'lucide-react';

const MAX_SKILLS = 30;
const MAX_SKILL_LENGTH = 40;

export default function SkillsStep({ skills = [], addSkill, removeSkill }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_SKILL_LENGTH) {
      setError(`Skill must be ${MAX_SKILL_LENGTH} characters or less.`);
      return;
    }
    if (skills.length >= MAX_SKILLS) {
      setError(`Maximum ${MAX_SKILLS} skills reached.`);
      return;
    }
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setError('This skill has already been added.');
      return;
    }
    setError('');
    addSkill(trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif font-semibold">Skills</h2>
        <p className="text-sm text-muted mt-1">Add technologies, frameworks, and tools you excel in.</p>
      </div>

      <div>
        <Label htmlFor="skill-input">Add a skill</Label>
        <div className="flex gap-2">
          <Input
            id="skill-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. React, TypeScript, PostgreSQL"
            maxLength={MAX_SKILL_LENGTH}
          />
          <Button onClick={handleAdd} variant="secondary" className="shrink-0">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        <ErrorMessage>{error}</ErrorMessage>
        <p className="text-xs text-muted mt-1 font-mono">
          {skills.length}/{MAX_SKILLS} skills
        </p>
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-2">
          {skills.map((skill, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-mono border border-line rounded-[2px] bg-paper text-ink"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(i)}
                className="text-muted hover:text-danger focus:outline-none focus:ring-1 focus:ring-brand rounded-[2px]"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted italic">No skills added yet. Type a skill above and press Enter.</p>
      )}
    </div>
  );
}
