import { getXpToNextLevel } from '../utils.js'

describe('Gamification Utils', () => {
  test('getXpToNextLevel should return 100 when current level is 99', () => {
    expect(getXpToNextLevel(1)).toBe(100)
  })

  test('getXpToNextLevel should return 475400 when current level is 99', () => {
    expect(getXpToNextLevel(99)).toBe(475400)
  })
})
