import express from 'express'
import auth from './domains/auth/auth.controller.js'
import complaint from './domains/complaint/complaint.controller.js'
import plant from './domains/plant/plant.controller.js'
import specie from './domains/specie/specie.controller.js'
import user from './domains/user/user.controller.js'
import { notFound } from './common/middleware.js'

const router = express.Router()

export default router
  .get('/ping', (req, res) => res.json('pong'))
  .use('/complaint', complaint)
  .use('/plant', plant)
  .use('/user', user)
  .use('/auth', auth)
  .use('/specie', specie)

  .use(notFound)
