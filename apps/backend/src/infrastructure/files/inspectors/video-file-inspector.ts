import { execFile } from 'node:child_process';
import type { FileInspector } from './file-inspector';
import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import ffprobe from 'ffprobe-static';
import type { FileSource } from '../types/file-source';
import type { StoredFileVideo } from '../entities/stored-file-video';
import type { StoredFileBase } from '../types/stored-file-base';

export class VideoFileInspector implements FileInspector<Omit<StoredFileVideo, keyof StoredFileBase>> {
  async inspect(parameters: { fileSource: FileSource }) {
    const path = await parameters.fileSource.getPath();

    return new Promise<Omit<StoredFileVideo, keyof StoredFileBase>>((resolve, reject) => {
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
          fileType: FILE_TYPES.VIDEO,
          metadata: {
            width: stream.width,
            height: stream.height,
          },
        });
      });
    });
  }
}
