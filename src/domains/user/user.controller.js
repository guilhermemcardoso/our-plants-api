import express from 'express'
import { isAuthorized } from '../../common/middlewares.js'
import { successRes, errorRes, notFound } from '../../common/responses.js'
import {
  newPasswordValidationRules,
  validation,
} from '../../common/validation-rules.js'
import BaseError from '../../error/base.error.js'
import { GamifiedUserAction } from '../gamification/constants.js'
import GamificationService from '../gamification/gamification.service.js'
import UserService from './user.service.js'
import { removeForbiddenUserFields } from './utils/validations.js'
const router = express.Router()

router
  .get('/me', isAuthorized, getCurrentUser)
  .get('/:id', isAuthorized, getUserById)
  .delete('/me', isAuthorized, deleteAccount)
  .patch('/me', isAuthorized, updateCurrentUser)
  .patch(
    '/me/change-password',
    isAuthorized,
    newPasswordValidationRules(),
    validation,
    changePassword
  )
  .patch('/me/profile-image', isAuthorized, updateProfileImage)
  .delete('/me/profile-image', isAuthorized, removeProfileImage)
  .use(notFound)

async function updateProfileImage(req, res) {
  try {
    const {
      user: { id },
    } = req
    const { profile_image } = req.body

    const user = await UserService.updateProfileImage({
      id,
      profile_image,
    })

    if (!user.completed_profile) {
      const nowIsCompleted = await UserService.checkProfileCompleted(user)
      if (nowIsCompleted) {
        const updatedUser = await GamificationService.gamifyUserAction({
          user,
          action: GamifiedUserAction.COMPLETE_PROFILE,
        })
        return successRes(res, updatedUser, 200)
      }
    }

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
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
  return errorRes(res, null, 404)
}

async function deleteAccount(req, res) {
  try {
    const {
      user: { id, email },
      token,
    } = req

    await UserService.deleteAccount({ id, email, token })

    return successRes(res, { message: 'Account deleted successfully' }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
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

    if (!user.completed_profile) {
      const nowIsCompleted = await UserService.checkProfileCompleted(user)
      if (nowIsCompleted) {
        const updatedUser = await GamificationService.gamifyUserAction({
          user,
          action: GamifiedUserAction.COMPLETE_PROFILE,
        })
        return successRes(res, updatedUser, 200)
      }
    }

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
