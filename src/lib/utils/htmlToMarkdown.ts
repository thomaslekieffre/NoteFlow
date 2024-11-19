import TurndownService from "turndown";

export function htmlToMarkdown(html: string): string {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "_",
  });

  turndownService.addRule("codeBlock", {
    filter: ["pre"],
    replacement: function (content, node) {
      return "```\n" + content + "\n```\n";
    },
  });

  turndownService.addRule("inlineCode", {
    filter: ["code"],
    replacement: function (content) {
      return "`" + content + "`";
    },
  });

  return turndownService.turndown(html);
}

export function downloadMarkdown(title: string, content: string) {
  const markdown = htmlToMarkdown(content);
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
