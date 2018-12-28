export const isStringArray = (array: any[]): array is string[] => {
  if (!array.length) return false
  return array.every(val => typeof val === 'string')
}
