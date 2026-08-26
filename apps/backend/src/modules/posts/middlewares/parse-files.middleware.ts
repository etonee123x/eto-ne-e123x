import multer from 'multer';

// TODO: Implement streaming or chunked direct-to-storage upload for unlimited batch uploads without holding files in RAM.
export const parseFiles = multer({
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  storage: multer.memoryStorage(),
}).array('files');
