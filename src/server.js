import express from 'express'
import auth from './domains/auth/auth.controller.js'
import complaint from './domains/complaint/complaint.controller.js'
import favorite from './domains/favorite/favorite.controller.js'
import plant from './domains/plant/plant.controller.js'
import specie from './domains/specie/specie.controller.js'
import user from './domains/user/user.controller.js'
import { notFound } from './common/responses.js'

const router = express.Router()

export default router
  .get('/ping', (req, res) => res.json('pong'))
  .use('/auth', auth)
  .use('/complaint', complaint)
  .use('/favorite', favorite)
  .use('/plant', plant)
  .use('/specie', specie)
  .use('/user', user)

  .use(notFound)
