import { Module } from '@/shared/Module';
import { FolderDataController } from './controllers/FolderDataController';
import { FolderDataService } from './services/FolderDataService';
import { FilesService } from '@/infrastructure/files/services/FilesService';
import { FsFilesStorage } from '@/infrastructure/files/storages/FsFilesStorage';
import { FileInspectorRouter } from '@/infrastructure/files/inspectors/FileInspectorRouter';
import { AudioFileInspector } from '@/infrastructure/files/inspectors/AudioFileInspector';
import { ImageFileInspector } from '@/infrastructure/files/inspectors/ImageFileInspector';
import { VideoFileInspector } from '@/infrastructure/files/inspectors/VideoFileInspector';
import { UnknownFileInspector } from '@/infrastructure/files/inspectors/UnknownFileInspector';
import { FilesLocation } from '@/infrastructure/files/locations/FilesLocation';
import { throwError } from '@/utils/throwError';

export class FolderDataModule extends Module {
  constructor() {
    const contentPath = process.env.CONTENT_PATH ?? throwError('CONTENT_PATH is not defined');

    const filesLocation = new FilesLocation({ fs: contentPath, src: '/content' });

    const filesStorage = new FsFilesStorage({ filesLocation });

    const audioFileInspector = new AudioFileInspector();
    const imageFileInspector = new ImageFileInspector();
    const videoFileInspector = new VideoFileInspector();
    const unknownFileInspector = new UnknownFileInspector();

    const fileInspectorRouter = new FileInspectorRouter({
      audioFileInspector,
      imageFileInspector,
      videoFileInspector,
      unknownFileInspector,
    });

    const filesService = new FilesService({ filesStorage, fileInspectorRouter });

    const folderDataService = new FolderDataService({ filesService, filesLocation });

    const folderDataController = new FolderDataController({ folderDataService });

    super({ controller: folderDataController });
  }
}
