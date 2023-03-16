import jwt from 'jsonwebtoken'
import InternalServerError from '../error/internal-server.error.js'
import RedisCache from './redis.js'

export const JwtTokenType = {
  EMAIL_CONFIRMATION: 'EMAIL_CONFIRMATION',
  ACCESS: 'ACCESS',
  PASSWORD_RECOVERY: 'PASSWORD_RECOVERY',
  REFRESH: 'REFRESH',
}

export const TimeValues = {
  ONE_HOUR: 3600,
  TWO_HOURS: 7200,
  ONE_DAY: 86400,
  SEVEN_DAYS: 604800,
  THIRTY_DAYS: 2592000,
  THREE_MONTHS: 7776000,
}

export const ExpirationTime = {
  [JwtTokenType.ACCESS]: TimeValues.THIRTY_DAYS,
  [JwtTokenType.EMAIL_CONFIRMATION]: TimeValues.ONE_HOUR,
  [JwtTokenType.PASSWORD_RECOVERY]: TimeValues.ONE_HOUR,
  [JwtTokenType.REFRESH]: TimeValues.THREE_MONTHS,
}

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
