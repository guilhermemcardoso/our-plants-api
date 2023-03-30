import BaseError from './base.error.js'
import { httpStatusCodes } from './constants.js'

export default class ForbiddenError extends BaseError {
  constructor(
    name,
    statusCode = httpStatusCodes.FORBIDDEN,
    description = 'Forbidden.',
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description)
  }
}
