import type { components } from '@/shared/api/openapi';
import { FILE_TYPES } from '@/entities/file/@x/folder-data';
import { objectGet } from '@/shared/utils/object-get';
import { ITEM_TYPES } from './item-types';

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
