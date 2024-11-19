import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { getExportStyles } from "@/styles/_templates/getExportStyles";
import hljs from "highlight.js";

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.addStyleTag({
      url: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css",
    });

    await page.addScriptTag({
      url: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js",
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>${getExportStyles()}</style>
        </head>
        <body>
          <div class="document">
            <div class="header">
              <h1 class="main-title">${title}</h1>
              <hr class="separator" />
            </div>
            <div class="content">
              ${content}
            </div>
          </div>
          <script>
            document.addEventListener('DOMContentLoaded', (event) => {
              document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
              });
            });
          </script>
        </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.addStyleTag({
      content: `
        pre {
          background-color: #1e1e1e !important;
          border-radius: 0.5rem !important;
          padding: 0.75rem 1rem !important;
          margin: 1em 0 !important;
          color: #d4d4d4 !important;
        }
        code {
          font-family: "Courier New", monospace !important;
          background-color: #1e1e1e !important;
          color: #d4d4d4 !important;
        }
      `,
    });

    const pdf = await page.pdf({
      format: "A4",
      margin: { top: "40px", right: "40px", bottom: "40px", left: "40px" },
      printBackground: true,
    });

    await browser.close();

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("Erreur d'export:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'export" },
      { status: 500 }
    );
  }
}
