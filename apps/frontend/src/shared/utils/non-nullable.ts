import { throwError } from '@/shared/utils/throw-error';

export const nonNullable = <T>(parameter: T) => {
  return parameter ?? throwError();
};
