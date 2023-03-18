import BadRequestError from '../../error/bad-request.error.js'
import NotFoundError from '../../error/not-found.error.js'
import UnauthorizedError from '../../error/unauthorized.error.js'
import { create, read, update, readOne } from '../../services/mongodb/crud.js'
import Complaint from './complaint.model.js'
import Plant from '../plant/plant.model.js'
import User from '../user/user.model.js'

import mongoose from 'mongoose'

const ObjectId = mongoose.Types.ObjectId

export default class ComplaintService {
  static async create({ item, userId }) {
    const plant = await readOne(Plant, { _id: item.plant_id })

    if (!plant) {
      throw new BadRequestError('Bad request.')
    }

    const data = {
      ...item,
      created_by: userId,
    }

    const complaint = await create(Complaint, data)
    await update(Plant, { _id: plant._id }, { reported: true })

    return complaint
  }

  static async remove({ id, userId }) {
    const complaint = await readOne(Complaint, { _id: id })
    const user = await readOne(User, { _id: userId })

    if (!complaint || !user) {
      throw new BadRequestError('Bad request.')
    }

    if (userId === complaint.created_by.toString()) {
      throw new UnauthorizedError('Unauthorized.')
    }

    const plant = await readOne(Plant, { _id: complaint.plant_id })

    if (!plant) {
      throw new BadRequestError('Bad request.')
    }

    const data = {
      deleted: true,
      updated_at: new Date(),
    }

    await update(Complaint, { _id: id }, data)

    const plantComplaints = await read({
      model: Complaint,
      query: { plant_id: plant._id, closed: false, deleted: false },
      limit: null,
      skip: null,
      populate: '',
    })

    if (plantComplaints.length === 0) {
      await update(Plant, { _id: plant._id }, { reported: false })
    }
  }

  static async getComplaintById(id) {
    const complaint = await readOne(Complaint, { _id: id, deleted: false })
    if (!complaint) {
      throw new NotFoundError('Not found.')
    }

    const formattedComplaint = { ...complaint.toObject() }
    return formattedComplaint
  }

  static async getComplaints({ userId, page, items, open, closed }) {
    let closedQuery = null
    if (!open && !closed) {
      return []
    }
    if (open && !closed) {
      closedQuery = { closed: false }
    }
    if (!open && closed) {
      closedQuery = { closed: true }
    }

    const complaints = await read({
      model: Complaint,
      query: {
        deleted: false,
        created_by: { $ne: new ObjectId(userId) },
        ...closedQuery,
      },
      limit: items,
      skip: (page - 1) * items,
      populate: 'created_by evaluator_id',
    })

    return complaints
  }

  static async getMyComplaints({ userId, page, items, closed, open }) {
    let closedQuery = null
    if (!open && !closed) {
      return []
    }
    if (open && !closed) {
      closedQuery = { closed: false }
    }
    if (!open && closed) {
      closedQuery = { closed: true }
    }
    const complaints = await read({
      model: Complaint,
      query: {
        deleted: false,
        created_by: new ObjectId(userId),
        ...closedQuery,
      },
      limit: items,
      skip: (page - 1) * items,
      populate: 'created_by',
    })

    return complaints
  }

  static async evaluateComplaint({ id, userId, evaluation }) {
    const complaint = await readOne(Complaint, { _id: id })
    const user = await readOne(User, { _id: userId })

    if (!complaint || !user || complaint.created_by === userId) {
      throw new BadRequestError('Bad request.')
    }

    const plant = await readOne(Plant, { _id: complaint.plant_id })

    if (!plant) {
      throw new BadRequestError('Bad request.')
    }

    const data = {
      evaluation,
      evaluator_id: userId,
      closed: true,
      updated_at: new Date(),
    }

    const updatedComplaint = await update(Complaint, { _id: id }, data)

    const plantComplaints = await read({
      model: Complaint,
      query: { plant_id: plant._id, closed: false, deleted: false },
      limit: null,
      skip: null,
      populate: '',
    })

    if (plantComplaints.length === 0) {
      await update(Plant, { _id: plant._id }, { reported: false })
    }

    return updatedComplaint
  }
}
