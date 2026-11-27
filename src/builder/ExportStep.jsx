import { useState } from 'react';
import Button from '../components/Button';
import { Download, FileText, Globe } from 'lucide-react';
import { renderTemplate } from '../templates/index';
import { generateCV } from '../lib/cv';

/**
 * ExportStep — Person B
 * Two export paths:
 *   1. Download portfolio as a zip (HTML + CSS + JS)
 *   2. Generate & download CV as HTML
 */
export default function ExportStep({ data }) {
  const [downloading, setDownloading] = useState(false);
  const [cvDownloading, setCvDownloading] = useState(false);

  /* ── Portfolio ZIP download ── */
  const handleDownloadPortfolio = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      // Dynamic import to keep bundle lean
      const { default: JSZip } = await import('jszip');
      const files = renderTemplate(data);
      const zip = new JSZip();
      Object.entries(files).forEach(([name, content]) => {
        zip.file(name, content);
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      triggerDownload(blob, 'portfolio.zip', 'application/zip');
    } catch {
      // Fallback: download only HTML
      const files = renderTemplate(data);
      const blob = new Blob([files['index.html']], { type: 'text/html' });
      triggerDownload(blob, 'portfolio.html', 'text/html');
    } finally {
      setDownloading(false);
    }
  };

  /* ── CV HTML download ── */
  const handleDownloadCV = () => {
    if (cvDownloading) return;
    setCvDownloading(true);
    try {
      const html = generateCV(data);
      const blob = new Blob([html], { type: 'text/html' });
      const name = data?.profile?.fullName
        ? `${data.profile.fullName.replace(/\s+/g, '_')}_CV.html`
        : 'CV.html';
      triggerDownload(blob, name, 'text/html');
    } finally {
      setCvDownloading(false);
    }
  };

  const profileComplete =
    data?.profile?.fullName && data?.profile?.jobTitle;
  const hasContent =
    profileComplete &&
    ((data?.skills?.length ?? 0) > 0 || (data?.projects?.length ?? 0) > 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-serif font-semibold">Export</h2>
        <p className="text-sm text-muted mt-1">
          Download your portfolio site or a printable CV based on your data.
        </p>
      </div>

      {!profileComplete && (
        <div className="p-4 border border-accent/40 bg-accent/5 rounded-[2px] text-sm text-accent">
          Complete at least your <strong>Full name</strong> and{' '}
          <strong>Job title</strong> in the Profile step before exporting.
        </div>
      )}

      {/* Portfolio export card */}
      <div className="border border-line rounded-[2px] p-6 space-y-3">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-brand mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold font-serif text-base">Portfolio Website</h3>
            <p className="text-sm text-muted mt-0.5">
              Downloads a self-contained HTML + CSS + JS bundle you can host anywhere.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handleDownloadPortfolio}
          disabled={!profileComplete || downloading}
          className="w-full justify-center"
        >
          <Download className="h-4 w-4" />
          {downloading ? 'Preparing…' : 'Download Portfolio'}
        </Button>
      </div>

      {/* CV export card */}
      <div className="border border-line rounded-[2px] p-6 space-y-3">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-brand mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold font-serif text-base">CV / Résumé</h3>
            <p className="text-sm text-muted mt-0.5">
              Generates a clean, print-ready CV from your profile, skills, and
              projects. Open in any browser and use <kbd>Ctrl + P</kbd> to print
              or save as PDF.
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={handleDownloadCV}
          disabled={!hasContent || cvDownloading}
          className="w-full justify-center"
        >
          <FileText className="h-4 w-4" />
          {cvDownloading ? 'Generating…' : 'Download CV'}
        </Button>
        {!hasContent && profileComplete && (
          <p className="text-xs text-muted font-mono">
            Add at least one skill or project to enable CV export.
          </p>
        )}
      </div>
    </div>
  );
}

function triggerDownload(blob, filename, type) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.type = type;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
