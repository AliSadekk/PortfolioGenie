import { escapeHtml, safeUrl } from '../templates/escape.js';

/**
 * generateCV(data) → HTML string
 * Builds a print-ready, single-file CV from the portfolio data.
 * Designed to be opened in a browser and printed / saved as PDF.
 * Owner: Person B
 */
export function generateCV(data = {}) {
  const profile = data.profile ?? {};
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];

  const fullName = escapeHtml(profile.fullName || 'Your Name');
  const jobTitle = escapeHtml(profile.jobTitle || '');
  const bio = escapeHtml(profile.bio || '');
  const email = profile.email ? escapeHtml(profile.email) : '';
  const github = safeUrl(profile.github || '');
  const linkedin = safeUrl(profile.linkedin || '');

  /* ── Skills section ── */
  const skillsHtml =
    skills.length > 0
      ? `
  <section class="cv-section">
    <h2>Technical Skills</h2>
    <ul class="skills-list">
      ${skills
        .filter((s) => typeof s === 'string' && s.trim())
        .map((s) => `<li>${escapeHtml(s)}</li>`)
        .join('')}
    </ul>
  </section>`
      : '';

  /* ── Projects section ── */
  const projectsHtml =
    projects.length > 0
      ? `
  <section class="cv-section">
    <h2>Projects</h2>
    ${projects
      .filter((p) => p && typeof p === 'object')
      .map((p) => {
        const name = escapeHtml(p.name || 'Untitled Project');
        const desc = escapeHtml(p.description || '');
        const techs = Array.isArray(p.techStack)
          ? p.techStack.filter((t) => typeof t === 'string' && t.trim())
          : [];
        const repo = safeUrl(p.repoUrl || '');
        const live = safeUrl(p.liveUrl || '');
        const techBadges = techs.length
          ? `<span class="tech-list">${techs.map((t) => escapeHtml(t)).join(' · ')}</span>`
          : '';
        const links = [
          repo ? `<a href="${escapeHtml(repo)}" class="cv-link">GitHub ↗</a>` : '',
          live ? `<a href="${escapeHtml(live)}" class="cv-link">Live Demo ↗</a>` : '',
        ]
          .filter(Boolean)
          .join('  ');
        return `
        <div class="project-entry">
          <div class="project-header">
            <strong>${name}</strong>
            ${links ? `<span class="project-links">${links}</span>` : ''}
          </div>
          ${techBadges}
          ${desc ? `<p class="project-desc">${desc}</p>` : ''}
        </div>`;
      })
      .join('')}
  </section>`
      : '';

  /* ── Contact row ── */
  const contactParts = [
    email ? `<span>${email}</span>` : '',
    github
      ? `<a href="${escapeHtml(github)}" class="cv-link">${escapeHtml(github.replace('https://', ''))}</a>`
      : '',
    linkedin
      ? `<a href="${escapeHtml(linkedin)}" class="cv-link">${escapeHtml(linkedin.replace('https://', ''))}</a>`
      : '',
  ].filter(Boolean);

  const contactHtml = contactParts.length
    ? `<p class="contact-row">${contactParts.join('<span class="sep"> · </span>')}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullName} — CV</title>
  <style>
    /* ── Reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Typography & Colour ── */
    :root {
      --ink: #1B1B1B;
      --muted: #5C574E;
      --brand: #1F4D3A;
      --border: #D6CFC2;
      --paper: #FFFFFF;
    }

    body {
      font-family: 'Georgia', serif;
      font-size: 11pt;
      line-height: 1.55;
      color: var(--ink);
      background: var(--paper);
      padding: 0;
    }

    /* ── Page layout ── */
    .cv-page {
      max-width: 760px;
      margin: 0 auto;
      padding: 48px 56px;
    }

    /* ── Header ── */
    .cv-header {
      border-bottom: 2px solid var(--brand);
      padding-bottom: 16px;
      margin-bottom: 24px;
    }

    .cv-header h1 {
      font-size: 26pt;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--ink);
      line-height: 1.1;
    }

    .cv-header .job-title {
      font-size: 12pt;
      color: var(--brand);
      font-weight: 600;
      margin-top: 4px;
      font-family: Arial, sans-serif;
    }

    .contact-row {
      margin-top: 10px;
      font-size: 9.5pt;
      color: var(--muted);
      font-family: Arial, sans-serif;
    }

    .sep { color: var(--border); }

    .cv-link {
      color: var(--brand);
      text-decoration: none;
    }

    /* ── Bio ── */
    .cv-bio {
      font-size: 10.5pt;
      color: var(--muted);
      margin-bottom: 24px;
      max-width: 620px;
    }

    /* ── Sections ── */
    .cv-section {
      margin-bottom: 24px;
    }

    .cv-section h2 {
      font-size: 10pt;
      font-family: Arial, sans-serif;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--brand);
      border-bottom: 1px solid var(--border);
      padding-bottom: 4px;
      margin-bottom: 12px;
    }

    /* ── Skills ── */
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 10px;
      list-style: none;
      font-family: Arial, sans-serif;
      font-size: 10pt;
    }

    .skills-list li {
      background: #F4F4F0;
      border: 1px solid var(--border);
      padding: 2px 8px;
      border-radius: 2px;
    }

    /* ── Projects ── */
    .project-entry {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #EEE;
    }

    .project-entry:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .project-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 4px;
    }

    .project-header strong {
      font-size: 11pt;
    }

    .project-links {
      font-size: 9pt;
      font-family: Arial, sans-serif;
      color: var(--muted);
    }

    .project-links .cv-link {
      margin-left: 8px;
    }

    .tech-list {
      display: block;
      font-size: 9pt;
      font-family: Arial, sans-serif;
      color: var(--muted);
      margin-top: 2px;
    }

    .project-desc {
      font-size: 10.5pt;
      color: var(--muted);
      margin-top: 4px;
    }

    /* ── Footer ── */
    .cv-footer {
      margin-top: 36px;
      padding-top: 10px;
      border-top: 1px solid var(--border);
      font-size: 8.5pt;
      color: var(--border);
      font-family: Arial, sans-serif;
      text-align: right;
    }

    /* ── Print ── */
    @media print {
      body { background: white; }
      .cv-page { padding: 0; }
      .cv-link { color: var(--brand) !important; }
      a[href]::after { content: ''; } /* suppress URL print in older browsers */
    }
  </style>
</head>
<body>
  <div class="cv-page">
    <header class="cv-header">
      <h1>${fullName}</h1>
      ${jobTitle ? `<p class="job-title">${jobTitle}</p>` : ''}
      ${contactHtml}
    </header>

    ${bio ? `<p class="cv-bio">${bio}</p>` : ''}

    ${skillsHtml}

    ${projectsHtml}

    <footer class="cv-footer">
      Generated by PortfolioGenie · ${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
    </footer>
  </div>
</body>
</html>`;
}
