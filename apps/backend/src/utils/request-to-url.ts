import type Express from 'express';

export const requestToUrl = (request: Express.Request) => {
  return new URL(`${request.protocol}://${request.get('host')}${request.originalUrl}`);
};
