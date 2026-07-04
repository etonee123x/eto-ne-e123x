import type { components } from '@/types/openapi';
import { isNil } from '@etonee123x/shared';
import { nonNullable } from '@/utils/nonNullable';
import { PostsRepo } from '../repos/PostsRepo';
import type { CursorPage } from '@/shared/types/CursorPage';
import type { Post } from '../entities/Post';
import type { FilesService } from '@/infrastructure/files/services/FilesService';
import { AppError } from '@/shared/errors/AppError';

export class PostsService {
  private readonly postsRepo: PostsRepo;
  private readonly filesService: FilesService;

  constructor(parameters: { postsRepo: PostsRepo; filesService: FilesService }) {
    this.postsRepo = parameters.postsRepo;
    this.filesService = parameters.filesService;
  }

  private getKeyByFile(file: Express.Multer.File) {
    return file.filename;
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
    attachments: components['schemas']['PostUpdateRequest']['attachments'];
    text: string;
  }): Promise<Post> {
    let index = 0;

    const postOld = await this.postsRepo.findPostById({ id: parameters.id });

    const attachments = await Promise.all([
      ...parameters.attachments.map(async (attachment) => {
        return isNil(attachment) && index < parameters.files.length
          ? this.filesService.upload(nonNullable(parameters.files[index++]))
          : attachment;
      }),
      ...parameters.files.slice(index).map((file) => {
        return this.filesService.upload(file);
      }),
    ]).then((attachments) => {
      return attachments.filter((attachment) => {
        return !isNil(attachment);
      });
    });

    postOld.attachments.forEach((attachmentInOldPost) => {
      if (
        attachments.some((attachmentInNewPost) => {
          return attachmentInNewPost.src === attachmentInOldPost.src;
        })
      ) {
        return;
      }

      this.filesService.delete({ key: attachmentInOldPost.name });
    });

    const post = await this.postsRepo.updatePostById({
      id: parameters.id,
      text: parameters.text,
      attachments: parameters.attachments,
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
