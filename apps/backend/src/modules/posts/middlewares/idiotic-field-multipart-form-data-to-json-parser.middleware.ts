import type Express from 'express';

export const idioticFieldMultipartFormDataToJsonParser = (fields: Array<string>): Express.RequestHandler => {
  return (...[request, , next]) => {
    for (const field of fields) {
      if (typeof request.body[field] === 'string') {
        try {
          request.body[field] = JSON.parse(request.body[field]);
        } catch {
          request.body[field] = undefined;
        }
      }
    }
    next();
  };
};
