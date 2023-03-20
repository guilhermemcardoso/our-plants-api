import { errorRes } from './responses.js'
import User from '../domains/user/user.model.js'
import { JwtTokenType, decodeToken, validateToken } from '../services/jwt.js'
import { ADMIN_LEVEL } from './constants.js'

export const isAdmin = async function (req, res, next) {
  try {
    const bearerToken = req.get('Authorization')
    if (!bearerToken) {
      return errorRes(res, 'Unauthorized.', 401)
    }

    const token = bearerToken.replace('Bearer ', '')
    const isValid = await validateToken({
      token,
      type: JwtTokenType.ACCESS,
    })
    if (!isValid) {
      return errorRes(res, 'Unauthorized.', 401)
    }

    const decodedToken = await decodeToken({ token, type: JwtTokenType.ACCESS })

    const user = await User.getById({ id: decodedToken.sub })

    if (!user || user.level < ADMIN_LEVEL) {
      return errorRes(res, 'Unauthorized.', 401)
    }

    req.user = {
      id: decodedToken.sub,
      email: decodedToken.email,
      name: decodedToken.name,
    }

    req.token = token
    return next()
  } catch (err) {
    return errorRes(res, 'Unauthorized.', 401)
  }
}

export const isAuthorized = async function (req, res, next) {
  try {
    const bearerToken = req.get('Authorization')
    if (!bearerToken) {
      return errorRes(res, 'Unauthorized.', 401)
    }

    const token = bearerToken.replace('Bearer ', '')
    const isValid = await validateToken({
      token,
      type: JwtTokenType.ACCESS,
    })
    if (!isValid) {
      return errorRes(res, 'Unauthorized.', 401)
    }
    const decodedToken = await decodeToken({ token, type: JwtTokenType.ACCESS })

    req.user = {
      id: decodedToken.sub,
      email: decodedToken.email,
      name: decodedToken.name,
    }

    req.token = token
    return next()
  } catch (err) {
    return errorRes(res, 'Unauthorized.', 401)
  }
}
