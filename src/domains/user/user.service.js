import * as bcrypt from 'bcrypt'
import BadRequestError from '../../error/bad-request.error.js'
import NotFoundError from '../../error/not-found.error.js'
import { encryptPassword, checkPassword } from '../../services/crypt.js'
import { removeJwt, JwtTokenType } from '../../services/jwt.js'
import User from './user.model.js'
import Plant from '../plant/plant.model.js'
import GamificationService from '../gamification/gamification.service.js'

export default class UserService {
  static async create({ userData }) {
    const data = {
      ...userData,
      password: await bcrypt.hash(userData.password, 10),
    }

    const user = await User.create(data)

    return {
      ...user,
      password: undefined,
    }
  }

  static async getUserById(id, showPassword = false) {
    const user = await User.getById({ id })

    if (!user) {
      throw new NotFoundError('Not found.')
    }

    const plants = await Plant.count({ created_by: user._id })
    const totalXpNextLevel = GamificationService.getTotalXpByLevel(
      user.score.level + 1
    )
    const userWithoutPassword = {
      ...user,
      mapped_plants: plants,
      score: { ...user.score, xp_next_level: totalXpNextLevel },
    }

    if (showPassword) {
      return userWithoutPassword
    }

    delete userWithoutPassword.password
    return userWithoutPassword
  }

  static async getUserByEmail(email, showPassword = false) {
    const user = await User.getByEmail({ email })

    if (!user) {
      throw new NotFoundError('Not found.')
    }

    const totalXpNextLevel = GamificationService.getTotalXpByLevel(
      user.score.level + 1
    )
    const userWithoutPassword = {
      ...user,
      score: { ...user.score, xp_next_level: totalXpNextLevel },
    }

    if (showPassword) {
      return userWithoutPassword
    }

    delete userWithoutPassword.password
    return userWithoutPassword
  }

  static async updateUser({ id, values }) {
    const data = { ...values }
    data.updated_at = new Date()
    const user = await User.updateById({ id, data })
    if (!user) {
      throw new NotFoundError('Not found.')
    }
    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password
    return userWithoutPassword
  }

  static async changePassword({ id, newPassword, oldPassword }) {
    const currentUser = await UserService.getUserById(id, true)
    if (!currentUser) {
      throw new BadRequestError('Bad request.')
    }

    const passwordIsValid = await checkPassword({
      password: oldPassword,
      encryptedPassword: currentUser.password,
    })

    if (!passwordIsValid) {
      throw new BadRequestError('Bad request.')
    }

    const password = await encryptPassword(newPassword)
    const data = { password }
    data.updated_at = new Date()
    const user = await User.updateById({ id, data })
    if (!user) {
      throw new NotFoundError('Not found.')
    }
    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password
    return userWithoutPassword
  }

  static async updateProfileImage({ id, profile_image }) {
    const data = { profile_image: profile_image }
    data.updated_at = new Date()
    const user = await User.updateById({ id, data })
    if (!user) {
      throw new NotFoundError('Not found.')
    }
    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password
    return userWithoutPassword
  }

  static async deleteAccount({ id, email, token }) {
    await User.removeById({ id })
    removeJwt({ token, type: JwtTokenType.ACCESS, value: email })
  }

  static async removeProfileImage(id) {
    const user = await User.updateById({
      id,
      data: { $unset: { profile_image: '' }, $set: { updated_at: new Date() } },
    })

    if (!user) {
      throw new NotFoundError('Not found.')
    }

    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password
    return userWithoutPassword
  }

  static async checkProfileCompleted(user) {
    if (!user._id) return false
    if (!user.name) return false
    if (!user.lastname) return false
    if (!user.email) return false
    if (!user.profile_image) return false
    if (!user.bio) return false
    if (!user.address) return false
    if (!user.address.street_name) return false
    if (!user.address.neighbourhood) return false
    if (!user.address.zip_code) return false
    if (!user.address.house_number) return false
    if (!user.address.city) return false
    if (!user.address.state_or_province) return false
    if (!user.address.country) return false

    return await User.updateById({
      id: user._id,
      data: { completed_profile: true },
    })
  }
}
