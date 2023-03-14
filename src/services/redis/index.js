import redis from 'redis'
import InternalServerError from '../../error/internal-server.error.js'

export default class RedisCache {
  static getInstance() {
    try {
      if (this.instance) {
        return this.instance
      }
      const options = {
        url: `${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      }

      this.instance = redis.createClient(options)

      this.instance.on('error', (error) => console.error(`Error : ${error}`))
      return this.instance
    } catch (err) {
      console.error('[REDIS] Could not connect', err)
    }
  }

  static async connect() {
    try {
      const redis = this.getInstance()
      await redis.connect()
    } catch (err) {
      throw new InternalServerError('Internal server error.')
    }
  }

  static async setCache({ key, value, expirationTime }) {
    try {
      const redis = this.getInstance()
      await redis.set(key, value, { EX: expirationTime })
    } catch (err) {
      throw new InternalServerError('Internal server error.')
    }
  }

  static async getCache(key) {
    try {
      const redis = this.getInstance()
      const value = await redis.get(key)
      return value
    } catch (err) {
      throw new InternalServerError('Internal server error.')
    }
  }

  static async deleteCache(key) {
    try {
      const redis = this.getInstance()
      const value = await redis.del(key)
      return value
    } catch (err) {
      throw new InternalServerError('Internal server error.')
    }
  }
}
