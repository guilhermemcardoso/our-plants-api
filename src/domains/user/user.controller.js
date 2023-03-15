import express from 'express'
import multer from 'multer'
import { isAuthorized } from '../../common/middlewares/authorization.js'
import { successRes, errorRes, notFound } from '../../common/response.js'
import BaseError from '../../error/base.error.js'
import UserService from './user.service.js'
import { removeForbiddenUserFields } from './utils/validations.js'
const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router
  .get('/:id', isAuthorized, getUserById)
  .get('/me', isAuthorized, getCurrentUser)
  .patch('/me', isAuthorized, updateCurrentUser)
  .patch('/me/change-password', isAuthorized, changePassword)
  .patch(
    '/me/profile-image',
    isAuthorized,
    upload.single('profile_image'),
    updateProfileImage
  )
  .delete('/me/profile-image', isAuthorized, removeProfileImage)
  .use(notFound)

async function updateProfileImage(req, res) {
  try {
    const {
      user: { id },
    } = req

    if (!req?.file?.buffer) {
      return errorRes(res, 'Bad Request.', 400)
    }

    const image = req.file.buffer
    const user = await UserService.updateProfileImage({
      id,
      imageBuffer: image,
    })
    if (user) {
      return successRes(res, user, 200)
    }
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
  return errorRes(res, null, 404)
}

async function removeProfileImage(req, res) {
  try {
    const {
      user: { id },
    } = req

    const user = await UserService.removeProfileImage(id)
    if (user) {
      return successRes(res, user, 200)
    }
  } catch (error) {
    console.log('ERRO', error)
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
  return errorRes(res, null, 404)
}

async function changePassword(req, res) {
  try {
    const {
      user: { id },
    } = req
    const { old_password, new_password } = req.body
    if (!old_password || !new_password) {
      return errorRes(res, 'Bad Request.', 400)
    }

    const user = await UserService.changePassword({
      id,
      newPassword: new_password,
      oldPassword: old_password,
    })

    if (user) {
      return successRes(res, user, 200)
    }
  } catch (error) {
    console.log('error', error)
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
  return errorRes(res, null, 404)
}

async function updateCurrentUser(req, res) {
  try {
    const {
      user: { id },
    } = req
    const values = removeForbiddenUserFields(req.body)

    const user = await UserService.updateUser({ id, values })
    if (user) {
      return successRes(res, user, 200)
    }
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
  return errorRes(res, null, 404)
}

async function getUserById(req, res) {
  const { id } = req.params
  try {
    const user = await UserService.getUserById(id)
    if (user) {
      return successRes(res, user, 200)
    }
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
  return errorRes(res, null, 404)
}

async function getCurrentUser(req, res) {
  try {
    const {
      user: { id },
    } = req

    const user = await UserService.getUserById(id)
    return successRes(res, { user }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

export default router
