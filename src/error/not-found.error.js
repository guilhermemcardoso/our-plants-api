import BaseError from './base.error.js'
import { httpStatusCodes } from './constants.js'

export default class NotFoundError extends BaseError {
  constructor(
    name,
    statusCode = httpStatusCodes.NOT_FOUND,
    description = 'Not found.',
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description)
  }
}
