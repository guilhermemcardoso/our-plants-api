import BadRequestError from '../../error/bad-request.error.js'
import NotFoundError from '../../error/not-found.error.js'
import ForbiddenError from '../../error/forbidden.error.js'
import Complaint from './complaint.model.js'
import Plant from '../plant/plant.model.js'
import User from '../user/user.model.js'

export default class ComplaintService {
  static async create({ item, userId }) {
    const plant = await Plant.getById({ id: item.plant_id, deleted: false })

    if (!plant) {
      throw new BadRequestError('Bad request.')
    }

    const data = {
      ...item,
      created_by: userId,
    }

    const complaint = await Complaint.create(data)
    await Plant.updateById({ id: plant._id, data: { reported: true } })

    return complaint
  }

  static async remove({ id, userId }) {
    const complaint = await Complaint.getById({
      id,
      deleted: false,
      closed: false,
    })
    const user = await User.getById({ id: userId })

    if (!complaint || !user) {
      throw new BadRequestError('Bad request.')
    }

    const { _id: authorId } = complaint.created_by
    if (userId !== authorId.toString()) {
      throw new ForbiddenError('Forbidden.')
    }

    const plant = await Plant.getById({
      id: complaint.plant_id,
      deleted: false,
    })

    if (!plant) {
      throw new BadRequestError('Bad request.')
    }

    const data = {
      deleted: true,
      updated_at: new Date(),
    }

    await Complaint.updateById({ id, data })

    const plantComplaints = await Complaint.count({
      plant_id: plant._id,
      closed: false,
      deleted: false,
    })

    if (plantComplaints === 0) {
      await Plant.updateById({ id: plant._id, reported: false })
    }
  }

  static async getComplaintById(id) {
    const complaint = await Complaint.getById({ id })
    if (!complaint) {
      throw new NotFoundError('Not found.')
    }

    return complaint
  }

  static async getComplaints({ userId, page, perPage, opened, closed }) {
    let closedQuery = null
    if (opened === 'false' && closed === 'false') {
      return {
        items: [],
        total_items: 0,
        page: page,
        hasNext: false,
        hasPrevious: false,
      }
    }
    if (opened === 'true' && closed === 'false') {
      closedQuery = { closed: false }
    }
    if (opened === 'false' && closed === 'true') {
      closedQuery = { closed: true }
    }

    const filters = {
      deleted: false,
      ...closedQuery,
    }

    const complaints = await Complaint.list({
      userId,
      page: Number(page),
      perPage: Number(perPage),
      filters,
    })

    return complaints
  }

  static async getMyComplaints({ userId, page, perPage, closed, opened }) {
    let closedQuery = null
    if (opened === 'false' && closed === 'false') {
      return {
        items: [],
        total_items: 0,
        page: page,
        hasNext: false,
        hasPrevious: false,
      }
    }
    if (opened === 'true' && closed === 'false') {
      closedQuery = { closed: false }
    }
    if (opened === 'false' && closed === 'true') {
      closedQuery = { closed: true }
    }

    const filters = {
      deleted: false,
      ...closedQuery,
    }

    const complaints = await Complaint.myList({
      userId,
      page: Number(page),
      perPage: Number(perPage),
      filters,
    })

    return complaints
  }

  static async evaluateComplaint({ id, userId, evaluation, wasHelpful }) {
    const complaint = await Complaint.getById({
      id,
      deleted: false,
      closed: false,
    })
    const user = await User.getById({ id: userId })

    const { _id: authorId } = complaint.created_by
    if (!complaint || !user || userId === authorId.toString()) {
      throw new BadRequestError('Bad request.')
    }

    const plant = await Plant.getById({
      id: complaint.plant_id,
      deleted: false,
    })

    if (!plant) {
      throw new BadRequestError('Bad request.')
    }

    const data = {
      evaluation,
      was_helpful: wasHelpful,
      evaluated_by: userId,
      closed: true,
      updated_at: new Date(),
    }

    const updatedComplaint = await Complaint.updateById({ id, data })

    const plantComplaints = await Complaint.count({
      plant_id: plant._id,
      closed: false,
      deleted: false,
    })

    if (plantComplaints === 0) {
      await Plant.updateById({ id: plant._id, reported: false })
    }

    return updatedComplaint
  }
}
