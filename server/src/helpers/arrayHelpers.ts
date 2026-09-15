export const isNonEmptyArray = <T>(value: unknown): value is T[] =>
  Array.isArray(value) && value.length > 0;

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
