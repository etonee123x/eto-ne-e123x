import { fileTypeValues, itemTypeValues } from '@/types/openapi';
import type { components } from '@/types/openapi';
import { objectGet } from '@etonee123x/shared/utils/objectGet';

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

export const isFolderDataItemBase = (parameter: unknown): parameter is components['schemas']['FolderDataItemBase'] => {
  return (
    parameter !== null &&
    typeof parameter === 'object' &&
    typeof objectGet(parameter, 'name') === 'string' &&
    typeof objectGet(parameter, 'path') === 'string' &&
    typeof objectGet(parameter, '_meta.createdAt') === 'number' &&
    typeof objectGet(parameter, '_meta.updatedAt') === 'number'
  );
};

export const isFolderDataItemFileBase = (
  parameter: unknown,
): parameter is components['schemas']['FolderDataItemFileBase'] => {
  return (
    isFolderDataItemBase(parameter) &&
    typeof objectGet(parameter, 'src') === 'string' &&
    objectGet(parameter, 'itemType') === ITEM_TYPES.FILE
  );
};

export const isFolderDataItemFileAudio = (
  parameter: unknown,
): parameter is components['schemas']['FolderDataItemAudio'] => {
  const metadataAlbum = objectGet(parameter, 'metadata.album');
  const metadataBpm = objectGet(parameter, 'metadata.bpm');
  const metadataYear = objectGet(parameter, 'metadata.year');
  const metadataArtists = objectGet(parameter, 'metadata.artists');
  const metadataBitrate = objectGet(parameter, 'metadata.bitrate');
  const metadataDuration = objectGet(parameter, 'metadata.duration');

  return (
    isFolderDataItemFileBase(parameter) &&
    objectGet(parameter, 'fileType') === FILE_TYPES.AUDIO &&
    (typeof metadataAlbum === 'string' || metadataAlbum === null) &&
    (typeof metadataBpm === 'number' || metadataBpm === null) &&
    (typeof metadataYear === 'number' || metadataYear === null) &&
    (typeof metadataBitrate === 'number' || metadataBitrate === null) &&
    (typeof metadataDuration === 'number' || metadataDuration === null) &&
    Array.isArray(metadataArtists) &&
    metadataArtists.every((item) => {
      return typeof item === 'string';
    })
  );
};

export const isFolderDataItemVideo = (
  parameter: unknown,
): parameter is components['schemas']['FolderDataItemVideo'] => {
  return (
    isFolderDataItemFileBase(parameter) &&
    objectGet(parameter, 'fileType') === FILE_TYPES.VIDEO &&
    typeof objectGet(parameter, 'metadata.width') === 'number' &&
    typeof objectGet(parameter, 'metadata.height') === 'number'
  );
};

export const isFolderDataItemImage = (
  parameter: unknown,
): parameter is components['schemas']['FolderDataItemImage'] => {
  return (
    isFolderDataItemFileBase(parameter) &&
    objectGet(parameter, 'fileType') === FILE_TYPES.IMAGE &&
    typeof objectGet(parameter, 'metadata.width') === 'number' &&
    typeof objectGet(parameter, 'metadata.height') === 'number'
  );
};
