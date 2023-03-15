import { errorRes } from './response.js'
import { readOne } from '../services/mongodb/crud.js'
import User from '../domains/user/user.model.js'
import { decodeToken, validateToken } from '../domains/auth/utils/jwt.js'
import { JwtTokenType } from '../domains/auth/constants.js'

export function notFound(req, res, _) {
  return errorRes(res, 'you are lost.', 404)
}

export async function onlyAdmin(req, res, next) {
  const { user_id } = req.query
  try {
    const user = await readOne(User, { user_id })
    if (user && user.level >= 10) return next()
  } catch (error) {
    return unauthorized(req, res)
  }
  return unauthorized(req, res)
}

export function unauthorized(req, res) {
  const errMsg = 'Unauthorized.'
  return errorRes(res, errMsg, 401)
}

export const isAuthorized = async function (req, res, next) {
  try {
    const bearerToken = req.get('Authorization')
    if (!bearerToken) {
      return unauthorized(req, res)
    }

    const token = bearerToken.replace('Bearer ', '')
    const isValid = await validateToken({
      token,
      type: JwtTokenType.ACCESS,
    })
    if (!isValid) {
      return unauthorized(req, res)
    }

    const decodedToken = await decodeToken({ token, type: JwtTokenType.ACCESS })

    req.user = {
      id: decodedToken.sub,
      email: decodedToken.email,
      name: decodedToken.name,
    }

    return next()
  } catch (err) {
    return unauthorized(req, res)
  }
}
