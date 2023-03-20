import express from 'express'

import { notFound } from '../../common/responses.js'
import { successRes, errorRes } from '../../common/responses.js'
import {
  emailAndPasswordValidationRules,
  passwordValidationRules,
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
  .post('/login', emailAndPasswordValidationRules(), validation, login)
  .get('/forgot-password', forgotPassword)
  .post(
    '/recovery-password',
    emailAndPasswordValidationRules(),
    validation,
    recoveryPassword
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

async function login(req, res) {
  try {
    const { email, password } = req.body
    const auth = await AuthService.login({ email, password })

    return successRes(res, auth, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Unauthorized.', 401)
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.query
    const user = await UserService.getUserByEmail(email)
    await MailService.sendRecoveryPassword(user)

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

async function recoveryPassword(req, res) {
  try {
    const { token, password, email } = req.body
    await AuthService.recoveryPassword({ email, password, token })
    return successRes(res, { message: 'Password updated successfully.' }, 200)
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
