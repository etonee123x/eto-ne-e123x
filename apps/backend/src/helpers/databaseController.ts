import { existsSync, mkdirSync, readFileSync, createWriteStream, readdirSync, rmSync, statSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import nodePath from 'node:path';
import { randomUUID } from 'node:crypto';

import { throwError } from '@etonee123x/shared/utils/throwError';
import slugify from 'slugify';
import { TableController } from './TableController';
import { parseFileByPath } from './parseFileByPath';
import type { FolderDataItemFile } from '@/types/openapi';

const tableControllerItemsFiles = new TableController<FolderDataItemFile>('uploads');

const pathUploadsFull = process.env.UPLOADS_PATH ?? throwError('UPLOADS_PATH is not defined');

const withPadStart = (value: number) => {
  return String(value).padStart(2, '0');
};

export const uploadFile = async () => {
  if (!existsSync(pathUploadsFull)) {
    mkdirSync(pathUploadsFull, { recursive: true });
  }

  const { name, ext } = nodePath.parse(Buffer.from(info.filename, 'latin1').toString('utf8'));

  const path = nodePath.join(pathUploadsFull, fileName);

  await pipeline(stream, createWriteStream(path));

  const parsedFile = await parseFileByPath(path);

  const row = tableControllerItemsFiles.writeEntityOrRow(undefined, {
    ...parsedFile,
    path,
    src: ['/uploads', fileName].join('/'),
  });

  return row._meta.id;
};
