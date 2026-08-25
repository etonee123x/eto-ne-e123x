import type { CursorPage } from '@/shared/types/CursorPage';
import type { Post } from '../entities/Post';
import type { StoredFile } from '@/infrastructure/files/entities/StoredFile';

export interface PostsRepo {
  findFirstPosts: (parameters: { pageSize: number }) => Promise<CursorPage<Post>>;

  findPostsAroundPostId: (parameters: { postId: string; pageSize: number }) => Promise<CursorPage<Post> | null>;

  findPostsByCursorPrevious: (parameters: {
    cursorPrevious: string;
    pageSize: number;
  }) => Promise<CursorPage<Post> | null>;

  findPostsByCursorNext: (parameters: { cursorNext: string; pageSize: number }) => Promise<CursorPage<Post> | null>;

  findPostById: (parameters: { id: string }) => Promise<Post>;

  createPost: (parameters: { text: string; attachments: Array<StoredFile> }) => Promise<Post>;

  updatePostById: (parameters: { id: string; text: string; attachments: Array<StoredFile> }) => Promise<Post>;

  deletePostById: (parameters: { id: string }) => Promise<Post>;
}
