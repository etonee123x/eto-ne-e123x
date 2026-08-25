import { logger } from '@/shared/logger';
import { isNil } from '@/utils/isNil';
import { throwError } from '@/utils/throwError';

export const nonNullable = <T>(parameter: T, _message?: string) => {
  if (!isNil(_message)) {
    logger.error(_message);
  }

  return parameter ?? throwError(_message);
};
