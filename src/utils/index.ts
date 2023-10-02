type hexToRgb_ReturnType = { r: number; g: number; b: number } | null;

export const getRandomNum = (min: number, max: number, isInt = false): number => {
  const num = Math.random() * (max - min) + min;
  if (isInt) return Math.floor(num);
  else return Number(num.toFixed(2));
};

export const hexToRgb = (hex: string): hexToRgb_ReturnType => {
  // #FF0000 or #ff0000
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? {
        r: parseInt(result[1], 16), // FF -> 255
        g: parseInt(result[2], 16), // 00 -> 0
        b: parseInt(result[3], 16), // 00 -> 0
      }
    : null;
};

export function debounce<Params extends any[]>(
  func: (...args: Params) => void,
  timeout: number
): (...args: Params) => void {
  let timer: NodeJS.Timeout;
  return (...args: Params) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}
