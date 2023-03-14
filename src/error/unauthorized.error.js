import BaseError from './base.error.js'
import { httpStatusCodes } from './constants.js'

export default class UnauthorizedError extends BaseError {
  constructor(
    name,
    statusCode = httpStatusCodes.UNAUTHORIZED,
    description = 'Unauthorized.',
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description)
  }
}
