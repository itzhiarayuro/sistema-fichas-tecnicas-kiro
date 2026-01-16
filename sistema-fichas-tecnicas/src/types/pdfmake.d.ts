/**
 * Declaraciones de tipos para pdfmake
 * Resuelve errores de módulos sin tipos
 */

declare module 'pdfmake/build/pdfmake' {
  import type { TCreatedPdf, TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces';
  
  interface PdfMakeStatic {
    createPdf(docDefinition: TDocumentDefinitions): TCreatedPdf;
    vfs: Record<string, string>;
    fonts: TFontDictionary;
  }
  
  const pdfMake: PdfMakeStatic;
  export default pdfMake;
  export = pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  const vfs: Record<string, string>;
  export default vfs;
  export { vfs };
  export const pdfMake: { vfs: Record<string, string> };
}

declare module 'pdfmake/interfaces' {
  export interface TDocumentDefinitions {
    content: any;
    styles?: Record<string, any>;
    defaultStyle?: any;
    pageSize?: string | { width: number; height: number };
    pageOrientation?: 'portrait' | 'landscape';
    pageMargins?: [number, number, number, number] | number;
    header?: any;
    footer?: any;
    info?: {
      title?: string;
      author?: string;
      subject?: string;
      keywords?: string;
      creator?: string;
      producer?: string;
    };
    watermark?: any;
    background?: any;
    images?: Record<string, string>;
    compress?: boolean;
    userPassword?: string;
    ownerPassword?: string;
    permissions?: any;
  }

  export interface TCreatedPdf {
    getBlob(callback: (blob: Blob) => void): void;
    getBase64(callback: (base64: string) => void): void;
    getBuffer(callback: (buffer: ArrayBuffer) => void): void;
    getDataUrl(callback: (dataUrl: string) => void): void;
    download(defaultFileName?: string, callback?: () => void): void;
    open(options?: any, win?: Window): void;
    print(options?: any, win?: Window): void;
  }

  export interface TFontDictionary {
    [fontName: string]: {
      normal?: string;
      bold?: string;
      italics?: string;
      bolditalics?: string;
    };
  }

  export interface ContentTable {
    table: {
      widths?: (string | number)[];
      heights?: (string | number)[] | ((row: number) => number);
      headerRows?: number;
      body: any[][];
      dontBreakRows?: boolean;
      keepWithHeaderRows?: number;
    };
    layout?: string | {
      hLineWidth?: (i: number, node: any) => number;
      vLineWidth?: (i: number, node: any) => number;
      hLineColor?: (i: number, node: any) => string;
      vLineColor?: (i: number, node: any) => string;
      paddingLeft?: (i: number, node: any) => number;
      paddingRight?: (i: number, node: any) => number;
      paddingTop?: (i: number, node: any) => number;
      paddingBottom?: (i: number, node: any) => number;
      fillColor?: (rowIndex: number, node: any, columnIndex: number) => string | null;
    };
    margin?: [number, number, number, number] | number;
  }
}
