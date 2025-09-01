import { Router } from 'express';

import { router as routerAuth } from '@/endpoints/auth';
import { router as routerFolderData } from '@/endpoints/folderData';
import { router as routerPosts } from '@/endpoints/posts';
import { router as routerUpload } from '@/endpoints/upload';

const router = Router();

router.use('/healthz', (...[, response]) => response.send('ok'));
router.use('/auth', routerAuth);
router.use('/folder-data', routerFolderData);
router.use('/posts', routerPosts);
router.use('/upload', routerUpload);

export { router };
