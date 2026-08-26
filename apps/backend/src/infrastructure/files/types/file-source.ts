export interface FileSource {
  getBuffer: () => Promise<Buffer>;
  getPath: () => Promise<string>;
}
