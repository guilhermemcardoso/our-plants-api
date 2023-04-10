import BaseError from './base.error.js'
import { httpStatusCodes } from './constants.js'

export default class LockedError extends BaseError {
  constructor(
    name,
    statusCode = httpStatusCodes.LOCKED,
    description = 'Locked.',
    isOperational = true
  ) {
    super(name, statusCode, isOperational, description)
  }
}
