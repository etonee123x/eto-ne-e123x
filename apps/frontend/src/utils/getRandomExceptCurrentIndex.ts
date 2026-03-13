export const getRandomExceptCurrentIndex = (to: number, currentValue: number): number => {
  if (to < 2) {
    return currentValue;
  }

  // Всё ок
  // eslint-disable-next-line sonarjs/pseudo-random
  const newValue = Math.floor(Math.random() * to);

  if (newValue !== currentValue) {
    return newValue;
  }

  return getRandomExceptCurrentIndex(to, currentValue);
};
