import { isProduction } from '@/constants/mode';
import { isNil } from '@etonee123x/shared/utils/isNil';
import { throwError } from '@etonee123x/shared/utils/throwError';

export const nonNullable = <T>(parameter: T, _message?: string) => {
  const message = isProduction ? undefined : _message;

  if (!isNil(message)) {
    console.error(message);
  }

  return parameter ?? throwError(message);
};
