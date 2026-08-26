import type Express from 'express';
import { describe, expect, it } from 'vitest';

import { requestToUrl } from '@/utils/requestToUrl';

describe('requestToUrl', () => {
  it('builds absolute URL from request pieces', () => {
    const request = {
      protocol: 'https',
      originalUrl: '/posts?pageSize=10',
      get: (header: string) => {
        return header === 'host' ? 'api.example.com' : undefined;
      },
    } as Express.Request;

    const url = requestToUrl(request);

    expect(url.toString()).toBe('https://api.example.com/posts?pageSize=10');
  });
});
