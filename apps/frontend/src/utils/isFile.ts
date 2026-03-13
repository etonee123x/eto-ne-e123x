export const isFile = (argument: unknown): argument is File => {
  return argument instanceof File;
};
