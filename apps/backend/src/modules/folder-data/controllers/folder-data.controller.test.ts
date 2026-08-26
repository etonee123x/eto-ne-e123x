import Express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { errorHandler } from '@/middlewares/error-handler';
import { FolderDataController } from '@/modules/folder-data/controllers/folder-data.controller';

const buildApp = (folderDataService: unknown) => {
  const app = Express();

  const controller = new FolderDataController({
    folderDataService: folderDataService as never,
  });

  app.use(controller.router);
  app.use(errorHandler);

  return app;
};

describe('FolderDataController', () => {
  it('returns 400 when path query is missing', async () => {
    const getFolderData = vi.fn();

    const app = buildApp({ getFolderData });

    const response = await request(app).get('/folder-data').expect(400);

    expect(response.body).toMatchObject({ statusCode: 400 });
    expect(getFolderData).not.toHaveBeenCalled();
  });

  it('returns service response when path is provided', async () => {
    const payload = {
      folders: [],
      files: [],
      file: null,
      pathDirectory: 'music',
    };

    const getFolderData = vi.fn(async () => {
      return payload;
    });

    const app = buildApp({ getFolderData });

    const response = await request(app).get('/folder-data?path=music').expect(200);

    expect(getFolderData).toHaveBeenCalledWith({ pathAsRelativeUrl: 'music' });
    expect(response.body).toEqual(payload);
  });
});
