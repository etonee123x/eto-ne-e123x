export const fileToFileWithHashName = (file: File): File => {
  return new File([file], globalThis.crypto.randomUUID(), {
    type: file.type,
    lastModified: file.lastModified,
  });
};
