
import { renderTemplate1 } from "./template1.js";

export const TEMPLATES = {
  template1: {
    id: "template1",
    name: "Editorial",
    render: renderTemplate1,
  },
};

export function renderTemplate(data = {}) {
  const templateId = data.template || "template1";
  const template = TEMPLATES[templateId];

  if (!template) {
    throw new Error(`Unknown template: ${templateId}`);
  }

  return template.render(data);
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
