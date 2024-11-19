declare module "html-to-docx" {
  export default function HTMLtoDOCX(
    html: string,
    headerHTML: string | null,
    options?: {
      table?: { row?: { cantSplit?: boolean } };
      footer?: boolean;
      pageNumber?: boolean;
      font?: string;
      margins?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      };
    }
  ): Promise<Buffer>;
}
