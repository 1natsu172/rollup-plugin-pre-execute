import { isStringArray } from './isStringArray'

describe('is string[] type ?', () => {
  test('Format expected to be false', () => {
    expect(isStringArray([])).toBe(false)
    expect(isStringArray([undefined])).toBe(false)
    expect(isStringArray([null])).toBe(false)
    expect(isStringArray([1])).toBe(false)
    expect(isStringArray([1, 2, 3])).toBe(false)
    expect(isStringArray([1, 'yo', 3])).toBe(false)
    expect(isStringArray([undefined, null, 0])).toBe(false)
    expect(isStringArray([undefined, 'yo', 0])).toBe(false)
  })

  test('Format expected to be true', () => {
    expect(isStringArray(['yo'])).toBe(true)
    expect(isStringArray(['foo', 'bar', 'baz'])).toBe(true)
    expect(isStringArray(['undefined', 'null', '0'])).toBe(true)
  })
})
