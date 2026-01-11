import nodePath from 'node:path';
import { access, stat, readdir } from 'node:fs/promises';
import { throwError } from '@etonee123x/shared/utils/throwError';
import { ITEM_TYPES } from '@/helpers/folderData';
import { parseFileByPath } from '@/helpers/parseFileByPath';
import createHttpError from 'http-errors';
import type { Components, OperationHandler, OperationResponse } from '@/types/openapi';
import Express from 'express';

const PROHIBITED_ELEMENTS_NAMES = new Set(['.git']);

const contentPath = process.env.CONTENT_PATH ?? throwError('CONTENT_PATH is not defined');

const pathToSystemPath = (path: string) => {
  return nodePath.join(contentPath, path);
};

export const getFolderData: OperationHandler<'getFolderData', [Express.Request, Express.Response]> = async (
  ...[context, , response]
) => {
  const { path } = context.request.query;

  const systemPath = pathToSystemPath(path);

  await access(systemPath).catch(() => {
    throw createHttpError(404);
  });

  const statAwaited = await stat(systemPath);

  const isFile = statAwaited.isFile();

  const file = isFile
    ? {
        path,
        src: ['/content', path].join('/'),
        ...(await parseFileByPath(systemPath)),
      }
    : null;

  const currentDirectory = isFile ? nodePath.dirname(path) : path;

  const readdirAwaited = await readdir(pathToSystemPath(currentDirectory), { withFileTypes: true });

  const items = await readdirAwaited.reduce<Promise<Pick<Components.Schemas.FolderDataResponse, 'files' | 'folders'>>>(
    async (promiseItems, item) => {
      if (PROHIBITED_ELEMENTS_NAMES.has(item.name)) {
        return promiseItems;
      }

      const items = await promiseItems;

      const outerFilePath = nodePath.join(currentDirectory, item.name);
      const systemPath = pathToSystemPath(outerFilePath);

      const statAwaited = await stat(systemPath);

      const baseItem = {
        name: item.name,
        _meta: {
          createdAt: statAwaited.birthtimeMs,
          updatedAt: statAwaited.mtimeMs,
        },
      };

      return item.isDirectory()
        ? {
            ...items,
            folders: [
              ...items.folders,
              {
                ...baseItem,
                path: outerFilePath,
                itemType: ITEM_TYPES.FOLDER,
              },
            ],
          }
        : {
            ...items,
            files: [
              ...items.files,
              {
                ...baseItem,
                path: outerFilePath,
                src: ['/content', outerFilePath].join('/'),
                ...(await parseFileByPath(systemPath)),
              },
            ],
          };
    },
    Promise.resolve({ files: [], folders: [] }),
  );

  const data: OperationResponse<'getFolderData'> = {
    ...items,
    file,
    path,
  };

  return response.send(data);
};
