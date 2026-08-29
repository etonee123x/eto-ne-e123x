export interface StoredFileSource {
  getBuffer: () => Promise<Buffer>;
  getKey: () => Promise<string>;
  getPath: () => Promise<string>;
}
