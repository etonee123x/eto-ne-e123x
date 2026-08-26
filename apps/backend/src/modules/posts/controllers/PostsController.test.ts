import Express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

const { passThroughMiddleware } = vi.hoisted(() => {
  return {
    passThroughMiddleware: (...[, , next]: Parameters<Express.RequestHandler>) => {
      next();
    },
  };
});

vi.mock('@/middlewares/cookieAuth', () => {
  return {
    cookieAuth: passThroughMiddleware,
  };
});

vi.mock('@/modules/posts/middlewares/parseFiles', () => {
  return {
    parseFiles: (...[request_, , next]: Parameters<Express.RequestHandler>) => {
      (request_ as unknown as { files: Array<globalThis.Express.Multer.File> }).files = [
        {
          originalname: 'upload.bin',
          buffer: Buffer.from('content'),
        } as globalThis.Express.Multer.File,
      ];

      next();
    },
  };
});

vi.mock('@/modules/posts/middlewares/idioticFieldMultipartFormDataToJsonParser', () => {
  return {
    idioticFieldMultipartFormDataToJsonParser: () => {
      return passThroughMiddleware;
    },
  };
});

import { PostsController } from '@/modules/posts/controllers/PostsController';

const buildApp = (postsService: unknown) => {
  const app = Express();

  app.use(Express.json());

  const controller = new PostsController(postsService as never);
  app.use(controller.router);

  return app;
};

describe('PostsController', () => {
  it('maps query params and calls getPosts service', async () => {
    const getPosts = vi.fn(async () => {
      return {
        _meta: { cursorPrevious: null, cursorNext: null },
        rows: [],
      };
    });

    const app = buildApp({
      getPosts,
      createPost: vi.fn(),
      updatePostById: vi.fn(),
      deletePostById: vi.fn(),
    });

    await request(app)
      .get('/posts?pageSize=3&filters[cursorPrevious]=200&filters[cursorNext]=100&filters[postId]=post-1')
      .expect(200);

    expect(getPosts).toHaveBeenCalledWith({
      pageSize: 3,
      cursorPrevious: '200',
      cursorNext: '100',
      postId: 'post-1',
    });
  });

  it('uses default pageSize when query is absent', async () => {
    const getPosts = vi.fn(async () => {
      return {
        _meta: { cursorPrevious: null, cursorNext: null },
        rows: [],
      };
    });

    const app = buildApp({
      getPosts,
      createPost: vi.fn(),
      updatePostById: vi.fn(),
      deletePostById: vi.fn(),
    });

    await request(app).get('/posts').expect(200);

    expect(getPosts).toHaveBeenCalledWith({
      pageSize: 10,
      cursorPrevious: null,
      cursorNext: null,
      postId: null,
    });
  });

  it('calls createPost with parsed body and files', async () => {
    const createPost = vi.fn(async () => {
      return { ok: true };
    });

    const app = buildApp({
      getPosts: vi.fn(),
      createPost,
      updatePostById: vi.fn(),
      deletePostById: vi.fn(),
    });

    await request(app).post('/posts').send({ text: 'hello' }).expect(200);

    expect(createPost).toHaveBeenCalledWith({
      text: 'hello',
      files: [
        expect.objectContaining({
          originalname: 'upload.bin',
        }),
      ],
    });
  });

  it('calls updatePostById with id, text, attachments and files', async () => {
    const updatePostById = vi.fn(async () => {
      return { ok: true };
    });

    const app = buildApp({
      getPosts: vi.fn(),
      createPost: vi.fn(),
      updatePostById,
      deletePostById: vi.fn(),
    });

    const attachments = [{ src: '/uploads/file.png', name: 'file.png' }];

    await request(app).patch('/posts/post-7').send({ text: 'updated', attachments }).expect(200);

    expect(updatePostById).toHaveBeenCalledWith({
      id: 'post-7',
      text: 'updated',
      attachments,
      files: [
        expect.objectContaining({
          originalname: 'upload.bin',
        }),
      ],
    });
  });

  it('calls deletePostById with route param id', async () => {
    const deletePostById = vi.fn(async () => {
      return { ok: true };
    });

    const app = buildApp({
      getPosts: vi.fn(),
      createPost: vi.fn(),
      updatePostById: vi.fn(),
      deletePostById,
    });

    await request(app).delete('/posts/post-9').expect(200);

    expect(deletePostById).toHaveBeenCalledWith({ id: 'post-9' });
  });
});
