import express from 'express'

import { notFound } from '../../common/responses.js'
import { successRes, errorRes } from '../../common/responses.js'
import { isAdmin, isAuthorized } from '../../common/middlewares.js'
import { ITEMS_PER_PAGE } from '../../common/constants.js'
import BaseError from '../../error/base.error.js'
import ComplaintService from './complaint.service.js'
import GamificationService from '../gamification/gamification.service.js'
import { GamifiedUserAction } from '../gamification/constants.js'

const router = express.Router()

export default router
  .post('/', isAuthorized, createComplaint)
  .get('/list', isAuthorized, getComplaints)
  .get('/my-complaints', isAuthorized, getMyComplaints)
  .get('/:id', isAuthorized, getComplaintById)
  .delete('/:id', isAuthorized, removeComplaint)
  .post('/:id', isAdmin, evaluateComplaint)
  .use(notFound)

async function createComplaint(req, res) {
  try {
    const {
      user: { id },
    } = req
    const item = req.body
    const complaint = await ComplaintService.create({ item, userId: id })
    return successRes(res, { complaint }, 201)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

async function removeComplaint(req, res) {
  try {
    const { id } = req.params
    const {
      user: { id: userId },
    } = req
    await ComplaintService.remove({ id, userId })

    return successRes(res, { message: 'Complaint deleted successfully.' }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

async function getComplaintById(req, res) {
  const { id } = req.params
  try {
    const complaint = await ComplaintService.getComplaintById(id)
    if (complaint) {
      return successRes(res, complaint, 200)
    }
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
  return errorRes(res, null, 404)
}

async function getComplaints(req, res) {
  try {
    const {
      user: { id: userId },
    } = req
    const { page, perPage, opened, closed } = req.query
    const complaints = await ComplaintService.getComplaints({
      userId,
      page: page || 1,
      perPage: perPage || ITEMS_PER_PAGE,
      opened,
      closed,
    })
    return successRes(res, complaints || [], 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

async function getMyComplaints(req, res) {
  try {
    const {
      user: { id: userId },
    } = req
    const { page, perPage, opened, closed } = req.query
    const complaints = await ComplaintService.getMyComplaints({
      userId,
      page: page || 1,
      perPage: perPage || ITEMS_PER_PAGE,
      opened,
      closed,
    })
    return successRes(res, complaints || [], 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

async function evaluateComplaint(req, res) {
  try {
    const { id } = req.params
    const {
      user: { id: userId },
    } = req
    const { evaluation, was_helpful: wasHelpful } = req.body
    const complaint = await ComplaintService.evaluateComplaint({
      id,
      userId,
      evaluation,
      wasHelpful: wasHelpful,
    })

    const updatedEvaluator = await GamificationService.gamifyUserAction({
      user: complaint.evaluated_by,
      action: GamifiedUserAction.EVALUATE_COMPLAINT,
    })

    complaint.evaluated_by = updatedEvaluator

    if (wasHelpful) {
      const updatedAuthor = await GamificationService.gamifyUserAction({
        user: complaint.created_by,
        action: GamifiedUserAction.EVALUATE_COMPLAINT,
      })

      complaint.created_by = updatedAuthor
    }

    return successRes(res, { complaint }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}
