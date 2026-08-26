import { Module } from '@/shared/module';
import { FolderDataController } from './controllers/folder-data.controller';
import { FolderDataService } from './services/folder-data.service';
import { FilesService } from '@/infrastructure/files/services/files.service';
import { FsFilesStorage } from '@/infrastructure/files/storages/fs-files-storage';
import { FileInspector } from '@/infrastructure/files/inspectors/file-inspector';
import { AudioFileInspector } from '@/infrastructure/files/inspectors/audio.file-inspector';
import { ImageFileInspector } from '@/infrastructure/files/inspectors/image.file-inspector';
import { VideoFileInspector } from '@/infrastructure/files/inspectors/video.file-inspector';
import { UnknownFileInspector } from '@/infrastructure/files/inspectors/unknown.file-inspector';
import { FilesLocation } from '@/infrastructure/files/locations/files-location';
import { throwError } from '@/utils/throw.error';

export class FolderDataModule extends Module {
  constructor() {
    const contentPath = process.env.CONTENT_PATH ?? throwError('CONTENT_PATH is not defined');

    const filesLocation = new FilesLocation({ fs: contentPath, src: '/content' });

    const filesStorage = new FsFilesStorage({ filesLocation });

    const audioFileInspector = new AudioFileInspector({ filesStorage });
    const imageFileInspector = new ImageFileInspector({ filesStorage });
    const videoFileInspector = new VideoFileInspector({ filesStorage });
    const unknownFileInspector = new UnknownFileInspector({ filesStorage });

    const fileInspector = new FileInspector({
      fileInspectors: {
        audioFileInspector,
        imageFileInspector,
        videoFileInspector,
        unknownFileInspector,
      },
      filesStorage,
    });

    const filesService = new FilesService({ filesStorage, fileInspector });

    const folderDataService = new FolderDataService({ filesService, filesLocation });

    const folderDataController = new FolderDataController({ folderDataService });

    super({ controller: folderDataController });
  }
}
