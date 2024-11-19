declare module "html-pdf-node" {
  interface Options {
    format?: string;
    path?: string;
    printBackground?: boolean;
    landscape?: boolean;
    margin?: {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    };
  }

  interface File {
    content?: string;
    url?: string;
  }

  interface HtmlPdfNode {
    generatePdf(file: File, options?: Options): Promise<Buffer>;
    generatePdfs(files: File[], options?: Options): Promise<Buffer[]>;
  }

  const htmlPdfNode: HtmlPdfNode;
  export default htmlPdfNode;
}
