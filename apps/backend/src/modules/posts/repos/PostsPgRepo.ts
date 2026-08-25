/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CursorPage } from '@/shared/types/CursorPage';
import type { Post } from '../entities/Post';
import { PgRepo } from '@/shared/repos/PgRepo';
import type { StoredFile } from '@/infrastructure/files/entities/StoredFile';
import type { PostsRepo } from './PostsRepo';

export class PostsPgRepo extends PgRepo implements PostsRepo {
  async findFirstPosts(parameters: { pageSize: number }): Promise<CursorPage<Post>> {
    throw new Error('Not implemented');
  }

  async findPostsAroundPostId(parameters: { postId: string; pageSize: number }): Promise<CursorPage<Post> | null> {
    throw new Error('Not implemented');
  }

  async findPostsByCursorPrevious(parameters: {
    cursorPrevious: string;
    pageSize: number;
  }): Promise<CursorPage<Post> | null> {
    throw new Error('Not implemented');
  }

  async findPostsByCursorNext(parameters: { cursorNext: string; pageSize: number }): Promise<CursorPage<Post> | null> {
    throw new Error('Not implemented');
  }

  async findPostById(parameters: { id: string }): Promise<Post> {
    throw new Error('Not implemented');
  }

  async createPost(parameters: { text: string; attachments: Array<StoredFile> }): Promise<Post> {
    throw new Error('Not implemented');
  }

  async updatePostById(parameters: { id: string; text: string; attachments: Array<StoredFile> }): Promise<Post> {
    throw new Error('Not implemented');
  }

  async deletePostById(parameters: { id: string }): Promise<Post> {
    throw new Error('Not implemented');
  }
}
