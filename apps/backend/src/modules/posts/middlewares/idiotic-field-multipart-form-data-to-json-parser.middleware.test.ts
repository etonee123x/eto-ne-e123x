import type Express from 'express';
import { describe, expect, it, vi } from 'vitest';

import { idioticFieldMultipartFormDataToJsonParser } from '@/modules/posts/middlewares/idiotic-field-multipart-form-data-to-json-parser.middleware';

describe('idioticFieldMultipartFormDataToJsonParser', () => {
  it('parses json string fields', () => {
    const middleware = idioticFieldMultipartFormDataToJsonParser(['attachments']);

    const request = {
      body: {
        attachments: '[{"name":"a.mp3"}]',
      },
    } as unknown as Express.Request;

    const next = vi.fn();

    middleware(request, {} as Express.Response, next);

    expect(request.body.attachments).toEqual([{ name: 'a.mp3' }]);
    expect(next).toHaveBeenCalledOnce();
  });

  it('sets field undefined when json parsing fails', () => {
    const middleware = idioticFieldMultipartFormDataToJsonParser(['attachments']);

    const request = {
      body: {
        attachments: 'not-json',
      },
    } as unknown as Express.Request;

    const next = vi.fn();

    middleware(request, {} as Express.Response, next);

    expect(request.body.attachments).toBeUndefined();
    expect(next).toHaveBeenCalledOnce();
  });

  it('leaves non-string values untouched', () => {
    const middleware = idioticFieldMultipartFormDataToJsonParser(['attachments']);

    const request = {
      body: {
        attachments: [{ id: 1 }],
      },
    } as unknown as Express.Request;

    const next = vi.fn();

    middleware(request, {} as Express.Response, next);

    expect(request.body.attachments).toEqual([{ id: 1 }]);
    expect(next).toHaveBeenCalledOnce();
  });
});
