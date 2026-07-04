import type { components } from '@/types/openapi';
import type { Pool } from 'pg';
import type { CursorPage } from '@/shared/types/CursorPage';
import type { Post } from '../entities/Post';

export class PostsRepo {
  private readonly pool: Pool;

  constructor(parameters: { pool: Pool }) {
    this.pool = parameters.pool;
  }

  async findFirstPosts(parameters: { pageSize: number }): Promise<CursorPage<Post>> {
    const { pageSize } = parameters;

    return {
      _meta: {
        cursorPrevious: null,
        cursorNext: posts[pageSize]?._meta.createdAt ?? null,
      },
      rows: posts.slice(0, pageSize),
    };
  }

  async findPostsAroundPostId(parameters: { postId: string; pageSize: number }): Promise<CursorPage<Post> | null> {
    const { postId, pageSize } = parameters;

    const index = posts.findIndex((post) => {
      return post._meta.id === postId;
    });

    if (index === -1) {
      return null;
    }

    const start = Math.max(0, index - pageSize);
    const end = Math.min(index + pageSize, posts.length);

    return {
      _meta: {
        cursorPrevious: posts[start - 1]?._meta.createdAt ?? null,
        cursorNext: posts[end]?._meta.createdAt ?? null,
      },
      rows: posts.slice(start, end),
    };
  }

  async findPostsByCursorPrevious(parameters: {
    cursorPrevious: string;
    pageSize: number;
  }): Promise<CursorPage<Post> | null> {
    const { cursorPrevious, pageSize } = parameters;

    const index = posts.findIndex((post) => {
      return String(post._meta.createdAt) === cursorPrevious;
    });

    if (index === -1) {
      return null;
    }

    const indexLast = Math.min(posts.length, index + 1);
    const indexInitial = Math.max(0, indexLast - pageSize);

    return {
      _meta: {
        cursorPrevious: posts[indexInitial - 1]?._meta.createdAt ?? null,
        cursorNext: posts[indexLast]?._meta.createdAt ?? null,
      },
      rows: posts.slice(indexInitial, indexLast),
    };
  }

  async findPostsByCursorNext(parameters: { cursorNext: string; pageSize: number }): Promise<CursorPage<Post> | null> {
    const { cursorNext, pageSize } = parameters;

    const index = posts.findIndex((post) => {
      return String(post._meta.createdAt) === cursorNext;
    });

    if (index === -1) {
      return null;
    }

    const indexInitial = index;
    const indexLast = Math.min(posts.length, indexInitial + pageSize);

    return {
      _meta: {
        cursorPrevious: posts[indexInitial - 1]?._meta.createdAt ?? null,
        cursorNext: posts[indexLast]?._meta.createdAt ?? null,
      },
      rows: posts.slice(indexInitial, indexLast),
    };
  }

  async findPostById(parameters: { id: string }) {
    const { id } = parameters;

    return tableControllerPosts.readRowById(id);
  }

  async createPost(parameters: {
    text: string;
    files: Array<components['schemas']['PostCreateRequest']['files']>;
  }): Promise<Post> {
    const { text, files } = parameters;

    return;
  }

  async updatePostById(parameters: {
    id: string;
    text: string;
    attachments: components['schemas']['PostUpdateRequest']['attachments'];
  }): Promise<Post> {
    const { id, text, attachments } = parameters;

    return tableControllerPosts.writeEntityOrRow(id, {
      attachments: await Promise.all(
        files.map((file) => {
          return createFile(file);
        }),
      ),
      text,
    });
  }

  async deletePostById(parameters: { id: string }): Promise<Post> {
    const { id } = parameters;

    return tableControllerPosts.deleteRowById(id);
  }
}
