import User from '../user/user.model.js'
import { ExperiencePerAction } from './constants.js'
import { getXpToNextLevel } from './utils.js'

export default class GamificationService {
  static async gamifyUserAction({ user, action }) {

    const xpToNextLevel = getXpToNextLevel(user.score.level + 1)
    const actionXp = ExperiencePerAction[action]
    const totalXp = actionXp + user.score.xp

    const updatedScore = {
      xp: totalXp > xpToNextLevel ? totalXp - xpToNextLevel : totalXp,
      level: totalXp > xpToNextLevel ? user.score.level + 1 : user.score.level,
    }

    return await User.updateById({ id: user._id, data: { score: updatedScore } })
  }
}
