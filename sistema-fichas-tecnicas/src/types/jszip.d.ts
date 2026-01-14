/**
 * Declaración de tipos para JSZip
 * Se usa importación dinámica para evitar problemas de SSR
 */

declare module 'jszip' {
  interface JSZipObject {
    name: string;
    dir: boolean;
    date: Date;
    comment: string;
    unixPermissions: number | null;
    dosPermissions: number | null;
    async(type: 'string'): Promise<string>;
    async(type: 'arraybuffer'): Promise<ArrayBuffer>;
    async(type: 'uint8array'): Promise<Uint8Array>;
    async(type: 'blob'): Promise<Blob>;
  }

  interface JSZipGeneratorOptions {
    type: 'blob' | 'arraybuffer' | 'uint8array' | 'base64' | 'string';
    compression?: 'STORE' | 'DEFLATE';
    compressionOptions?: {
      level: number;
    };
    comment?: string;
    mimeType?: string;
    platform?: 'DOS' | 'UNIX';
  }

  class JSZip {
    file(name: string, data: string | ArrayBuffer | Uint8Array | Blob): this;
    file(name: string): JSZipObject | null;
    folder(name: string): JSZip | null;
    forEach(callback: (relativePath: string, file: JSZipObject) => void): void;
    generateAsync(options: JSZipGeneratorOptions): Promise<Blob | ArrayBuffer | Uint8Array | string>;
    loadAsync(data: string | ArrayBuffer | Uint8Array | Blob): Promise<JSZip>;
  }

  export default JSZip;
}
