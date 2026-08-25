import type { StoredFileAudio } from './StoredFileAudio';
import type { StoredFileImage } from './StoredFileImage';
import type { StoredFileUnknown } from './StoredFileUnknown';
import type { StoredFileVideo } from './StoredFileVideo';

export type StoredFile = StoredFileAudio | StoredFileImage | StoredFileVideo | StoredFileUnknown;
