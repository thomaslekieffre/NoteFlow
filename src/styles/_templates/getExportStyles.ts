export function getExportStyles() {
  return `
    body {
      font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif;
      color: #000000;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }

    .document {
      max-width: 100%;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 3rem;
    }

    .main-title {
      font-size: 24px;
      font-weight: bold;
      margin: 0 0 1rem 0;
      padding: 0;
    }

    .separator {
      border: none;
      border-top: 2px solid #000000;
      margin: 0;
      padding: 0;
      width: 100%;
    }

    .content {
      margin-top: 2rem;
    }

    h1, h2, h3 {
      color: #000000;
      font-weight: bold;
    }

    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }

    pre {
      background: #1e1e1e;
      border-radius: 0.5rem;
      color: #d4d4d4;
      font-family: "Courier New", monospace;
      padding: 0.75rem 1rem;
      margin: 1em 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    pre code {
      background: none;
      font-size: 0.875rem;
      padding: 0;
      color: #d4d4d4;
      font-family: "Courier New", monospace;
    }

    code {
      background: #1e1e1e;
      border-radius: 4px;
      padding: 2px 4px;
      font-family: "Courier New", monospace;
      font-size: 0.9em;
      color: #d4d4d4;
    }
  `;
}
