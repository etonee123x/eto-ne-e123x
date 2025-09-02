import { Router } from 'express';
import busboy from 'busboy';
import { handler } from './handlers';
import { checkAuth } from '@/middleware';

const router = Router();

router.post('/', checkAuth, (request, response) => {
  const paths: Array<string> = [];

  request.pipe(
    busboy({ headers: request.headers })
      .on('file', (...args) => paths.push(handler(...args)))
      .on('close', () => response.send(paths)),
  );
});

export { router };
