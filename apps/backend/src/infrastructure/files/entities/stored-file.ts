import type { StoredFileAudio } from './stored-file-audio';
import type { StoredFileImage } from './stored-file-image';
import type { StoredFileUnknown } from './stored-file-unknown';
import type { StoredFileVideo } from './stored-file-video';

export type StoredFile = StoredFileAudio | StoredFileImage | StoredFileVideo | StoredFileUnknown;
