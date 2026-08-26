import type Express from 'express';
import { describe, expect, it, vi } from 'vitest';

import { send404 } from '@/middlewares/send404';

describe('send404', () => {
  it('sends 404 status', () => {
    const sendStatus = vi.fn();

    const response = {
      sendStatus,
    } as unknown as Express.Response;

    send404({} as Express.Request, response, vi.fn());

    expect(sendStatus).toHaveBeenCalledWith(404);
  });
});
