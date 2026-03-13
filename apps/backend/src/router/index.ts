import { router as postsRouter } from '@/endpoints/posts';
import { router as authRouter } from '@/endpoints/auth';
import { router as folderDataRouter } from '@/endpoints/folderData';

import Express from 'express';

export const router = Express.Router();

router.use(postsRouter);
router.use(authRouter);
router.use(folderDataRouter);
