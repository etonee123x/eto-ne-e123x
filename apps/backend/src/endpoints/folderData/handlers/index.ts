import { access } from 'fs/promises';
import { readdirSync, statSync } from 'fs';
import { parseFile } from 'music-metadata';
import { join, dirname, parse as parsePath, sep } from 'path';

import {
  Item,
  NavigationItem,
  FolderData,
  ItemFile,
  extensionToFileType,
  FILE_TYPES,
  ITEM_TYPES,
} from '@etonee123x/shared/helpers/folderData';
import { createError } from '@etonee123x/shared/helpers/error';
import { throwError } from '@etonee123x/shared/utils/throwError';

const PROHIBITED_ELEMENTS_NAMES = ['.git'];

export const handler = async (urlPath: string): Promise<FolderData> => {
  const contentPath = process.env.CONTENT_PATH ?? throwError('CONTENT_PATH is not defined');

  const pathToSystemPath = (path: string) => join(contentPath, path);

  const pathToFileURL = (path: string) => path.replace(new RegExp(`\\${sep}`, 'g'), '/');

  const pathToSrc = (path: string) => ['/content', path].join('');

  const getMetaDataFields = async (path: string) =>
    parseFile(path) //
      .then(
        ({
          //
          common: {
            //
            album,
            artists = [],
            bpm,
            year,
          },
          format: {
            //
            bitrate,
            duration,
          },
        }) => ({
          bitrate: bitrate && bitrate / 1000,
          duration: (duration ?? 0) * 1000,
          album,
          artists,
          bpm,
          year,
        }),
      );

  let linkedFile: ItemFile | null = null;
  let currentDirectory: string;

  const innerPath = pathToSystemPath(urlPath);

  await access(innerPath).catch(() => {
    throw createError({ data: 'Not Found', statusCode: 404 });
  });

  const stats = statSync(innerPath);

  if (stats.isFile()) {
    currentDirectory = dirname(urlPath);
    const { name, ext } = parsePath(urlPath);
    const fullName = [name, ext].join('');
    const outerFilePath = join(currentDirectory, fullName);
    const baseItem = {
      name: fullName,
      url: pathToFileURL(outerFilePath),
      src: pathToSrc(outerFilePath),
      itemType: ITEM_TYPES.FILE,
      _meta: {
        createdAt: statSync(pathToSystemPath(outerFilePath)).birthtimeMs,
      },
    };

    const fileType = extensionToFileType(ext);

    switch (fileType) {
      case FILE_TYPES.AUDIO:
        linkedFile = {
          ...baseItem,
          ext,
          fileType: FILE_TYPES.AUDIO,
          musicMetadata: await getMetaDataFields(innerPath),
        };
        break;
      case FILE_TYPES.IMAGE:
        linkedFile = {
          ...baseItem,
          ext,
          fileType: FILE_TYPES.IMAGE,
        };
        break;
      case FILE_TYPES.VIDEO:
        linkedFile = {
          ...baseItem,
          ext,
          fileType: FILE_TYPES.VIDEO,
        };
        break;
    }
  } else {
    currentDirectory = urlPath;
  }
  currentDirectory = currentDirectory || '/';

  const items = await readdirSync(pathToSystemPath(currentDirectory), { withFileTypes: true })
    .reduce<Promise<Array<Item>>>(async (promiseAcc, element) => {
      if (PROHIBITED_ELEMENTS_NAMES.includes(element.name)) {
        return promiseAcc;
      }

      const acc = await promiseAcc;

      const outerFilePath = join(currentDirectory, element.name);
      const innerFilePath = pathToSystemPath(outerFilePath);
      const { ext } = parsePath(innerFilePath);

      const baseItem = {
        name: element.name,
        url: pathToFileURL(outerFilePath),
        src: pathToSrc(outerFilePath),
        _meta: {
          createdAt: statSync(innerFilePath).birthtimeMs,
        },
      };

      if (element.isDirectory()) {
        return [...acc, { ...baseItem, itemType: ITEM_TYPES.FOLDER }];
      }

      const fileType = extensionToFileType(ext);

      switch (fileType) {
        case FILE_TYPES.AUDIO:
          return [
            ...acc,
            {
              ...baseItem,
              itemType: ITEM_TYPES.FILE,
              fileType: FILE_TYPES.AUDIO,
              ext,
              musicMetadata: await getMetaDataFields(innerFilePath),
            },
          ];
        case FILE_TYPES.IMAGE:
          return [...acc, { ...baseItem, itemType: ITEM_TYPES.FILE, fileType: FILE_TYPES.IMAGE, ext }];
        case FILE_TYPES.VIDEO:
          return [...acc, { ...baseItem, itemType: ITEM_TYPES.FILE, fileType: FILE_TYPES.VIDEO, ext }];
        default:
          return [...acc, { ...baseItem, itemType: ITEM_TYPES.FILE, fileType: FILE_TYPES.UNKNOWN, ext }];
      }
    }, Promise.resolve([]))
    .then((items) =>
      items.toSorted(
        (item1, item2) => -Number(item1.itemType === ITEM_TYPES.FOLDER && item2.itemType === ITEM_TYPES.FILE),
      ),
    );

  currentDirectory = pathToFileURL(currentDirectory);
  const lvlUp = currentDirectory === '/' ? null : dirname(currentDirectory);

  const navigationItems = currentDirectory //
    .split('/')
    .reduce<Array<NavigationItem>>(
      (navigationItems, text, index) => {
        if (text) {
          navigationItems.push({ text, link: navigationItems[index]?.link + text + '/' });
        }

        return navigationItems;
      },
      [
        {
          text: 'root',
          link: '/',
        },
      ],
    );

  return {
    linkedFile,
    items,
    lvlUp,
    navigationItems,
  };
};
