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

    const body = request.body as Record<string, unknown>;
    expect(body.attachments).toEqual([{ name: 'a.mp3' }]);
    expect(next).toHaveBeenCalledOnce();
  });

  it('throws AppError 400 when json parsing fails', () => {
    const middleware = idioticFieldMultipartFormDataToJsonParser(['attachments']);

    const request = {
      body: {
        attachments: 'not-json',
      },
    } as unknown as Express.Request;

    const next = vi.fn();

    expect(() => {
      middleware(request, {} as Express.Response, next);
    }).toThrow("Invalid JSON in field 'attachments'");
    expect(next).not.toHaveBeenCalled();
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

    const body = request.body as Record<string, unknown>;
    expect(body.attachments).toEqual([{ id: 1 }]);
    expect(next).toHaveBeenCalledOnce();
  });
});
