import Express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { parseFiles } from '@/modules/posts/middlewares/parseFiles';

const buildApp = () => {
  const app = Express();

  app.post('/upload', parseFiles, (request_, response) => {
    const files = Array.isArray(request_.files) ? request_.files : [];

    return response.status(200).json({
      count: files.length,
      firstName: files[0]?.originalname ?? null,
    });
  });

  app.use((...parameters: Parameters<Express.ErrorRequestHandler>) => {
    const [error, , response] = parameters;

    const errorCode =
      typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
        ? error.code
        : null;

    if (errorCode === 'LIMIT_FILE_SIZE') {
      return response.status(413).json({ code: errorCode });
    }

    const message = error instanceof Error ? error.message : 'Unknown upload error';

    return response.status(500).json({ message });
  });

  return app;
};

describe('parseFiles', () => {
  it('parses multipart files into request.files', async () => {
    const app = buildApp();

    const result = await request(app)
      .post('/upload')
      .attach('files', Buffer.from('hello'), { filename: 'hello.txt', contentType: 'text/plain' })
      .expect(200);

    expect(result.body).toEqual({ count: 1, firstName: 'hello.txt' });
  });

  it('returns empty files list when multipart has no files field', async () => {
    const app = buildApp();

    const result = await request(app).post('/upload').field('text', 'hello').expect(200);

    expect(result.body).toEqual({ count: 0, firstName: null });
  });

  it('surfaces error when file exceeds size limit', async () => {
    const app = buildApp();

    await request(app)
      .post('/upload')
      .attach('files', Buffer.alloc(50 * 1024 * 1024 + 1), {
        filename: 'too-big.bin',
        contentType: 'application/octet-stream',
      })
      .expect(500);
  });
});
