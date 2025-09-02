import { isServer } from '@/constants/target';

const appMode = isServer ? process.env.APP_MODE : undefined;

export const isAppModeTest = appMode === 'test';

export const isAppModeProduction = appMode === 'production';
