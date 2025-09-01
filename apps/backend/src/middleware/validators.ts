import { query } from 'express-validator';
import { HANDLER_NAME } from '@/types';
import { HANDLER_NAME_TO_ROUTE } from '@/constants';
import { validationCheck } from '@/middleware/validationCheck';

const paginationValidations = [
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
];

export const ROUTE_TO_VALIDATORS = Object.freeze({
  [HANDLER_NAME_TO_ROUTE[HANDLER_NAME.GET_FOLDER_DATA]]: [],
  [HANDLER_NAME_TO_ROUTE[HANDLER_NAME.POSTS]]: [...paginationValidations, validationCheck],
});
