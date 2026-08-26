import { execFile } from 'node:child_process';
import { FILE_TYPES } from '@/shared/domain/file-types/file-types.domain';
import type { StoredFileVideo } from '@/shared/domain/stored-file';
import ffprobe from 'ffprobe-static';
import { FileInspector } from './file-inspector';
import type { FileSource } from '../types/file-source';
import type { FilesStorage } from '../storages/files-storage';

export class VideoFileInspector extends FileInspector {
  canInspect(parameters: { fileType: (typeof FILE_TYPES)[keyof typeof FILE_TYPES] }) {
    return parameters.fileType === FILE_TYPES.VIDEO;
  }

  async inspect(parameters: {
    fileSource: FileSource;
    key: string;
    filesStorage: FilesStorage;
  }): Promise<StoredFileVideo> {
    const base = await super.inspect(parameters);
    const path = await parameters.fileSource.getPath();

    const specific = await new Promise<Omit<StoredFileVideo, 'name' | 'extension' | 'itemType' | '_meta' | 'src'>>(
      (resolve, reject) => {
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
      },
    );

    return {
      ...base,
      ...specific,
    };
  }
}
