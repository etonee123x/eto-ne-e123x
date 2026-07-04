import nodePath from 'node:path';
import { access, stat, readdir } from 'node:fs/promises';
import { throwError } from '@etonee123x/shared/utils/throwError';
import { ITEM_TYPES } from '@/helpers/folderData';
import { parseFileByPath } from '@/helpers/parseFileByPath';
import type { components } from '@/types/openapi';
import { AppError } from '@/shared/errors/AppError';
import type { FilesService } from '@/infrastructure/files/services/FilesService';

const PROHIBITED_ELEMENTS_NAMES = new Set(['.git']);

const contentPath = process.env.CONTENT_PATH ?? throwError('CONTENT_PATH is not defined');

const pathToSystemPath = (path: string) => {
  return nodePath.join(contentPath, path);
};

export class FolderDataService {
  private readonly filesService: FilesService;

  constructor(parameters: { filesService: FilesService }) {
    this.filesService = parameters.filesService;
  }

  async getFolderData(path: string) {
    const systemPath = pathToSystemPath(path);

    try {
      await access(systemPath);
    } catch {
      throw new AppError(404, 'Path was not found');
    }

    const statAwaited = await stat(systemPath);

    const {
      //
      file,
      currentDirectory,
    } = statAwaited.isFile()
      ? {
          file: {
            path,
            src: [
              '/content',
              path
                .split('/')
                .map((uriComponent) => {
                  return encodeURIComponent(uriComponent);
                })
                .join('/'),
            ].join('/'),
            ...(await parseFileByPath(systemPath)),
          },
          currentDirectory: nodePath.dirname(path),
        }
      : {
          file: null,
          currentDirectory: path,
        };

    const readdirAwaited = await readdir(pathToSystemPath(currentDirectory), { withFileTypes: true });

    const items = await readdirAwaited.reduce<
      Promise<Pick<components['schemas']['FolderDataResponse'], 'files' | 'folders'>>
    >(
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
                  src: [
                    '/content',
                    outerFilePath
                      .split('/')
                      .map((uriComponent) => {
                        return encodeURIComponent(uriComponent);
                      })
                      .join('/'),
                  ].join('/'),
                  ...(await parseFileByPath(systemPath)),
                },
              ],
            };
      },
      Promise.resolve({ files: [], folders: [] }),
    );

    return {
      ...items,
      file,
      pathDirectory:
        file && file.name === path.split('/').at(-1) //
          ? path.split('/').slice(0, -1).join('/')
          : path,
    };
  }
}
