import nodePath from 'node:path';
import nodeFsPromises from 'node:fs/promises';
import { ITEM_TYPES } from '@/shared/domain/file-types/file-types.domain';
import { AppError } from '@/shared/errors/app.error';
import type { FilesService } from '@/infrastructure/files/services/files.service';
import type { StoredFile } from '@/shared/domain/stored-file';
import type { FilesLocation } from '@/infrastructure/files/locations/files-location';

const PROHIBITED_ELEMENTS_NAMES = new Set(['.git']);

const getStat = async (parameters: { path: string }) => {
  try {
    await nodeFsPromises.access(parameters.path);
  } catch {
    return null;
  }

  return nodeFsPromises.stat(parameters.path);
};
export class FolderDataService {
  private readonly filesLocation: FilesLocation;
  private readonly filesService: FilesService;

  constructor(parameters: { filesService: FilesService; filesLocation: FilesLocation }) {
    this.filesService = parameters.filesService;
    this.filesLocation = parameters.filesLocation;
  }

  private pathAsRelativeUrlToSystemPath(pathAsRelativeUrl: string) {
    return nodePath.join(this.filesLocation.fs, pathAsRelativeUrl);
  }

  async getFolderData(parameters: { pathAsRelativeUrl: string }) {
    const statAwaited = await getStat({
      path: this.pathAsRelativeUrlToSystemPath(parameters.pathAsRelativeUrl),
    });

    if (!statAwaited) {
      throw new AppError(404, 'Path was not found');
    }

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

    const directoryItems = await nodeFsPromises.readdir(this.pathAsRelativeUrlToSystemPath(currentDirectory), {
      withFileTypes: true,
    });

    const { folders, files } = await directoryItems.reduce<
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

        const statAwaited = await getStat({
          path: systemPath,
        });

        if (!statAwaited) {
          return promiseItems;
        }

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

    const pathDirectory = (() => {
      if (file && file.name === parameters.pathAsRelativeUrl.split('/').at(-1)) {
        return parameters.pathAsRelativeUrl.split('/').slice(0, -1).join('/');
      }

      return parameters.pathAsRelativeUrl.length > 1 && parameters.pathAsRelativeUrl.endsWith('/')
        ? parameters.pathAsRelativeUrl.slice(0, -1)
        : parameters.pathAsRelativeUrl;
    })();

    return {
      folders,
      files,
      file,
      pathDirectory,
    };
  }
}
