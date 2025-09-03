import { isServer } from './target';

const appMode = isServer ? process.env.APP_MODE : undefined;

export const isAppModeTest = appMode === 'test';

export const isAppModeProduction = appMode === 'production';

export const isAppModeDevelopment = appMode === 'development';
