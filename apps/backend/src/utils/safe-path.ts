import fs from 'node:fs';
import path from 'node:path';
import { AppError } from '@/shared/errors/app.error';

export const resolveSafePath = (baseDirectory: string, userPath: string): string => {
  const root = path.resolve(baseDirectory);
  const normalizedUserPath = userPath.replaceAll('\\', '/');
  const target = path.resolve(root, normalizedUserPath);
  const relative = path.relative(root, target);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new AppError(400, 'Invalid path');
  }

  try {
    if (fs.existsSync(root)) {
      const realRoot = fs.realpathSync(root);
      let current = target;

      while (current !== root && current !== path.dirname(current) && !fs.existsSync(current)) {
        current = path.dirname(current);
      }

      if (fs.existsSync(current)) {
        const realCurrent = fs.realpathSync(current);
        const realRelative = path.relative(realRoot, realCurrent);

        if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
          throw new AppError(400, 'Invalid path');
        }
      }
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
  }

  return target;
};
