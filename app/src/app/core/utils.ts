export function getRandomHash(size: number = 5): string {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, size);
}
