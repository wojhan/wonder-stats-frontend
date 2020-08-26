export function getRandomHash(size: number = 5): string {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, size);
}

export function calculateControlValue(value: string): number {
  value = value.replace(/\s/g, '');
  if (value.includes('=')) {
    value = value.slice(0, value.indexOf('='));
  }
  const values = value.split('+');
  return values.map((v) => +v).reduce((a, b) => a + b) || 0;
}
