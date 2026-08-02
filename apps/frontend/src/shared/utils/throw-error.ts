export const throwError = (...parameters: ConstructorParameters<typeof Error>): never => {
  throw new Error(...parameters);
};
