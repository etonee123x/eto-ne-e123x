import type { components } from '@/types/openapi';
import { isNil } from '@etonee123x/shared';
import { nonNullable } from '@/utils/nonNullable';
import { PostsRepo } from '../repos/PostsRepo';
import type { FilesRepo } from '../repos/FilesRepo';
import type { CursorPage } from '@/shared/types/CursorPage';
import type { Post } from '../entities/Post';

export class PostsService {
  private readonly postsRepo: PostsRepo;
  private readonly filesRepo: FilesRepo;

  constructor(parameters: { postsRepo: PostsRepo; filesRepo: FilesRepo }) {
    this.postsRepo = parameters.postsRepo;
    this.filesRepo = parameters.filesRepo;
  }

  async getPosts(parameters: {
    cursorPrevious: string | null;
    cursorNext: string | null;
    postId: string | null;
    pageSize: number;
  }): Promise<CursorPage<Post>> {
    const { cursorPrevious, cursorNext, postId, pageSize } = parameters;

    if (postId) {
      return this.postsRepo.findPostsAroundPostId({ postId, pageSize });
    }

    if (cursorPrevious) {
      return this.postsRepo.findPostsByCursorPrevious({ cursorPrevious, pageSize });
    }

    if (cursorNext) {
      return this.postsRepo.findPostsByCursorNext({ cursorNext, pageSize });
    }

    return this.postsRepo.findFirstPosts({ pageSize });
  }

  async createPost(parameters: { text: string; files: Array<globalThis.Express.Multer.File> }): Promise<Post> {
    const { text, files } = parameters;

    return this.postsRepo.createPost({
      attachments: await Promise.all(
        files.map((file) => {
          return this.postsRepo.createFileByMulterFile(file);
        }),
      ),
      text,
    });
  }

  async updatePostById(parameters: {
    id: string;
    files: Array<globalThis.Express.Multer.File>;
    attachments: components['schemas']['PostUpdateRequest']['attachments'];
    text: string;
  }): Promise<Post> {
    let index = 0;

    const { id, files, attachments: _attachments, text } = parameters;

    const postOld = await this.postsRepo.findPostById({ id });

    const attachments = await Promise.all([
      ..._attachments.map(async (attachment) => {
        return isNil(attachment) && index < files.length
          ? this.postsRepo.createFileByMulterFile(nonNullable(files[index++]))
          : attachment;
      }),
      ...files.slice(index).map((file) => {
        return this.postsRepo.createFileByMulterFile(file);
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

      this.postsRepo.deleteFileByName({ name: attachmentInOldPost.name });
    });

    const post = await this.postsRepo.updatePostById({
      id,
      text,
      attachments,
    });

    return post;
  }

  async deletePostById(parameters: { id: string }): Promise<Post> {
    const { id } = parameters;

    const post = await this.postsRepo.deletePostById({ id });

    post.attachments.forEach((attachment) => {
      this.postsRepo.deleteFileByName({ name: attachment.name });
    });

    return post;
  }
}
