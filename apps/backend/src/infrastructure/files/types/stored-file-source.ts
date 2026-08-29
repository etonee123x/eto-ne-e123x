export interface StoredFileSource {
  getBuffer: () => Promise<Buffer>;
}
