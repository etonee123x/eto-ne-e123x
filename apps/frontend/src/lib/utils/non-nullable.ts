import { throwError } from '@/lib/utils/throw-error';

export const nonNullable = <T>(parameter: T) => {
  return parameter ?? throwError();
};
