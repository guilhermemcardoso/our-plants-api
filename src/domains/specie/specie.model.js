import mongoose from 'mongoose'
import BadRequestError from '../../error/bad-request.error.js'

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

export const specieSchema = new Schema({
  _id: ObjectId,
  popular_name: { type: String, required: true },
  scientific_name: { type: String, required: false },
  created_by: { type: ObjectId, ref: 'User' },
  icon_url: { type: String, required: false },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
  editable: { type: Boolean, default: true },
})

export const SpecieModel = mongoose.model('Specie', specieSchema)

export default class Specie {
  static async create(data) {
    try {
      const newData = await new SpecieModel({
        _id: new ObjectId(),
        ...data,
      }).save()

      return newData.toObject()
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async getById({ id, deleted }) {
    try {
      const filters = {}
      if (deleted !== undefined) {
        filters.deleted = deleted
      }
      const result = await SpecieModel.findOne({
        _id: id,
        ...filters,
      }).populate('created_by').lean()
      return result
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async updateById({ id, data }) {
    try {
      const updatedData = await SpecieModel.findOneAndUpdate(
        { _id: id },
        data,
        {
          new: true,
        }
      ).populate('created_by')
      return updatedData
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async removeById({ id }) {
    try {
      const updatedData = await SpecieModel.findOneAndUpdate(
        { _id: id },
        { deleted: true, updated_at: new Date() },
        {
          new: true,
        }
      ).populate('created_by')
      return updatedData
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async count(filters) {
    try {
      const count = await SpecieModel.countDocuments(filters)
      return count
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async list({ page, perPage, filters }) {
    try {
      const result = await SpecieModel.find(filters)
        .limit(perPage)
        .skip((page - 1) * perPage)
        .populate('created_by')
        .lean()

      const count = await SpecieModel.countDocuments(filters)

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
