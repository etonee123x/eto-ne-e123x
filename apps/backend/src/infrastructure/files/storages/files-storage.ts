import type { Readable } from 'node:stream';
import type { StoredFileBase } from '@/shared/domain/stored-file';

export interface FilesStorage {
  put(parameters: { buffer: Buffer; key: string }): Promise<unknown>;

  getStream(parameters: { key: string }): Promise<Readable>;

  getBuffer(parameters: { key: string }): Promise<Buffer>;

  delete(parameters: { key: string }): Promise<void>;

  getStoredFileBase(parameters: { key: string }): Promise<StoredFileBase>;

  exists(parameters: { key: string }): Promise<boolean>;
}
