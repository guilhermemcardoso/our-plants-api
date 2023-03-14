import BaseError from './base.error.js'
import { httpStatusCodes } from './constants.js'

export default class BadRequestError extends BaseError {
  constructor(
    name,
    statusCode = httpStatusCodes.BAD_REQUEST,
    description = 'Bad request.',
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description)
  }
}
