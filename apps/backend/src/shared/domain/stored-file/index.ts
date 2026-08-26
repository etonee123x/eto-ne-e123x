import type { StoredFileAudio } from './audio.stored-file';
import type { StoredFileImage } from './image.stored-file';
import type { StoredFileUnknown } from './unknown.stored-file';
import type { StoredFileVideo } from './video.stored-file';

export type StoredFile = StoredFileAudio | StoredFileImage | StoredFileVideo | StoredFileUnknown;

export { type StoredFileAudio } from './audio.stored-file';
export { type StoredFileUnknown } from './unknown.stored-file';
export { type StoredFileImage } from './image.stored-file';
export { type StoredFileVideo } from './video.stored-file';
