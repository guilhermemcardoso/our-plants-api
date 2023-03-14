import express from 'express'
import logger from 'morgan'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import server from './src/server.js'
import { notFound } from './src/common/middleware.js'
import cors from 'cors'
import { connect as mongoConnect } from './src/services/mongodb/connection.js'
import RedisCache from './src/services/redis/index.js'
import dotenv from 'dotenv'

async function run() {
  const app = express()

  if (process.env.NODE_ENV !== 'production') {
    dotenv.config()
  }

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });

  mongoConnect()
  RedisCache.connect()

  const PORT = process.env.PORT || 3333

  app
    .use(cors())
    .use(helmet())
    .use(logger('dev'))
    .use(express.json())
    .use(limiter)
    .use('/', server)
    .use(notFound)

  app.listen(PORT, () => `Server running on port ${PORT}!`)
}

run()
