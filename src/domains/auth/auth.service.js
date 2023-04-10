import User from '../user/user.model.js'
import ConflictError from '../../error/conflict.error.js'
import BadRequestError from '../../error/bad-request.error.js'
import UnauthorizedError from '../../error/unauthorized.error.js'
import {
  JwtTokenType,
  decodeToken,
  generateJwt,
  removeJwt,
  validateToken,
} from '../../services/jwt.js'
import { checkPassword, encryptPassword } from '../../services/crypt.js'
import UserService from '../user/user.service.js'

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

  static async checkEmailConfirmationToken({ email }) {
    const tokenExists = await checkEmailConfirmationJwt({ email })
    if (!tokenExists) {
      throw new BadRequestError('Bad request.')
    }
    const { user } = await UserService.getUserByEmail(email)

    if (!user) {
      throw new BadRequestError('Bad request.')
    }

    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password

    return userWithoutPassword
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

    const userWithoutPassword = { ...user }
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

  static async recoveryPassword({ email, password, token }) {
    const isTokenValid = await validateToken({
      token,
      type: JwtTokenType.PASSWORD_RECOVERY,
    })

    if (!isTokenValid) {
      throw new BadRequestError('Bad request.')
    }

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
