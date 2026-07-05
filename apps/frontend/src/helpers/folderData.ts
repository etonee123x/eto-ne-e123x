import { fileTypeValues, itemTypeValues } from '@/types/openapi';
import type { components } from '@/types/openapi';
import { isNil } from '@etonee123x/shared/utils/isNil';
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

export const isFolderDataItemFileVideo = (
  parameter: unknown,
): parameter is components['schemas']['FolderDataItemVideo'] => {
  return (
    isFolderDataItemFileBase(parameter) &&
    objectGet(parameter, 'fileType') === FILE_TYPES.VIDEO &&
    typeof objectGet(parameter, 'metadata.width') === 'number' &&
    typeof objectGet(parameter, 'metadata.height') === 'number'
  );
};

export const isFolderDataItemFileImage = (
  parameter: unknown,
): parameter is components['schemas']['FolderDataItemImage'] => {
  return (
    isFolderDataItemFileBase(parameter) &&
    objectGet(parameter, 'fileType') === FILE_TYPES.IMAGE &&
    typeof objectGet(parameter, 'metadata.width') === 'number' &&
    typeof objectGet(parameter, 'metadata.height') === 'number'
  );
};

export const isFolderDataGalleryItem = (
  parameter: unknown,
): parameter is components['schemas']['FolderDataItemVideo'] | components['schemas']['FolderDataItemImage'] => {
  return isFolderDataItemFileVideo(parameter) || isFolderDataItemFileImage(parameter);
};
