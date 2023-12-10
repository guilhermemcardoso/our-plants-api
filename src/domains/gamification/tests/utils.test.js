import { getXpToNextLevel } from '../utils.js'

describe('Gamification Utils', () => {
  test('getXpToNextLevel should return 100 when current level is 2', () => {
    expect(getXpToNextLevel(2)).toBe(100)
  })

  test('getXpToNextLevel should return 3700 when current level is 10', () => {
    expect(getXpToNextLevel(10)).toBe(3700)
  })

  test('getXpToNextLevel should return 475400 when current level is 99', () => {
    expect(getXpToNextLevel(99)).toBe(475400)
  })
})
