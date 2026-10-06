import { jsPDF } from "jspdf";

const SENTIMENT_LABELS = {
  positive: "Positive",
  negative: "Negative",
  neutral: "Neutral",
  mixed: "Mixed",
};

const pad = (value) => String(value).padStart(2, "0");

const formatDate = (date = new Date()) =>
  `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

const fileStamp = (date = new Date()) =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(
    date.getHours()
  )}${pad(date.getMinutes())}`;

const sourceLabel = (source = {}) =>
  source.title || source.url || "Untitled source";

/**
 * Reduce inline markdown (bold, italics, links, code) to plain text so it can
 * be written into a PDF without marker characters leaking through.
 */
export function stripInlineMarkdown(text) {
  return String(text ?? "")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/(^|\s)_([^_]+)_(?=\s|$)/g, "$1$2")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Serialize the workspace sources and chat transcript to a Markdown document.
 */
export function buildMarkdown(sources = [], messages = []) {
  const lines = [];

  lines.push("# BriefLab Export", "");
  lines.push(`_Generated ${formatDate()}_`, "");

  if (sources.length) {
    lines.push("## Sources", "");
    sources.forEach((source, index) => {
      lines.push(`### ${index + 1}. ${sourceLabel(source)}`, "");
      lines.push(`- **URL:** ${source.url || "—"}`);
      lines.push(`- **Type:** ${source.source_type || "—"}`);
      if (source.sentiment) {
        const label = SENTIMENT_LABELS[source.sentiment] || source.sentiment;
        const score =
          typeof source.sentiment_score === "number"
            ? ` (${source.sentiment_score.toFixed(2)})`
            : "";
        lines.push(`- **Sentiment:** ${label}${score}`);
      }
      if (source.topics && source.topics.length) {
        lines.push(`- **Topics:** ${source.topics.join(", ")}`);
      }
      lines.push("", "#### Summary", "", source.summary || "_No summary available._", "");
    });
    lines.push("---", "");
  }

  lines.push("## Conversation", "");
  if (!messages.length) {
    lines.push("_No conversation yet._", "");
  } else {
    messages.forEach((message) => {
      lines.push(`### ${message.role === "user" ? "You" : "BriefLab"}`, "");
      lines.push(message.content || "", "");

      if (message.citations && message.citations.length) {
        lines.push("**Citations**", "");
        message.citations.forEach((citation) => {
          const label = citation.title || citation.url || "Source";
          const excerpt = citation.excerpt ? ` — ${citation.excerpt}` : "";
          lines.push(`- ${label}${excerpt}`);
        });
        lines.push("");
      }
    });
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function downloadBlob(content, filename, mime) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Download the workspace as a `.md` file. */
export function exportMarkdown(sources, messages) {
  downloadBlob(
    buildMarkdown(sources, messages),
    `brieflab-export-${fileStamp()}.md`,
    "text/markdown;charset=utf-8"
  );
}

/**
 * Render a Markdown string into a jsPDF document through a small block parser.
 * Kept dependency-light: headings, bullets, rules, code fences and paragraphs.
 */
export function buildPdf(sources, messages) {
  const markdown = buildMarkdown(sources, messages);
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeText = (
    text,
    { size = 11, style = "normal", color = [30, 41, 59], indent = 0, lineGap = 3, spaceAfter = 6 } = {}
  ) => {
    if (text === "") {
      y += spaceAfter;
      return;
    }
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, maxWidth - indent);
    lines.forEach((line) => {
      ensureSpace(size + lineGap);
      doc.text(line, margin + indent, y);
      y += size + lineGap;
    });
    y += spaceAfter;
  };

  let inCode = false;
  const lines = markdown.split("\n");

  lines.forEach((rawLine) => {
    const line = rawLine.replace(/\s+$/, "");

    if (/^```/.test(line.trim())) {
      inCode = !inCode;
      return;
    }
    if (inCode) {
      writeText(stripInlineMarkdown(line) || " ", {
        size: 9,
        color: [71, 85, 105],
        indent: 14,
        lineGap: 2,
        spaceAfter: 0,
      });
      return;
    }
    if (!line.trim()) {
      y += 6;
      return;
    }
    if (line.startsWith("### ")) {
      writeText(stripInlineMarkdown(line.slice(4)), {
        size: 12,
        style: "bold",
        color: [15, 23, 42],
        spaceAfter: 4,
      });
      return;
    }
    if (line.startsWith("## ")) {
      writeText(stripInlineMarkdown(line.slice(3)), {
        size: 15,
        style: "bold",
        color: [8, 47, 73],
        spaceAfter: 6,
      });
      return;
    }
    if (line.startsWith("# ")) {
      writeText(stripInlineMarkdown(line.slice(2)), {
        size: 20,
        style: "bold",
        color: [8, 47, 73],
        spaceAfter: 10,
      });
      return;
    }
    if (/^-{3,}$/.test(line.trim())) {
      ensureSpace(14);
      doc.setDrawColor(203, 213, 225);
      doc.line(margin, y, pageWidth - margin, y);
      y += 14;
      return;
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      const indent = 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      const wrapped = doc.splitTextToSize(stripInlineMarkdown(bullet[1]), maxWidth - indent);
      wrapped.forEach((text, index) => {
        ensureSpace(15);
        if (index === 0) {
          doc.text("\u2022", margin + 3, y);
        }
        doc.text(text, margin + indent, y);
        y += 15;
      });
      y += 2;
      return;
    }

    writeText(stripInlineMarkdown(line));
  });

  return doc;
}

/** Download the workspace as a `.pdf` file. */
export function exportPdf(sources, messages) {
  buildPdf(sources, messages).save(`brieflab-export-${fileStamp()}.pdf`);
}
