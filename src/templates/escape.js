
export function escapeHtml(text) {
  if (typeof text !== "string") {
    return "";
  }

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function safeUrl(url) {
  if (typeof url !== "string") {
    return "";
  }

  const trimmedUrl = url.trim();

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  if (/^mailto:/i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return "";
}
