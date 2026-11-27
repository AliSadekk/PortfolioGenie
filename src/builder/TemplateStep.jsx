import { TEMPLATES } from '../templates/index';

/**
 * TemplateStep — Person B
 * Lets the user pick between available portfolio templates.
 * Shows a live name + description card for each template.
 */
export default function TemplateStep({ currentTemplate, setTemplate }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif font-semibold">Template</h2>
        <p className="text-sm text-muted mt-1">
          Choose a visual style for your portfolio website.
        </p>
      </div>

      <div className="grid gap-4">
        {TEMPLATES.map((tpl) => {
          const isSelected = currentTemplate === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setTemplate(tpl.id)}
              aria-pressed={isSelected}
              className={`w-full text-left p-4 border-2 rounded-[2px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                isSelected
                  ? 'border-brand bg-brand/5'
                  : 'border-line hover:border-brand/40'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold font-serif text-base">{tpl.name}</p>
                  <p className="text-sm text-muted mt-0.5">{tpl.description}</p>
                </div>
                {isSelected && (
                  <span className="shrink-0 text-xs font-mono text-brand border border-brand/30 px-2 py-0.5 rounded-[2px]">
                    Selected
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted font-mono">
        More templates coming soon. The preview on the right updates instantly.
      </p>
    </div>
  );
}
