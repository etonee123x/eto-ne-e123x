export const awaitSuspensesIfNecessary = async (
  suspenses: ReadonlyArray<readonly [boolean, () => Promise<unknown>]>,
) => {
  if (suspenses.some(([isEnabled]) => isEnabled)) {
    await Promise.all(suspenses.filter(([isEnabled]) => isEnabled).map(([, suspense]) => suspense()));
  }
};
