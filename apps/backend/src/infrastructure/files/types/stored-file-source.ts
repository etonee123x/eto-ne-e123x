export interface StoredFileSource {
  getBuffer: () => Promise<Buffer>;
  getPath: () => Promise<string>;
}
