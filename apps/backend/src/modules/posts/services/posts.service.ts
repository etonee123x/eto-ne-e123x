import { nonNullable } from '@/utils/non-nullable';
import type { PostsRepo } from '../repos/posts.repo';
import type { CursorPage } from '@/shared/types/cursor-page';
import type { Post } from '../entities/post.entity';
import type { FilesService } from '@/infrastructure/files/services/files.service';
import { AppError } from '@/shared/errors/app.error';
import type { StoredFile } from '@/shared/domain/stored-file';

export class PostsService {
  private readonly postsRepo: PostsRepo;
  private readonly filesService: FilesService;

  constructor(parameters: { postsRepo: PostsRepo; filesService: FilesService }) {
    this.postsRepo = parameters.postsRepo;
    this.filesService = parameters.filesService;
  }

  private getKeyByFile(file: Express.Multer.File) {
    return file.originalname;
  }

  async getPosts(parameters: {
    cursorPrevious: string | null;
    cursorNext: string | null;
    postId: string | null;
    pageSize: number;
  }): Promise<CursorPage<Post>> {
    if (parameters.postId) {
      const posts = await this.postsRepo.findPostsAroundPostId({
        postId: parameters.postId,
        pageSize: parameters.pageSize,
      });
      if (!posts) {
        throw new AppError(404, 'Posts was not found');
      }

      return posts;
    }

    if (parameters.cursorPrevious) {
      const posts = await this.postsRepo.findPostsByCursorPrevious({
        cursorPrevious: parameters.cursorPrevious,
        pageSize: parameters.pageSize,
      });
      if (!posts) {
        throw new AppError(404, 'Posts was not found');
      }

      return posts;
    }

    if (parameters.cursorNext) {
      const posts = await this.postsRepo.findPostsByCursorNext({
        cursorNext: parameters.cursorNext,
        pageSize: parameters.pageSize,
      });
      if (!posts) {
        throw new AppError(404, 'Posts was not found');
      }

      return posts;
    }

    return this.postsRepo.findFirstPosts({ pageSize: parameters.pageSize });
  }

  async createPost(parameters: { text: string; files: Array<globalThis.Express.Multer.File> }): Promise<Post> {
    return this.postsRepo.createPost({
      attachments: await Promise.all(
        parameters.files.map((file) => {
          return this.filesService.upload({ buffer: file.buffer, key: this.getKeyByFile(file) });
        }),
      ),
      text: parameters.text,
    });
  }

  async updatePostById(parameters: {
    id: string;
    files: Array<globalThis.Express.Multer.File>;
    attachments: Array<StoredFile | null>;
    text: string;
  }): Promise<Post> {
    let index = 0;

    const postOld = await this.postsRepo.findPostById({ id: parameters.id });

    const attachments = await Promise.all([
      ...parameters.attachments.flatMap((attachment) => {
        if (attachment) {
          return [Promise.resolve(attachment)];
        }

        if (index >= parameters.files.length) {
          return [];
        }

        const file = nonNullable(parameters.files[index++]);

        return [
          this.filesService.upload({
            buffer: file.buffer,
            key: this.getKeyByFile(file),
          }),
        ];
      }),
      ...parameters.files.slice(index).map((file) => {
        return this.filesService.upload({ buffer: file.buffer, key: this.getKeyByFile(file) });
      }),
    ]);

    for (const attachmentInOldPost of postOld.attachments) {
      if (
        attachments.some((attachmentInNewPost) => {
          return attachmentInNewPost.src === attachmentInOldPost.src;
        })
      ) {
        continue;
      }

      this.filesService.delete({ key: attachmentInOldPost.name });
    }

    const post = await this.postsRepo.updatePostById({
      id: parameters.id,
      text: parameters.text,
      attachments,
    });

    return post;
  }

  async deletePostById(parameters: { id: string }): Promise<Post> {
    const post = await this.postsRepo.deletePostById({ id: parameters.id });

    for (const attachment of post.attachments) {
      this.filesService.delete({ key: attachment.name });
    }

    return post;
  }
}
