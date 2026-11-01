

import { renderTemplate1 } from "./template1.js";

export const TEMPLATES = [
  {
    id: "template1",
    name: "Editorial",
    description: "Light, serif headings, printed-magazine feel.",
  },
  {
    id: "template2",
    name: "Terminal",
    description: "Dark, monospace, developer feel.",
  },
];

export function renderTemplate(data = {}) {
  const requestedTemplate = TEMPLATES.find(
    (template) => template.id === data.template
  );

  // Template 2 لسه مش منفذ، فبنرجع للقالب الأول.
  const selectedTemplate =
    requestedTemplate?.id === "template1" ? requestedTemplate : null;

  if (!selectedTemplate) {
    return renderTemplate1(data);
  }

  return renderTemplate1(data);
}


export function buildPreviewHtml(files) {
  let html = files["index.html"] || "";
  const css = files["style.css"] || "";
  const js = files["script.js"] || "";

  const safeCss = css.replace(/<\/style/gi, "<\\/style");
  const safeJs = js.replace(/<\/script/gi, "<\\/script");

  html = html.replace(
    /<link rel="stylesheet" href="\.\/style\.css">/i,
    `<style>${safeCss}</style>`
  );

  html = html.replace(
    /<script src="\.\/script\.js" defer><\/script>/i,
    `<script defer>${safeJs}</script>`
  );

  return html;
}
