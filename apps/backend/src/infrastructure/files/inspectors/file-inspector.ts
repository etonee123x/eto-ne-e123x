import type { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { FileSource } from '../types/file-source';

export interface FileInspector<T extends { fileType: (typeof FILE_TYPES)[keyof typeof FILE_TYPES] }> {
  inspect: (parameters: { fileSource: FileSource }) => Promise<T>;
}
