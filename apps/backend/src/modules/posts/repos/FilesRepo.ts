import { throwError } from '@etonee123x/shared/utils/throwError';
import { fileTypeFromBuffer } from 'file-type';
import nodePath from 'node:path';
import nodeFsPromises from 'node:fs/promises';
import { parseFileByPath } from '@/helpers/parseFileByPath';
import type { components } from '@/types/openapi';

const uploadsPath = process.env.UPLOADS_PATH ?? throwError('UPLOADS_PATH is not defined');

export class FilesRepo {
  async createFile(file: globalThis.Express.Multer.File) {
    const fileType = await fileTypeFromBuffer(file.buffer);

    if (!fileType) {
      return null;
    }

    const fileName = `upload-${crypto.randomUUID()}.${fileType.ext}`;
    const filePath = nodePath.join(uploadsPath, fileName);

    await nodeFsPromises.writeFile(filePath, file.buffer);

    // новояз

    const source = `/uploads/${fileName}`;

    return {
      ...(await parseFileByPath(filePath)),
      src: source,
      path: source,
    };
  }

  async deleteFileByName(parameters: { name: components['schemas']['FolderDataItemFile']['name'] }) {
    const { name } = parameters;
    return nodeFsPromises.rm(nodePath.join(uploadsPath, name));
  }
}
