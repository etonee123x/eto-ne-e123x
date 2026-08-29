interface Logger {
  log(message: string): void;
  info(message: string): void;
  error(message: string): void;
  warn(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string): void {
    // eslint-disable-next-line no-console
    console.log(message);
  }
  info(message: string): void {
    // eslint-disable-next-line no-console
    console.info(message);
  }
  error(message: string): void {
    // eslint-disable-next-line no-console
    console.error(message);
  }
  warn(message: string): void {
    // eslint-disable-next-line no-console
    console.warn(message);
  }
}

export const logger = new ConsoleLogger();
