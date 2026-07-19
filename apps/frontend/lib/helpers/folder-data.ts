import { fileTypeValues, itemTypeValues } from '@/lib/types/openapi';

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

export const extensionToFileType = (extension: string) => {
  const EXTENSIONS_AUDIO = ['.mp3', '.ogg', '.wav'];
  const EXTENSIONS_IMAGE = ['.jpg', '.jpeg', '.png'];
  const EXTENSIONS_VIDEO = ['.mp4', '.webm'];

  const extensionLowerCased = extension.toLowerCase();

  if (EXTENSIONS_AUDIO.includes(extensionLowerCased)) {
    return FILE_TYPES.AUDIO;
  }

  if (EXTENSIONS_IMAGE.includes(extensionLowerCased)) {
    return FILE_TYPES.IMAGE;
  }

  if (EXTENSIONS_VIDEO.includes(extensionLowerCased)) {
    return FILE_TYPES.VIDEO;
  }

  return null;
};
