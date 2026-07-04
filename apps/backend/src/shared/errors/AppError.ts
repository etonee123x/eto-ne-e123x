export class AppError extends Error {
  constructor(
    public readonly statusCode: number = 500,
    ...parameters: ConstructorParameters<typeof Error>
  ) {
    super(...parameters);
  }
}
