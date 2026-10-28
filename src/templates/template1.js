
import { escapeHtml, safeUrl } from "./escape.js";

export function renderTemplate1(data = {}) {
  const profile = data.profile ?? {};

  const fullName = escapeHtml(profile.fullName || "Your Name");
  const jobTitle = escapeHtml(profile.jobTitle || "Your Profession");
  const bio = escapeHtml(profile.bio || "");
  const email = safeUrl(
    profile.email ? `mailto:${profile.email}` : ""
  );

  const skills = Array.isArray(data.skills) ? data.skills : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];

  const skillsHtml = skills
    .filter((skill) => typeof skill === "string" && skill.trim())
    .map((skill) => `<li>${escapeHtml(skill)}</li>`)
    .join("");

  const projectsHtml = projects
    .filter((project) => project && typeof project === "object")
    .map((project) => {
      const name = escapeHtml(project.name || "Untitled Project");
      const description = escapeHtml(project.description || "");
      const repoUrl = safeUrl(project.repoUrl || "");
      const liveUrl = safeUrl(project.liveUrl || "");

      return `
        <article class="project">
          <h3>${name}</h3>
          ${description ? `<p>${description}</p>` : ""}
          <div class="project-links">
            ${repoUrl ? `<a href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener noreferrer">Source code</a>` : ""}
            ${liveUrl ? `<a href="${escapeHtml(liveUrl)}" target="_blank" rel="noopener noreferrer">Live demo</a>` : ""}
          </div>
        </article>
      `;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${bio}">
  <title>${fullName} — ${jobTitle}</title>
  <link rel="stylesheet" href="./style.css">
  <script src="./script.js" defer></script>
</head>
<body>
  <header class="site-header">
    <a class="site-name" href="#home">${fullName}</a>
    <span class="site-label">PORTFOLIO</span>
  </header>

  <main id="home">
    <section class="intro" aria-labelledby="intro-title">
      <p class="eyebrow">ABOUT ME</p>
      <h1 id="intro-title">${fullName}</h1>
      <p class="job-title">${jobTitle}</p>
      ${bio ? `<p class="bio">${bio}</p>` : ""}
      ${email ? `<a class="contact-link" href="${escapeHtml(email)}">Get in touch</a>` : ""}
    </section>

    ${skillsHtml ? `
    <section class="content-section" aria-labelledby="skills-title">
      <h2 id="skills-title">Skills</h2>
      <ul class="skills-list">${skillsHtml}</ul>
    </section>` : ""}

    ${projectsHtml ? `
    <section class="content-section" aria-labelledby="projects-title">
      <h2 id="projects-title">Selected Projects</h2>
      <div class="projects-list">${projectsHtml}</div>
    </section>` : ""}
  </main>

  <footer class="site-footer">
    <p>${fullName} · Personal Portfolio</p>
  </footer>
</body>
</html>`;

  const css = `
:root {
  color-scheme: light;
  --paper: #F4EFE6;
  --ink: #1B1B1B;
  --muted: #5C574E;
  --brand: #1F4D3A;
  --accent: #C4501B;
  --border: #D6CFC2;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.7;
}

.site-header,
main,
.site-footer {
  width: min(100% - 40px, 720px);
  margin-inline: auto;
}

.site-header {
  min-height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--border);
}

.site-name {
  color: var(--ink);
  font-weight: 700;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.site-label,
.eyebrow {
  color: var(--brand);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.intro {
  padding-block: 72px;
  border-bottom: 1px solid var(--border);
}

h1 {
  margin: 12px 0;
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  line-height: 1.08;
  letter-spacing: -0.045em;
  overflow-wrap: anywhere;
}

.job-title {
  color: var(--brand);
  font-size: 1.25rem;
  font-weight: 600;
}

.bio {
  max-width: 600px;
  color: var(--muted);
}

.contact-link,
.project-links a {
  color: var(--brand);
  font-weight: 700;
  text-underline-offset: 4px;
}

.contact-link {
  display: inline-block;
  margin-top: 12px;
}

.content-section {
  padding-block: 40px;
  border-bottom: 1px solid var(--border);
}

h2 {
  margin: 0 0 24px;
  font-size: 1.75rem;
  line-height: 1.25;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.skills-list li {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 2px;
  overflow-wrap: anywhere;
}

.projects-list {
  display: grid;
  gap: 24px;
}

.project {
  padding-top: 20px;
  border-top: 2px solid var(--brand);
  overflow-wrap: anywhere;
}

.project h3 {
  margin: 0;
  font-size: 1.25rem;
}

.project p {
  color: var(--muted);
}

.project-links {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

a:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 4px;
}

.site-footer {
  padding-block: 24px;
  color: var(--muted);
  font-size: 0.875rem;
  overflow-wrap: anywhere;
}

@media (min-width: 768px) {
  .site-header,
  main,
  .site-footer {
    width: min(100% - 64px, 720px);
  }

  .intro {
    padding-block: 96px;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
`;

  return {
    "index.html": html,
    "style.css": css,
    "script.js": "",
  };
}
