import 'dotenv/config';

import { FileInspectorCacheService } from '@/infrastructure/files/services/file-inspector-cache.service';

// Garbage collection is explicit so folder requests never pay to scan stale cache entries.
await new FileInspectorCacheService().garbageCollect();
