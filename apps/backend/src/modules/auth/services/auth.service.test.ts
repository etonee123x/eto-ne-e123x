import jsonWebToken from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppError } from '@/shared/errors/app.error';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const previousSecretKey = process.env.SECRET_KEY;
  const previousMaxLifetime = process.env.AUTH_TOKEN_MAX_LIFETIME_MINUTES;

  beforeEach(() => {
    process.env.SECRET_KEY = 'test-secret';
    process.env.AUTH_TOKEN_MAX_LIFETIME_MINUTES = '10';
  });

  afterEach(() => {
    process.env.SECRET_KEY = previousSecretKey;
    process.env.AUTH_TOKEN_MAX_LIFETIME_MINUTES = previousMaxLifetime;
  });

  const signJwt = (expiresIn: jsonWebToken.SignOptions['expiresIn']) => {
    return jsonWebToken.sign({ role: 'admin' }, String(process.env.SECRET_KEY), { expiresIn });
  };

  it('returns expiration for a valid token', () => {
    const service = new AuthService();
    const jwt = signJwt('5m');

    const result = service.login({ jwt });

    expect(result.expires).toBeInstanceOf(Date);
  });

  it('throws 401 for an invalid token', () => {
    const service = new AuthService();

    expect(() => {
      return service.login({ jwt: 'broken-token' });
    }).toThrow(AppError);
  });

  it('throws 401 when token lifetime exceeds the configured maximum', () => {
    const service = new AuthService();
    const jwt = signJwt('11m');

    expect(() => {
      return service.login({ jwt });
    }).toThrow(AppError);
  });

  it('throws 401 when token has no issued-at time', () => {
    const service = new AuthService();
    const jwt = jsonWebToken.sign({ role: 'admin' }, String(process.env.SECRET_KEY), {
      expiresIn: '5m',
      noTimestamp: true,
    });

    expect(() => {
      return service.login({ jwt });
    }).toThrow(AppError);
  });
});
