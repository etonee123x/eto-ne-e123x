export const isServer = !globalThis.window as boolean;

export const isClient = Boolean(globalThis.window);
