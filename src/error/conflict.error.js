import BaseError from './base.error.js'
import { httpStatusCodes } from './constants.js'

export default class ConflictError extends BaseError {
  constructor(
    name,
    statusCode = httpStatusCodes.CONFLICT,
    description = 'Conflict.',
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description)
  }
}
