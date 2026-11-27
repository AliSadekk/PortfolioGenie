import { useMemo } from 'react';
import { renderTemplate, buildPreviewHtml } from '../templates/index.js';

/**
 * PreviewPanel — accepts either:
 *   - data (portfolio data object) → renders via renderTemplate
 *   - files (pre-rendered {index.html, style.css, ...} object)
 *
 * Builder.jsx passes `data`; the old demo app passed `files`.
 */
export default function PreviewPanel({ data, files }) {
  const previewHtml = useMemo(() => {
    if (data) {
      const rendered = renderTemplate(data);
      return buildPreviewHtml(rendered);
    }
    if (files && files['index.html']) {
      return buildPreviewHtml(files);
    }
    return null;
  }, [data, files]);

  if (!previewHtml) {
    return (
      <div className="h-full flex flex-col items-center justify-center border border-line rounded-[2px] bg-paper/60 text-muted text-sm gap-2">
        <span className="font-mono text-xs">PREVIEW</span>
        <p>Fill in your profile to see a live preview here.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col rounded-[2px] overflow-hidden border border-line">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-line bg-paper/80 backdrop-blur-sm">
        <span className="text-xs font-mono text-muted uppercase tracking-wider">Live Preview</span>
      </div>
      <iframe
        title="Portfolio preview"
        srcDoc={previewHtml}
        sandbox=""
        className="flex-1 w-full"
        style={{ background: '#F4EFE6', border: 'none', minHeight: 0 }}
      />
    </div>
  );
}
