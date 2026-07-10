import { Module } from '@/shared/Module';
import { PostsController } from './controllers/PostsController';
import { PostsService } from './services/PostsService';
import { PostsFsDatabaseRepo } from './repos/PostsFsDatabaseRepo';
import { FilesService } from '@/infrastructure/files/services/FilesService';
import { FsFilesStorage } from '@/infrastructure/files/storages/FsFilesStorage';
import { FileInspectorRouter } from '@/infrastructure/files/inspectors/FileInspectorRouter';
import { AudioFileInspector } from '@/infrastructure/files/inspectors/AudioFileInspector';
import { VideoFileInspector } from '@/infrastructure/files/inspectors/VideoFileInspector';
import { ImageFileInspector } from '@/infrastructure/files/inspectors/ImageFileInspector';
import { UnknownFileInspector } from '@/infrastructure/files/inspectors/UnknownFileInspector';
import { throwError } from '@etonee123x/shared/utils/throwError';
import { FilesLocation } from '@/infrastructure/files/locations/FilesLocation';
import { FsDatabaseFile } from '@/infrastructure/FsDatabaseFile';
import type { Post } from './entities/Post';

export class PostsModule extends Module {
  constructor() {
    const uploadsPath = process.env.UPLOADS_PATH ?? throwError('UPLOADS_PATH is not defined');

    const filesLocation = new FilesLocation({ fs: uploadsPath, src: '/uploads' });

    const fsDatabaseFile = new FsDatabaseFile<Post>({ fileName: 'posts.json' });

    const postsRepo = new PostsFsDatabaseRepo({ fsDatabaseFile });

    const filesStorage = new FsFilesStorage({ filesLocation });

    const audioFileInspector = new AudioFileInspector();
    const videoFileInspector = new VideoFileInspector();
    const imageFileInspector = new ImageFileInspector();
    const unknownFileInspector = new UnknownFileInspector();

    const fileInspectorRouter = new FileInspectorRouter({
      audioFileInspector,
      videoFileInspector,
      imageFileInspector,
      unknownFileInspector,
    });

    const filesService = new FilesService({ filesStorage, fileInspectorRouter });

    const postsService = new PostsService({ postsRepo, filesService });

    const postsController = new PostsController(postsService);

    super({ controller: postsController });
  }
}
