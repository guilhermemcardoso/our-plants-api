import { body, validationResult } from 'express-validator'
import { errorRes } from './responses.js'
import { passwordRegex } from './regex.js'

export const Fields = {
  EMAIL: body('email').isEmail().normalizeEmail(),
  PASSWORD: body('password')
    .isLength({ min: 8 })
    .trim()
    .escape()
    .custom((value) => value.match(passwordRegex)),
  NEW_PASSWORD: body('new_password')
    .isLength({ min: 8 })
    .trim()
    .escape()
    .custom((value) => value.match(passwordRegex)),
  OLD_PASSWORD: body('old_password')
    .isLength({ min: 8 })
    .trim()
    .escape()
    .custom((value) => value.match(passwordRegex)),
}

export const validation = async function (req, res, next) {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }

  return errorRes(res, 'Bad request', 400)
}

export const emailAndPasswordValidationRules = () => {
  return [Fields.EMAIL, Fields.PASSWORD]
}

export const passwordValidationRules = () => {
  return [Fields.PASSWORD]
}

export const newPasswordValidationRules = () => {
  return [Fields.NEW_PASSWORD, Fields.OLD_PASSWORD]
}
