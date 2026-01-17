const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatInline = (text: string) => {
  let escaped = escapeHtml(text);
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  escaped = escaped.replace(/\*(.+?)\*/g, "<em>$1</em>");
  escaped = escaped.replace(/`(.+?)`/g, "<code>$1</code>");
  return escaped;
};

export const renderMarkdown = (input: string): string => {
  const lines = input.split(/\r?\n/);
  let html = "";
  let inList = false;
  let inCode = false;

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        html += "</code></pre>";
        inCode = false;
      } else {
        html += "<pre><code>";
        inCode = true;
      }
      return;
    }

    if (inCode) {
      html += `${escapeHtml(line)}\n`;
      return;
    }

    if (trimmed.startsWith("- ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${formatInline(trimmed.slice(2))}</li>`;
      return;
    }

    if (inList) {
      html += "</ul>";
      inList = false;
    }

    if (trimmed.startsWith("### ")) {
      html += `<h3>${formatInline(trimmed.slice(4))}</h3>`;
    } else if (trimmed.startsWith("## ")) {
      html += `<h2>${formatInline(trimmed.slice(3))}</h2>`;
    } else if (trimmed.startsWith("# ")) {
      html += `<h1>${formatInline(trimmed.slice(2))}</h1>`;
    } else if (trimmed === "") {
      html += "<br />";
    } else {
      html += `<p>${formatInline(trimmed)}</p>`;
    }
  });

  if (inList) {
    html += "</ul>";
  }
  if (inCode) {
    html += "</code></pre>";
  }

  return html;
};
