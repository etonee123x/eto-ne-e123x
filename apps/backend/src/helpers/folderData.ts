import { fileTypeValues, itemTypeValues } from '@/types/openapi';
import { isNil } from '@etonee123x/shared';

export const FILE_TYPES = Object.fromEntries(
  fileTypeValues.map((fileType) => {
    return [fileType, fileType];
  }),
) as {
  [Value in (typeof fileTypeValues)[number]]: Value;
};

export const ITEM_TYPES = Object.fromEntries(
  itemTypeValues.map((itemType) => {
    return [itemType, itemType];
  }),
) as {
  [Value in (typeof itemTypeValues)[number]]: Value;
};

const EXTENSIONS_AUDIO = new Set(['mp3', 'ogg', 'wav']);
const EXTENSIONS_IMAGE = new Set(['jpg', 'jpeg', 'png']);
const EXTENSIONS_VIDEO = new Set(['mp4', 'webm']);

export const extensionToFileType = (extension: string | null) => {
  if (isNil(extension)) {
    return FILE_TYPES.UNKNOWN;
  }

  const extensionLowerCased = extension.toLowerCase();

  if (EXTENSIONS_AUDIO.has(extensionLowerCased)) {
    return FILE_TYPES.AUDIO;
  }

  if (EXTENSIONS_IMAGE.has(extensionLowerCased)) {
    return FILE_TYPES.IMAGE;
  }

  if (EXTENSIONS_VIDEO.has(extensionLowerCased)) {
    return FILE_TYPES.VIDEO;
  }

  return FILE_TYPES.UNKNOWN;
};
