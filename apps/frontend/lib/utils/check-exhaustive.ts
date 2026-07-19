export const checkExhaustive = (value: never) => {
  return new Error(`checkExhaustive: ${String(value)}`);
};
