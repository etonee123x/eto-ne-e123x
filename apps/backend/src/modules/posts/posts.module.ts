import { Module } from '@/shared/module';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './services/posts.service';
import { PostsFsDatabaseRepo } from './repos/posts-fs-database.repo';
import { FilesService } from '@/infrastructure/files/services/files-service';
import { FsFilesStorage } from '@/infrastructure/files/storages/fs-files-storage';
import { FileInspectorRouter } from '@/infrastructure/files/inspectors/file-inspector-router';
import { AudioFileInspector } from '@/infrastructure/files/inspectors/audio-file-inspector';
import { VideoFileInspector } from '@/infrastructure/files/inspectors/video-file-inspector';
import { ImageFileInspector } from '@/infrastructure/files/inspectors/image-file-inspector';
import { UnknownFileInspector } from '@/infrastructure/files/inspectors/unknown-file-inspector';
import { FilesLocation } from '@/infrastructure/files/locations/files-location';
import { FsDatabaseFile } from '@/infrastructure/fs-database-file';
import type { Post } from './entities/post.entity';
import { throwError } from '@/utils/throw.error';

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
