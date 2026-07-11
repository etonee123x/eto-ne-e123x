export const to0To1Borders = (
  currentValue: number,
  [minValue = 0, maxValue]: [number | undefined, number] = [0, 1],
) => {
  return Math.max(0, Math.min(1, (currentValue - minValue) / (maxValue - minValue)));
};
