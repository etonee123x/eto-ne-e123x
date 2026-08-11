import { isNil } from './is-nil';

export const objectGet = (object: unknown, path: string | number | Array<string | number>): unknown => {
  if (isNil(object)) {
    return;
  }

  let pathArray: Array<string>;

  if (Array.isArray(path)) {
    pathArray = path.map(String);
  } else if (typeof path === 'number') {
    pathArray = [String(path)];
  } else {
    pathArray = path.split('.');
  }

  let result: unknown = object;

  for (const maybeKey of pathArray) {
    if (isNil(maybeKey)) {
      return;
    }

    if (isNil(result)) {
      return result;
    }

    if (!Object.prototype.hasOwnProperty.call(result, maybeKey)) {
      return;
    }

    result = (result as { [maybeKey]: unknown })[maybeKey];
  }

  return result;
};
