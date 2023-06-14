import mongoose from 'mongoose'
import BadRequestError from '../../error/bad-request.error.js'
import { UserModel } from '../user/user.model.js'
import { PlantModel } from '../plant/plant.model.js'

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

export const complaintSchema = new Schema({
  _id: ObjectId,
  description: { type: String, required: true },
  reason: { type: String, required: true },
  evaluation: { type: String },
  plant_id: { type: ObjectId, ref: PlantModel, required: true },
  created_by: { type: ObjectId, ref: UserModel, required: true },
  evaluated_by: { type: ObjectId, ref: UserModel },
  was_helpful: { type: Boolean },
  deleted: { type: Boolean, default: false },
  closed: { type: Boolean, default: false },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
})

const ComplaintModel = mongoose.model('Complaint', complaintSchema)

export default class Complaint {
  static async create(data) {
    try {
      let newData = await new ComplaintModel({
        _id: new ObjectId(),
        ...data,
      }).save()

      newData = await newData
        .populate({ path: 'plant_id' })
        .populate({ path: 'created_by', select: '-password' })
        .populate({ path: 'evaluated_by', select: '-password' })
      return newData.toObject()
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async getById({ id, deleted, closed }) {
    try {
      const filters = {}
      if (deleted !== undefined) {
        filters.deleted = deleted
      }
      if (closed !== undefined) {
        filters.closed = closed
      }
      const result = await ComplaintModel.findOne({
        _id: id,
        ...filters,
      })
        .populate({ path: 'plant_id' })
        .populate({ path: 'created_by', select: '-password' })
        .populate({ path: 'evaluated_by', select: '-password' })

      return result
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async updateById({ id, data }) {
    try {
      const updatedData = await ComplaintModel.findOneAndUpdate(
        { _id: id },
        data,
        {
          new: true,
        }
      )
        .populate({ path: 'plant_id' })
        .populate({ path: 'created_by', select: '-password' })
        .populate({ path: 'evaluated_by', select: '-password' })
      return updatedData
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async removeById({ id }) {
    try {
      const updatedData = await ComplaintModel.findOneAndUpdate(
        { _id: id },
        { deleted: true, updated_at: new Date() },
        {
          new: true,
        }
      )
      return updatedData
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async count(filters) {
    try {
      const count = await ComplaintModel.countDocuments(filters)
      return count
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async list({ userId, page, perPage, filters }) {
    try {
      const result = await ComplaintModel.find({
        created_by: { $ne: new ObjectId(userId) },
        ...filters,
      })
        .limit(perPage)
        .skip((page - 1) * perPage)
        .populate({ path: 'plant_id' })
        .populate({ path: 'created_by', select: '-password' })
        .populate({ path: 'evaluated_by', select: '-password' })
        .lean()

      const count = await ComplaintModel.countDocuments({
        created_by: { $ne: new ObjectId(userId) },
        ...filters,
      })

      const hasNext = (page - 1) * perPage + result.length > count
      return {
        items: result,
        total_items: count,
        page,
        hasNext,
        hasPrevious: page > 1,
      }
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async myList({ userId, page, perPage, filters }) {
    try {
      const result = await ComplaintModel.find({
        created_by: new ObjectId(userId),
        ...filters,
      })
        .limit(perPage)
        .skip((page - 1) * perPage)
        .populate({ path: 'plant_id' })
        .populate({ path: 'created_by', select: '-password' })
        .populate({ path: 'evaluated_by', select: '-password' })
        .lean()

      const count = await ComplaintModel.countDocuments({
        created_by: { $ne: new ObjectId(userId) },
        ...filters,
      })

      const hasNext = (page - 1) * perPage + result.length > count
      return {
        items: result,
        total_items: count,
        page,
        hasNext,
        hasPrevious: page > 1,
      }
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }
}
