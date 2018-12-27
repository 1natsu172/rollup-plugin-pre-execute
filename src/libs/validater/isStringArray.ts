export const isStringArray = (array: any[]): array is string[] =>
  array.every(val => typeof val === 'string')
