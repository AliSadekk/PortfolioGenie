
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

function hasControlCharacters(value) {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);

    if (code <= 31 || code === 127) {
      return true;
    }
  }

  return false;
}

export function safeUrl(url) {
  if (typeof url !== "string") {
    return "";
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl || hasControlCharacters(trimmedUrl)) {
    return "";
  }

  try {
    if (/^https?:\/\//i.test(trimmedUrl)) {
      const parsedUrl = new URL(trimmedUrl);

      if (
        (parsedUrl.protocol === "http:" ||
          parsedUrl.protocol === "https:") &&
        parsedUrl.hostname &&
        !parsedUrl.username &&
        !parsedUrl.password
      ) {
        return trimmedUrl;
      }

      return "";
    }

    if (/^mailto:/i.test(trimmedUrl)) {
      const parsedUrl = new URL(trimmedUrl);

      if (
        parsedUrl.protocol === "mailto:" &&
        /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(parsedUrl.pathname)
      ) {
        return trimmedUrl;
      }
    }
  } catch {
    return "";
  }

  return "";
}
