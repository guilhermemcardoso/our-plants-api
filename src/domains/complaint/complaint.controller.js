import express from 'express'

import { create, read, update, remove, readOne } from '../../services/mongodb/crud.js'
import { notFound } from '../../common/middleware.js'
import Complaint from './complaint.model.js'
import { successRes, errorRes } from '../../common/response.js'

const router = express.Router()

export default router
  .get('/list', list)
  .post('/', createComplaint)
  .put('/:_id', updateComplaint)
  .get('/:_id', getComplaintById)
  .delete('/:_id', removeComplaint)
  .use(notFound)

async function createComplaint(req, res) {
  const { user_id } = req.query
  const item = req.body
  item.created_by = user_id
  try {
    const complaint = await create(Complaint, item)
    if (complaint) {
      return successRes(res, complaint, 200)
    }
  } catch (error) {
    return errorRes(res, null, 400)
  }
  return errorRes(res, null, 404)
}

async function updateComplaint(req, res) {
  const { _id } = req.params
  const item = req.body
  item.updated_at = new Date()
  try {
    const complaint = await update(Complaint, _id, item)
    if (complaint) {
      return successRes(res, complaint, 200)
    }
  } catch (error) {
    return errorRes(res, null, 400)
  }
  return errorRes(res, null, 404)
}

async function removeComplaint(req, res) {
  const { _id } = req.params
  try {
    const complaint = await update(Complaint, _id, { status: 'deleted' })
    if (complaint) {
      return successRes(res, complaint, 200)
    }
  } catch (error) {
    return errorRes(res, null, 400)
  }
  return errorRes(res, null, 404)
}

async function getComplaintById(req, res) {
  const { _id } = req.params
  try {
    const complaint = await readOne(Complaint, { _id })
    if (complaint) {
      return successRes(res, complaint, 200)
    }
  } catch (error) {
    return errorRes(res, null, 400)
  }
  return errorRes(res, null, 404)
}

async function list(req, res) {
  const { page, items } = req.query
  try {
    const complaints = await read(Complaint, {
      limit: items,
      skip: (page - 1) * items,
    })
    if (complaints) {
      return successRes(res, complaints, 200)
    }
  } catch (error) {
    return errorRes(res, null, 400)
  }
  return successRes(res, [], 200)
}
