export const awaitSuspensesIfNecessary = async (
  suspenses: ReadonlyArray<readonly [boolean, () => Promise<unknown>]>,
) => {
  if (
    suspenses.some(([isEnabled]) => {
      return isEnabled;
    })
  ) {
    await Promise.all(
      suspenses
        .filter(([isEnabled]) => {
          return isEnabled;
        })
        .map(([, suspense]) => {
          return suspense();
        }),
    );
  }
};
