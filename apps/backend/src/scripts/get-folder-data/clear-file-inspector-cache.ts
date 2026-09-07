import 'dotenv/config';

import { FileInspectorCacheService } from '@/infrastructure/files/services/file-inspector-cache.service';

// Cache has no source data; removing every entry forces the next request or warmup to rebuild it.
await new FileInspectorCacheService().clear();
