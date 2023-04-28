import User from '../user/user.model.js'
import { ExperiencePerAction } from './constants.js'
import { getXpToNextLevel } from './utils.js'

export default class GamificationService {
  static async gamifyUserAction({ user, action }) {
    let xpToNextLevel = getXpToNextLevel(user.score.level + 1)
    const actionXp = ExperiencePerAction[action]
    const totalXp = actionXp + user.score.xp

    const updatedScore = {
      xp: totalXp >= xpToNextLevel ? totalXp - xpToNextLevel : totalXp,
      level: totalXp >= xpToNextLevel ? user.score.level + 1 : user.score.level,
    }

    if (updatedScore.level > user.score.level) {
      xpToNextLevel = getXpToNextLevel(updatedScore.level + 1)
    }

    const updatedAuthor = await User.updateById({
      id: user._id,
      data: { score: updatedScore },
    })

    const userWithoutPassword = {
      ...updatedAuthor,
      score: { ...updatedAuthor.score, xp_next_level: xpToNextLevel },
    }

    delete userWithoutPassword.password
    return userWithoutPassword
  }

  static getTotalXpByLevel(level) {
    return getXpToNextLevel(level)
  }
}
