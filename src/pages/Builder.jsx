/**
 * Builder page: multi-step form for building a portfolio.
 * Layout:
 * - On >= 1024px: form on left, PreviewPanel on right.
 * - On < 1024px: Edit | Preview toggle.
 * Owner: Member B (Builder page layout & navigation)
 */
import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import useBuilder from '../hooks/useBuilder';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import ProfileStep from '../builder/ProfileStep';
import ContactsStep from '../builder/ContactsStep';
import SkillsStep from '../builder/SkillsStep';
import ProjectsStep from '../builder/ProjectsStep';
import TemplateStep from '../builder/TemplateStep';
import ExportStep from '../builder/ExportStep';
import PreviewPanel from '../builder/PreviewPanel';
import SaveStatus from '../builder/SaveStatus';
import { ArrowLeft, Eye, Edit3 } from 'lucide-react';

const STEPS = ['profile', 'contacts', 'skills', 'projects', 'template', 'export'];
const STEP_LABELS = {
  profile: 'Profile',
  contacts: 'Contacts',
  skills: 'Skills',
  projects: 'Projects',
  template: 'Template',
  export: 'Export',
};

export default function Builder() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentStep = searchParams.get('step') || 'profile';
  const stepIndex = Math.max(0, STEPS.indexOf(currentStep));

  const [mobileTab, setMobileTab] = useState('edit'); // 'edit' | 'preview'

  const builder = useBuilder(id);
  const {
    data,
    title,
    template,
    status,
    loadError,
    loadingData,
    updateField,
    addSkill,
    removeSkill,
    addProject,
    updateProject,
    removeProject,
    setTemplate,
    retrySave,
  } = builder;

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={36} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <ErrorMessage>{loadError}</ErrorMessage>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  const goToStep = (step) => {
    setSearchParams({ step });
    setMobileTab('edit');
  };

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      goToStep(STEPS[stepIndex + 1]);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      goToStep(STEPS[stepIndex - 1]);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'profile':
        return <ProfileStep data={data} updateField={updateField} />;
      case 'contacts':
        return <ContactsStep data={data} updateField={updateField} />;
      case 'skills':
        return (
          <SkillsStep
            skills={data?.skills || []}
            addSkill={addSkill}
            removeSkill={removeSkill}
          />
        );
      case 'projects':
        return (
          <ProjectsStep
            projects={data?.projects || []}
            addProject={addProject}
            updateProject={updateProject}
            removeProject={removeProject}
          />
        );
      case 'template':
        return (
          <TemplateStep
            currentTemplate={template}
            setTemplate={setTemplate}
          />
        );
      case 'export':
        return <ExportStep data={data} />;
      default:
        return <ProfileStep data={data} updateField={updateField} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {/* Top Header */}
      <header className="border-b border-line bg-paper sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-1 text-muted hover:text-ink transition-colors rounded-[2px]"
              title="Return to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => updateField('title', e.target.value.slice(0, 80))}
              className="font-serif font-bold text-base bg-transparent border-b border-transparent hover:border-line focus:border-brand focus:outline-none px-1 py-0.5 truncate max-w-[200px] sm:max-w-[320px]"
              title="Click to rename portfolio"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile View Toggle */}
            <div className="flex lg:hidden border border-line rounded-[2px] overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileTab('edit')}
                className={`px-3 py-1 text-xs font-mono flex items-center gap-1 ${
                  mobileTab === 'edit' ? 'bg-ink text-paper' : 'text-muted'
                }`}
              >
                <Edit3 className="h-3 w-3" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className={`px-3 py-1 text-xs font-mono flex items-center gap-1 ${
                  mobileTab === 'preview' ? 'bg-ink text-paper' : 'text-muted'
                }`}
              >
                <Eye className="h-3 w-3" />
                Preview
              </button>
            </div>

            <SaveStatus status={status} onRetry={retrySave} />
          </div>
        </div>
      </header>

      {/* Steps Navigation Bar */}
      <nav className="border-b border-line bg-paper/60 backdrop-blur-sm sticky top-[49px] z-10">
        <div className="max-w-[1400px] mx-auto px-4 flex gap-1 overflow-x-auto scrollbar-none">
          {STEPS.map((step, idx) => (
            <button
              key={step}
              onClick={() => goToStep(step)}
              className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                currentStep === step
                  ? 'border-brand text-brand font-semibold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {idx + 1}. {STEP_LABELS[step]}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Workspace */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          {/* Form Step Column */}
          <div
            className={`lg:col-span-6 xl:col-span-6 flex flex-col justify-between ${
              mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="bg-paper border border-line p-6 rounded-[2px]">
              {renderCurrentStep()}
            </div>

            {/* Step navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-line mt-6">
              <Button
                variant="secondary"
                onClick={goBack}
                disabled={stepIndex === 0}
              >
                Back
              </Button>
              <span className="text-xs font-mono text-muted">
                Step {stepIndex + 1} of {STEPS.length}
              </span>
              <Button
                variant="primary"
                onClick={goNext}
                disabled={stepIndex === STEPS.length - 1}
              >
                Next
              </Button>
            </div>
          </div>

          {/* Live Preview Column */}
          <div
            className={`lg:col-span-6 xl:col-span-6 sticky top-[105px] h-[calc(100vh-130px)] ${
              mobileTab === 'edit' ? 'hidden lg:block' : 'block'
            }`}
          >
            <PreviewPanel data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
