import type { StoredFileAudio } from './audio.stored-file';
import type { StoredFileImage } from './image.stored-file';
import type { StoredFileUnknown } from './unknown.stored-file';
import type { StoredFileVideo } from './video.stored-file';

export type StoredFile = StoredFileAudio | StoredFileImage | StoredFileVideo | StoredFileUnknown;
