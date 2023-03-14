import BaseError from './base.error.js'
import { httpStatusCodes } from './constants.js'

export default class InternalServerError extends BaseError {
  constructor(
    name,
    statusCode = httpStatusCodes.INTERNAL_SERVER,
    description = 'Internal server error.',
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description)
  }
}
