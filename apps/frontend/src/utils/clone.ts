import { jsonParse } from '@etonee123x/shared/utils/jsonParse';

export const clone = <T>(argument: T): T => {
  return jsonParse.unsafe<T>(JSON.stringify(argument));
};
