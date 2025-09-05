export const isServer = !globalThis.window;

export const isClient = Boolean(globalThis.window);
