export const getRandomNum = (min: number, max: number, isInt = false): number => {
  const num = Math.random() * (max - min) + min;
  if (isInt) Math.floor(num);
  return Number(num.toFixed(2));
};
