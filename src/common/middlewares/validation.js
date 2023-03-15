import { body, validationResult } from 'express-validator'
import { passwordRegex } from '../regex.js'
import { errorRes } from '../response.js'

export const registerValidation = async function (req, res, next) {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }

  return errorRes(res, 'Bad request', 400)
}

export const registerValidationRules = () => {
  return [
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .trim()
      .escape()
      .custom((value) => value.match(passwordRegex)),
  ]
}
