import { afterEach, describe, expect, it, vi } from 'vitest';

import { logger } from '@/shared/logger';

describe('logger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls console.log from logger.log', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    logger.log('hello');

    expect(log).toHaveBeenCalledWith('hello');
  });

  it('calls console.info from logger.info', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    logger.info('hello');

    expect(info).toHaveBeenCalledWith('hello');
  });

  it('calls console.error from logger.error', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('hello');

    expect(error).toHaveBeenCalledWith('hello');
  });

  it('calls console.warn from logger.warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    logger.warn('hello');

    expect(warn).toHaveBeenCalledWith('hello');
  });
});
