import express from 'express'
import logger from 'morgan'
// NOTE: use this import for dev
import helmet from 'helmet'
// NOTE: use this import for prod
// import helmet from 'helmet/index.cjs'
import cors from 'cors'
import dotenv from 'dotenv'
// NOTE: use this import for dev
// import rateLimit from 'express-rate-limit/dist/index.cjs'
// NOTE: use this import for prod
import rateLimit from 'express-rate-limit'
import server from './src/server.js'
import { notFound } from './src/common/responses.js'
import { connect as mongoConnect } from './src/services/mongodb.js'
import RedisCache from './src/services/redis.js'

const app = express()

if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})

mongoConnect()
RedisCache.connect()

const PORT = process.env.PORT || 3333

app
  .use(cors())
  .use(helmet())
  .use(logger('dev'))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(limiter)
  .use('/', server)
  .use(notFound)

app.listen(PORT, () => `Server running on port ${PORT}!`)

export default app