import type { FILE_TYPES } from '@/helpers/folderData';
import type { FileSource } from '../types/FileSource';

export interface FileInspector<T extends { fileType: (typeof FILE_TYPES)[keyof typeof FILE_TYPES] }> {
  inspect: (parameters: { fileSource: FileSource }) => Promise<T>;
}
