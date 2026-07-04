export interface FilesStorage {
  put(parameters: { buffer: Buffer; key: string }): Promise<unknown>;
  get(parameters: { key: string }): Promise<Buffer>;
  delete(parameters: { key: string }): Promise<void>;
  exists(parameters: { key: string }): Promise<boolean>;
}
