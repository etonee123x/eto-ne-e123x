import { pick } from '@etonee123x/shared/utils/pick';
import { extensionToFileType, FILE_TYPES, ITEM_TYPES } from '@/helpers/folderData';
import { fileTypeFromBuffer } from 'file-type/node';
import { readFile, stat } from 'node:fs/promises';
import { parseBuffer } from 'music-metadata';
import nodePath from 'node:path';
import sharp from 'sharp';
import { execFile } from 'node:child_process';
import ffprobe from 'ffprobe-static';
import type {
  FolderDataItemAudio,
  FolderDataItemImage,
  FolderDataItemUnknown,
  FolderDataItemVideo,
} from '@/types/openapi';

const getVideoMetadata = (path: string) => {
  return new Promise<{
    width: number;
    height: number;
  }>((resolve, reject) => {
    execFile(ffprobe.path, ['-v', 'quiet', '-print_format', 'json', '-show_streams', path], (error, out) => {
      if (error) {
        reject(new Error(`ffprobe error: ${error.message}`));
        return;
      }

      const parsedJson = JSON.parse(out);

      if (!(parsedJson && typeof parsedJson === 'object' && Array.isArray(parsedJson.streams))) {
        reject(new Error('Invalid ffprobe output'));
        return;
      }

      const stream = (parsedJson.streams as Array<unknown>).find((stream) => {
        return (
          stream &&
          typeof stream === 'object' &&
          'width' in stream &&
          'height' in stream &&
          typeof stream.height === 'number' &&
          typeof stream.width === 'number'
        );
      }) as
        | {
            width: number;
            height: number;
          }
        | undefined;

      if (!stream) {
        reject(new Error('No video stream found'));
        return;
      }

      resolve({
        width: stream.width,
        height: stream.height,
      });
    });
  });
};

export const parseFileByPath = async (path: string) => {
  const stats = await stat(path);

  const parsedPath = nodePath.parse(path);

  const base = {
    name: parsedPath.base,
    ext: parsedPath.ext,
    itemType: ITEM_TYPES.FILE,
    _meta: {
      createdAt: stats.birthtimeMs,
      updatedAt: stats.mtimeMs,
    },
  };
  const buffer = await readFile(path);

  const fileTypeResult = await fileTypeFromBuffer(buffer);

  const fileType = fileTypeResult ? extensionToFileType(`.${fileTypeResult.ext}`) : null;

  if (fileType === FILE_TYPES.AUDIO) {
    const metadata = await parseBuffer(buffer).then((audioMetadata) => {
      return {
        duration: (audioMetadata.format.duration ?? 0) * 1000,
        bitrate: audioMetadata.format.bitrate ? audioMetadata.format.bitrate / 1000 : null,
        album: audioMetadata.common.album ?? null,
        artists: audioMetadata.common.artists ?? [],
        bpm: audioMetadata.common.bpm ?? null,
        year: audioMetadata.common.year ?? null,
      };
    });

    return {
      ...base,
      fileType: FILE_TYPES.AUDIO,
      metadata,
    } satisfies Omit<FolderDataItemAudio, 'path' | 'src'>;
  }

  if (fileType === FILE_TYPES.IMAGE) {
    const metadata = await sharp(buffer).metadata();

    return {
      ...base,
      fileType: FILE_TYPES.IMAGE,
      metadata: pick(metadata, ['width', 'height']),
    } satisfies Omit<FolderDataItemImage, 'path' | 'src'>;
  }

  if (fileType === FILE_TYPES.VIDEO) {
    const metadata = await getVideoMetadata(path);

    return {
      ...base,
      fileType: FILE_TYPES.VIDEO,
      metadata,
    } satisfies Omit<FolderDataItemVideo, 'path' | 'src'>;
  }

  return {
    ...base,
    fileType: FILE_TYPES.UNKNOWN,
  } satisfies Omit<FolderDataItemUnknown, 'path' | 'src'>;
};
