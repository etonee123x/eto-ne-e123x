import Express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { parseFiles } from '@/modules/posts/middlewares/parseFiles';

describe('parseFiles', () => {
  it('parses multipart files into request.files', async () => {
    const app = Express();

    app.post('/upload', parseFiles, (request_, response) => {
      const files = Array.isArray(request_.files) ? request_.files : [];

      return response.status(200).json({
        count: files.length,
        firstName: files[0]?.originalname ?? null,
      });
    });

    const result = await request(app)
      .post('/upload')
      .attach('files', Buffer.from('hello'), { filename: 'hello.txt', contentType: 'text/plain' })
      .expect(200);

    expect(result.body).toEqual({ count: 1, firstName: 'hello.txt' });
  });
});
