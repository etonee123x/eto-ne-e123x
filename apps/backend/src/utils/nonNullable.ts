import { logger } from '@/helpers/logger';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { throwError } from '@etonee123x/shared/utils/throwError';

export const nonNullable = <T>(parameter: T, _message?: string) => {
  if (!isNil(_message)) {
    logger.error(_message);
  }

  return parameter ?? throwError(_message);
};
