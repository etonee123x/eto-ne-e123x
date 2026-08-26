import { execFile } from 'node:child_process';
import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { StoredFileVideo } from '@/shared/domain/stored-file/video.stored-file';
import ffprobe from 'ffprobe-static';
import { FileInspectorBase } from './base.file-inspector';
import type { StoredFileSource } from '../types/stored-file-source';

export class VideoFileInspector extends FileInspectorBase {
  canInspect(parameters: { fileType: (typeof FILE_TYPES)[keyof typeof FILE_TYPES] }) {
    return parameters.fileType === FILE_TYPES.VIDEO;
  }

  async inspect(parameters: { storedFileSource: StoredFileSource }): Promise<StoredFileVideo> {
    const base = await super.inspect(parameters);
    const path = await parameters.storedFileSource.getPath();

    const specific = await new Promise<Pick<StoredFileVideo, 'metadata'>>((resolve, reject) => {
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
          metadata: {
            width: stream.width,
            height: stream.height,
          },
        });
      });
    });

    return {
      fileType: FILE_TYPES.VIDEO,
      ...base,
      ...specific,
    };
  }
}
