import express from 'express'

import { isAuthorized, notFound } from '../../common/middleware.js'
import { successRes, errorRes } from '../../common/response.js'
import UserService from './user.service.js'

const router = express.Router()

router.get('/me', isAuthorized, getCurrentUser).use(notFound)

async function updateUser(req, res) {
  const { _id } = req.params
  const item = req.body
  item.updated_at = new Date()
  try {
    const user = await update(User, _id, item)
    if (user) {
      return successRes(res, user, 200)
    }
  } catch (error) {
    return errorRes(res, 'Bad Request.', 400)
  }
  return errorRes(res, null, 404)
}

async function getUserById(req, res) {
  const { _id } = req.params
  try {
    const user = await readOne(User, { _id })
    if (user) {
      return successRes(res, user, 200)
    }
  } catch (error) {
    return errorRes(res, 'Bad Request.', 400)
  }
  return errorRes(res, null, 404)
}

async function list(req, res) {
  const { page, items } = req.query
  try {
    const users = await read(User, {
      limit: items,
      skip: (page - 1) * items,
    })
    if (users) {
      return successRes(res, users, 200)
    }
  } catch (error) {
    return errorRes(res, 'Bad Request.', 400)
  }
  return successRes(res, [], 200)
}

async function getCurrentUser(req, res) {
  try {
    const {
      user: { id },
    } = req
    const user = await UserService.getUserById(id)
    return successRes(res, { user }, 200)
  } catch (error) {
    return errorRes(res, 'Bad Request.', 400)
  }
}

export default router
