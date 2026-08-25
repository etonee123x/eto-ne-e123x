export const throwError = (...parameters: ConstructorParameters<typeof Error>): never => {
  // лучше и быть не может
  // eslint-disable-next-line unicorn/no-invalid-argument-count
  throw new Error(...parameters);
};
