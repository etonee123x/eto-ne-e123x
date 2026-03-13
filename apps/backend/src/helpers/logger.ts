type ConsoleFunctionParameters = Parameters<typeof console.log>;

const logger = (...parameters: ConsoleFunctionParameters) => {
  console.info(`${new Date().toISOString()}:`, ...parameters);
};

logger.error = (...parameters: ConsoleFunctionParameters) => {
  console.error(`[error] ${new Date().toISOString()}:`, ...parameters);
};

export { logger };
