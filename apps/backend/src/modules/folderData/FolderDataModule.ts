import { Module } from '@/shared/Module';
import { FolderDataController } from './controllers/FolderDataController';
import { FolderDataService } from './services/FolderDataService';
import { FilesService } from '@/infrastructure/files/services/FilesService';
import { FsFilesStorage } from '@/infrastructure/files/storages/FsFilesStorage';

export class FolderDataModule extends Module {
  constructor() {
    const filesStorage = new FsFilesStorage();
    const filesService = new FilesService({ filesStorage });
    const folderDataService = new FolderDataService({ filesService });
    const folderDataController = new FolderDataController({ folderDataService });

    super({ controller: folderDataController });
  }
}
