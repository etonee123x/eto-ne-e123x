class AppConfig {
  private static getRequiredEnvironmentVariable(name: string): string {
    const value = process.env[name];

    if (!value || value.trim() === '') {
      throw new Error(`${name} is not defined`);
    }

    return value;
  }

  private static parsePositiveNumber(value: string): number {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue) || numberValue <= 0) {
      throw new Error('Value must be a positive number');
    }

    return numberValue;
  }

  private static getPortFromEnvironment(): number {
    const port = Number(this.getRequiredEnvironmentVariable('PORT'));

    if (!Number.isSafeInteger(port) || port < 0 || port > 65_535) {
      throw new Error('PORT must be an integer between 0 and 65535');
    }

    return port;
  }

  /**
  HTTP server port.
  */
  readonly port: number;
  /**
  Secret used to sign and verify JWTs.
  */
  readonly secretKey: string;
  /**
  Maximum JWT lifetime in minutes.
  */
  readonly authTokenMaxLifetimeMinutes: number;
  /**
  Path to the database files.
  */
  readonly databasePath: string;
  /**
  Path to public content files.
  */
  readonly contentPath: string;
  /**
  Path to uploaded files.
  */
  readonly uploadsPath: string;
  /**
  Maximum JSON request body size.
  */
  readonly jsonBodyLimit: string;
  /**
  Allowed CORS origins.
  */
  readonly corsOrigins: Array<string>;
  /**
  Whether the application runs in production.
  */
  readonly isProduction: boolean;
  /**
  Whether the application runs in development.
  */
  readonly isDevelopment: boolean;

  constructor() {
    const nodeEnvironment = AppConfig.getRequiredEnvironmentVariable('NODE_ENV');
    const corsOrigin = AppConfig.getRequiredEnvironmentVariable('CORS_ORIGIN');

    this.port = AppConfig.getPortFromEnvironment();
    this.secretKey = AppConfig.getRequiredEnvironmentVariable('SECRET_KEY');
    this.authTokenMaxLifetimeMinutes = AppConfig.parsePositiveNumber(
      AppConfig.getRequiredEnvironmentVariable('AUTH_TOKEN_MAX_LIFETIME_MINUTES'),
    );
    this.databasePath = AppConfig.getRequiredEnvironmentVariable('DATABASE_PATH');
    this.contentPath = AppConfig.getRequiredEnvironmentVariable('CONTENT_PATH');
    this.uploadsPath = AppConfig.getRequiredEnvironmentVariable('UPLOADS_PATH');
    this.jsonBodyLimit = AppConfig.getRequiredEnvironmentVariable('JSON_BODY_LIMIT');
    this.corsOrigins = corsOrigin.split(',').map((origin) => {
      return origin.trim();
    });
    this.isProduction = nodeEnvironment === 'production';
    this.isDevelopment = nodeEnvironment === 'development';
  }
}

export const appConfig = new AppConfig();
