import multer from 'multer';

export const parseFiles = multer({
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  storage: multer.memoryStorage(),
}).array('files');
