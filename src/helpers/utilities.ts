export type Point = [number, number];

export const debounce = <T extends (...args: never[]) => void>(
  func: T,
  wait: number
) => {
  let timeout: ReturnType<typeof setTimeout>;
  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced;
};
