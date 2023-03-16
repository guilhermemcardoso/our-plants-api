import jwt from 'jsonwebtoken'
import { ExpirationTime, JwtTokenType } from '../constants.js'
import InternalServerError from '../../../error/internal-server.error.js'
import RedisCache from '../../../services/redis/index.js'

export function getCacheKeyAndValueNames({ type, token, value }) {
  switch (type) {
    case JwtTokenType.ACCESS:
      return { key: `${type}-${token}`, value: value }
    default:
      return { key: `${type}-${value}`, value: token }
  }
}

export function checkCachedValue({ type, token, value, cachedValue }) {
  switch (type) {
    case JwtTokenType.ACCESS:
      return value === cachedValue
    default:
      return token === cachedValue
  }
}

export async function decodeToken({ token, type }) {
  try {
    const secretOrPrivateKey = process.env[`JWT_${type}_SECRET`]
    const decoded = jwt.verify(token, secretOrPrivateKey)
    return decoded
  } catch (err) {
    throw new InternalServerError('Internal Error.')
  }
}

export async function generateJwt({ payload, type, cachedValue }) {
  try {
    const secretOrPrivateKey = process.env[`JWT_${type}_SECRET`]
    const expiresIn = getExpirationTime(type)
    const token = jwt.sign(payload, secretOrPrivateKey, {
      expiresIn,
    })

    const { key, value } = getCacheKeyAndValueNames({
      type,
      token,
      value: cachedValue,
    })
    await RedisCache.setCache({
      key,
      value,
      expirationTime: expiresIn,
    })

    return token
  } catch (err) {
    throw new InternalServerError('Internal Error.')
  }
}

export async function validateToken({ token, type, value = null }) {
  try {
    const secretOrPrivateKey = process.env[`JWT_${type}_SECRET`]
    const decoded = jwt.verify(token, secretOrPrivateKey)

    if (!decoded) {
      return false
    }

    const { email } = decoded
    const { key } = getCacheKeyAndValueNames({
      type,
      token,
      value: value ? value : email,
    })
    const isCached = await RedisCache.getCache(key)

    if (!isCached) {
      return false
    }

    return checkCachedValue({
      type,
      token,
      value: value ? value : email,
      cachedValue: isCached,
    })
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError')
      return false
    throw new InternalServerError('Internal Error.')
  }
}

export async function removeJwt({ token, type, value = null }) {
  try {
    const secretOrPrivateKey = process.env[`JWT_${type}_SECRET`]
    const decoded = jwt.verify(token, secretOrPrivateKey)

    if (!decoded) {
      return false
    }

    const { email } = decoded
    const { key } = getCacheKeyAndValueNames({
      type,
      token,
      value: value ? value : email,
    })
    const isCached = await RedisCache.deleteCache(key)

    if (!isCached) {
      return false
    }

    return decoded
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError')
      return false
    throw new InternalServerError('Internal Error.')
  }
}

export function getExpirationTime(type) {
  return ExpirationTime[type]
}
