import User from '../user/user.model.js'
import Plant from '../plant/plant.model.js'
import ConflictError from '../../error/conflict.error.js'
import BadRequestError from '../../error/bad-request.error.js'
import UnauthorizedError from '../../error/unauthorized.error.js'
import {
  JwtTokenType,
  getToken,
  decodeToken,
  generateJwt,
  removeJwt,
  validateToken,
} from '../../services/jwt.js'
import { checkPassword, encryptPassword } from '../../services/crypt.js'
import { intervalToDuration } from 'date-fns'
import GamificationService from '../gamification/gamification.service.js'

export default class AuthService {
  static async register({ userData }) {
    const data = {
      ...userData,
      password: await encryptPassword(userData.password),
    }

    const alreadyExists = await User.getByEmail({ email: userData.email })

    if (alreadyExists) {
      throw new ConflictError('Email already registered.')
    }

    const user = await User.create(data)
    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password
    return userWithoutPassword
  }

  static async emailConfirmation({ token, type }) {
    const isTokenValid = await validateToken({ token, type })
    if (!isTokenValid) {
      throw new BadRequestError('Bad request.')
    }
    const { email } = await decodeToken({ token, type })
    const user = await User.updateByEmail({
      email,
      data: { confirmed_email: true },
    })
    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password
    removeJwt({ token, type })

    return userWithoutPassword
  }

  static async canResendToken({ email, type }) {
    const tokenExists = await getToken({ email, type })

    if (!tokenExists) {
      return true
    }

    const decodedToken = await decodeToken({
      token: tokenExists,
      type: type,
    })

    const { minutes } = intervalToDuration({
      start: new Date(decodedToken.created_at),
      end: new Date(),
    })

    if (minutes < process.env[`${type}_MIN_WAITING_TIME`]) {
      return false
    }

    return true
  }

  static async validatePasswordRecoveryToken({ token }) {
    const isValid = await validateToken({
      token,
      type: JwtTokenType.PASSWORD_RECOVERY,
    })
    if (!isValid) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async login({ email, password }) {
    const user = await User.getByEmail({
      email,
    })
    if (!user) {
      throw new UnauthorizedError('Authentication failed.')
    }

    const isPasswordValid = await checkPassword({
      password,
      encryptedPassword: user.password,
    })

    if (!isPasswordValid) {
      throw new UnauthorizedError('Authentication failed.')
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

    delete userWithoutPassword.password

    if (!user.confirmed_email) {
      return {
        user: userWithoutPassword,
        access_token: null,
        refresh_token: null,
      }
    }

    const tokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
    }

    const accessToken = await generateJwt({
      payload: tokenPayload,
      type: JwtTokenType.ACCESS,
      cachedValue: user.email,
    })

    const refreshToken = await generateJwt({
      payload: tokenPayload,
      type: JwtTokenType.REFRESH,
      cachedValue: accessToken,
    })

    return {
      user: userWithoutPassword,
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }

  static async passwordRecovery({ password, token }) {
    const isTokenValid = await validateToken({
      token,
      type: JwtTokenType.PASSWORD_RECOVERY,
    })

    if (!isTokenValid) {
      throw new BadRequestError('Bad request.')
    }

    const { email } = await decodeToken({
      token,
      type: JwtTokenType.PASSWORD_RECOVERY,
    })

    const user = await User.updateByEmail({
      email,
      data: { password: await encryptPassword(password) },
    })

    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password

    removeJwt({ token, type: JwtTokenType.PASSWORD_RECOVERY })
  }

  static async refreshToken({ oldToken, refreshToken }) {
    const isValid = validateToken({
      token: refreshToken,
      type: JwtTokenType.REFRESH,
      value: oldToken,
    })

    if (!isValid) {
      throw new UnauthorizedError('Authentication failed.')
    }

    const { sub, email, name } = await decodeToken({
      token: refreshToken,
      type: JwtTokenType.REFRESH,
    })

    const tokenPayload = { sub, email, name }
    const newAccessToken = await generateJwt({
      payload: tokenPayload,
      type: JwtTokenType.ACCESS,
      cachedValue: tokenPayload.email,
    })
    const newRefreshToken = await generateJwt({
      payload: tokenPayload,
      type: JwtTokenType.REFRESH,
      cachedValue: newAccessToken,
    })

    await removeJwt({ token: oldToken, type: JwtTokenType.ACCESS })
    await removeJwt({
      token: refreshToken,
      type: JwtTokenType.REFRESH,
      value: oldToken,
    })

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    }
  }
}
