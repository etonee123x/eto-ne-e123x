export const ITEM_TYPES = {
  FOLDER: 'FOLDER',
  FILE: 'FILE',
} as const;

export const FILE_TYPES = {
  AUDIO: 'AUDIO',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  UNKNOWN: 'UNKNOWN',
} as const;

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
