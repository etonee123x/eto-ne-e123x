type Cursor = number | null;

export interface CursorPage<T> {
  rows: Array<T>;
  _meta: {
    cursorPrevious: Cursor;
    cursorNext: Cursor;
  };
}
