import type { RequestHandler } from 'express';

export const send404: RequestHandler = (...[, response]) => {
  response.sendStatus(404);
};
