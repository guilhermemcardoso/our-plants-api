import { errorRes } from './response.js'
import { readOne } from '../services/mongodb/crud.js'
import User from '../domains/user/user.model.js'
import { validateToken } from '../domains/auth/utils/jwt.js'
import { JwtTokenType } from '../domains/auth/constants.js'
import RedisCache from '../services/redis/index.js'

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
    const token = req.get('Authorization')
    if (!token) {
      return unauthorized(req, res)
    }
    const validToken = await validateToken({
      token: token.replace('Bearer ', ''),
      type: JwtTokenType.ACCESS,
    })
    if (!validToken) {
      return unauthorized(req, res)
    }
    
    req.user = {
      id: validToken.sub,
      email: validToken.email,
      name: validToken.name,
    }
    return next()
  } catch (err) {
    return unauthorized(req, res)
  }
}
