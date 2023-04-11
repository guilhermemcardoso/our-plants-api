import express from 'express'

import { notFound } from '../../common/responses.js'
import { successRes, errorRes } from '../../common/responses.js'
import {
  passwordValidationRules,
  emailAndPasswordValidationRules,
  validation,
} from '../../common/validation-rules.js'
import BaseError from '../../error/base.error.js'
import MailService from '../mail/mail.service.js'
import UserService from '../user/user.service.js'
import AuthService from './auth.service.js'
import { JwtTokenType } from '../../services/jwt.js'
const router = express.Router()

router
  .post('/register', emailAndPasswordValidationRules(), validation, register)
  .get('/email-confirmation', emailConfirmation)
  .get('/resend-email-confirmation', resendEmailConfirmationLink)
  .post('/login', emailAndPasswordValidationRules(), validation, login)
  .get('/forgot-password', forgotPassword)
  .get('/validate-password-recovery-token', validatePasswordRecoveryToken)
  .post(
    '/password-recovery',
    passwordValidationRules(),
    validation,
    passwordRecovery
  )
  .post('/refresh-token', refreshToken)
  .use(notFound)

async function register(req, res) {
  try {
    const body = req.body
    const user = await AuthService.register({ userData: body })

    await MailService.sendUserConfirmation(user)

    return successRes(res, user, 201)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad request.', 400)
  }
}

async function emailConfirmation(req, res) {
  try {
    const { token } = req.query
    await AuthService.emailConfirmation({
      token,
      type: JwtTokenType.EMAIL_CONFIRMATION,
    })

    return successRes(res, null)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad request.', 400)
  }
}

async function resendEmailConfirmationLink(req, res) {
  try {
    const { email } = req.query
    const user = await AuthService.checkEmailConfirmationToken({
      email,
    })

    await MailService.sendUserConfirmation(user)

    return successRes(res, null)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad request.', 400)
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body
    const auth = await AuthService.login({ email, password })

    if (!auth.access_token || !auth.refresh_token) {
      await MailService.sendUserConfirmation(auth.user)
      return errorRes(res, 'Locked.', 423)
    }

    return successRes(res, auth, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }

    return errorRes(res, 'Bad request.', 400)
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.query
    const user = await UserService.getUserByEmail(email)
    await MailService.sendPasswordRecovery(user)

    return successRes(
      res,
      { message: 'Password recovery link sent successfully.' },
      200
    )
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad request.', 400)
  }
}

async function passwordRecovery(req, res) {
  try {
    const { token, password } = req.body
    await AuthService.passwordRecovery({ password, token })
    return successRes(res, { message: 'Password updated successfully.' }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad request.', 400)
  }
}

async function validatePasswordRecoveryToken(req, res) {
  try {
    const { token } = req.query
    await AuthService.validatePasswordRecoveryToken({ token })

    return successRes(res, { message: 'Valid' }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad request.', 400)
  }
}

async function refreshToken(req, res) {
  try {
    const bearerToken = req.get('Authorization')
    const { refresh_token } = req.body
    if (!bearerToken || !refresh_token) {
      return errorRes(res, 'Bad request.', 400)
    }

    const token = bearerToken.replace('Bearer ', '')

    const auth = await AuthService.refreshToken({
      oldToken: token,
      refreshToken: refresh_token,
    })
    return successRes(res, auth, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad request.', 400)
  }
}

export default router
