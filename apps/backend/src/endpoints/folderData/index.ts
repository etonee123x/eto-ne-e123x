import { Router } from 'express';
import { handler } from './handlers';
import { addSinceTimestamps } from '@/helpers/addSinceTimestamps';

const router = Router();

router.get(new RegExp(`((/[^/]+)+)*`), async (req, res, next) => {
  await handler(req.params[0] || '/')
    .then((folderData) => {
      const now = Date.now();

      const folderDataWithSinceTimestamps = {
        ...folderData,
        items: folderData.items.map((item) => ({
          ...item,
          _meta: addSinceTimestamps(item._meta, now),
        })),
        linkedFile: folderData.linkedFile
          ? {
              ...folderData.linkedFile,
              _meta: addSinceTimestamps(folderData.linkedFile._meta, now),
            }
          : null,
      };

      res.send(folderDataWithSinceTimestamps);
    })
    .catch(next);
});

export { router };
