export function getXpToNextLevel(level) {
  const xp = 50 * Math.pow(level, 2) - 150 * level + 200
  return xp
}
