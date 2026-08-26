import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const infrastructureDirectory = path.resolve(backendDirectory, '..', '..', 'infra');

process.env.NODE_ENV = 'test';
process.env.SECRET_KEY ??= 'test-secret-key-at-least-32-characters';
process.env.DATABASE_PATH ??= path.resolve(infrastructureDirectory, 'database');
process.env.CONTENT_PATH ??= path.resolve(infrastructureDirectory, 'content');
process.env.UPLOADS_PATH ??= path.resolve(infrastructureDirectory, 'uploads');
process.env.PORT ??= '0';
