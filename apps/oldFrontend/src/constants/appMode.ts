import { isClient } from './target';

const appMode = isClient ? undefined : process.env.APP_MODE;

export const isAppModeTest = appMode === 'test';

export const isAppModeProduction = appMode === 'production';

export const isAppModeDevelopment = appMode === 'development';
