import { fileTypeValues, itemTypeValues } from '@/types/openapi';

export const FILE_TYPES = Object.fromEntries(
  fileTypeValues.map((fileType) => {
    return [fileType, fileType];
  }),
) as {
  [Value in (typeof fileTypeValues)[number]]: Value;
};

export const ITEM_TYPES = Object.fromEntries(
  itemTypeValues.map((itemType) => {
    return [itemType, itemType];
  }),
) as {
  [Value in (typeof itemTypeValues)[number]]: Value;
};
