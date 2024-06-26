import { expect, test } from 'vitest'

import { isValidRuleName } from './rule-utils.js'

test('isValidRuleName - valid', () => {
  expect(isValidRuleName('foo')).toBe(true)
  expect(isValidRuleName('foo-bar')).toBe(true)
  expect(isValidRuleName('foo0123_-3bar')).toBe(true)
  expect(isValidRuleName('@foo0123_-3bar/v0')).toBe(true)
  expect(isValidRuleName('@baz/foo-bar')).toBe(true)
})

test('isValidRuleName - invalid', () => {
  expect(isValidRuleName('')).toBe(false)
  expect(isValidRuleName('foo bar')).toBe(false)
  expect(isValidRuleName('invalid name')).toBe(false)
  expect(isValidRuleName('-')).toBe(false)
  expect(isValidRuleName('_')).toBe(false)
  expect(isValidRuleName('@')).toBe(false)
  expect(isValidRuleName('foo$')).toBe(false)
  expect(isValidRuleName('@foo/bar/2')).toBe(false)
  expect(isValidRuleName('2foo')).toBe(false)
  expect(isValidRuleName('_foo')).toBe(false)
})
