import nodePath from 'node:path';
import nodeFsPromises from 'node:fs/promises';
import { ITEM_TYPES } from '@/helpers/folderData';
import { AppError } from '@/shared/errors/AppError';
import type { FilesService } from '@/infrastructure/files/services/FilesService';
import type { StoredFile } from '@/infrastructure/files/entities/StoredFile';
import type { FilesLocation } from '@/infrastructure/files/locations/FilesLocation';

const PROHIBITED_ELEMENTS_NAMES = new Set(['.git']);

export class FolderDataService {
  private readonly filesLocation: FilesLocation;
  private readonly filesService: FilesService;

  constructor(parameters: { filesService: FilesService; filesLocation: FilesLocation }) {
    this.filesService = parameters.filesService;
    this.filesLocation = parameters.filesLocation;
  }

  private pathAsRelativeUrlToSystemPath(pathAsRelativeUrl: string) {
    const systemPath = nodePath.join(this.filesLocation.fs, pathAsRelativeUrl);
    return systemPath;
  }

  async getFolderData(parameters: { pathAsRelativeUrl: string }) {
    const systemPath = this.pathAsRelativeUrlToSystemPath(parameters.pathAsRelativeUrl);

    try {
      await nodeFsPromises.access(systemPath);
    } catch {
      throw new AppError(404, 'Path was not found');
    }

    const statAwaited = await nodeFsPromises.stat(systemPath);

    const {
      //
      file,
      currentDirectory,
    } = statAwaited.isFile()
      ? {
          file: {
            path: parameters.pathAsRelativeUrl,
            ...(await this.filesService.getStoredFile({ key: parameters.pathAsRelativeUrl })),
          },
          currentDirectory: nodePath.dirname(parameters.pathAsRelativeUrl),
        }
      : {
          file: null,
          currentDirectory: parameters.pathAsRelativeUrl,
        };

    const readdirAwaited = await nodeFsPromises.readdir(this.pathAsRelativeUrlToSystemPath(currentDirectory), {
      withFileTypes: true,
    });

    const items = await readdirAwaited.reduce<
      Promise<{
        folders: Array<{
          name: string;
          itemType: (typeof ITEM_TYPES)['FOLDER'];
          _meta: {
            createdAt: number;
            updatedAt: number;
          };
          path: string;
        }>;
        files: Array<
          StoredFile & {
            path: string;
          }
        >;
      }>
    >(
      async (promiseItems, item) => {
        if (PROHIBITED_ELEMENTS_NAMES.has(item.name)) {
          return promiseItems;
        }

        const items = await promiseItems;

        const pathAsRelativeUrl = nodePath.join(currentDirectory, item.name);
        const systemPath = this.pathAsRelativeUrlToSystemPath(pathAsRelativeUrl);

        const statAwaited = await nodeFsPromises.stat(systemPath);

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
                  path: pathAsRelativeUrl,
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
                  path: pathAsRelativeUrl,
                  ...(await this.filesService.getStoredFile({ key: systemPath })),
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
        file && file.name === parameters.pathAsRelativeUrl.split('/').at(-1) //
          ? parameters.pathAsRelativeUrl.split('/').slice(0, -1).join('/')
          : parameters.pathAsRelativeUrl,
    };
  }
}
