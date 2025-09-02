import { Router } from 'express';

import { handlers } from './handlers';
import { toId } from '@etonee123x/shared/helpers/id';

import { checkAuth } from '@/middleware';
import { throwError } from '@etonee123x/shared/utils/throwError';
import { addSinceTimestamps } from '@/helpers/addSinceTimestamps';
import { query } from 'express-validator';
import { validationCheck } from '@/middleware/validationCheck';

export const router = Router();

router.get(
  '/',
  query('page')
    .exists()
    .withMessage('Parameter is required')
    .isInt({ min: 0 })
    .withMessage('Must be a non-negative integer')
    .toInt(),
  query('perPage')
    .exists()
    .withMessage('Parameter is required')
    .isInt({ min: 1 })
    .withMessage('Must be an integer greater than 0')
    .toInt(),
  validationCheck,
  (req, res) => {
    const { rows, _meta } = handlers.get({ page: Number(req.query?.page), perPage: Number(req.query?.perPage) });

    res.send({
      _meta,
      rows: rows.map((row) => ({
        ...row,
        _meta: addSinceTimestamps(row._meta),
      })),
    });
  },
);

router.get('/:id', (req, res) => {
  const post = handlers.getById(toId(req.params.id));

  res.send({
    ...post,
    _meta: addSinceTimestamps(post._meta),
  });
});

router.post('/', checkAuth, (req, res) => {
  const post = handlers.post(req.body);

  res.send({
    ...post,
    _meta: addSinceTimestamps(post._meta),
  });
});

router.put('/:id', checkAuth, (req, res) => {
  const post = handlers.put(toId(req.params.id ?? throwError()), req.body);

  res.send({
    ...post,
    _meta: addSinceTimestamps(post._meta),
  });
});

router.patch('/:id', checkAuth, (req, res) => {
  const post = handlers.patch(toId(req.params.id ?? throwError()), req.body);

  res.send({
    ...post,
    _meta: addSinceTimestamps(post._meta),
  });
});

router.delete('/:id', checkAuth, (req, res) => {
  const post = handlers.delete(toId(req.params.id ?? throwError()));

  res.send({
    ...post,
    _meta: addSinceTimestamps(post._meta),
  });
});
