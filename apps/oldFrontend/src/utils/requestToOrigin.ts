import type { Request } from 'express';

export const requestToOrigin = (request: Request): string => {
  return `${request.protocol}://${request.get('host')}`;
};
