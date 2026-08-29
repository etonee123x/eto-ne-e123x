import fs from 'node:fs';
import path from 'node:path';
import { AppError } from '@/shared/errors/app.error';

const isOutsideRoot = (relativePath: string): boolean => {
  return relativePath === '..' || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath);
};

export const resolveSafePath = (baseDirectory: string, userPath: string): string => {
  const root = path.resolve(baseDirectory);
  const target = path.resolve(root, userPath.replace(/^\/+/, ''));
  const relative = path.relative(root, target);

  if (userPath.includes('\\') || isOutsideRoot(relative)) {
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

        if (isOutsideRoot(realRelative)) {
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
