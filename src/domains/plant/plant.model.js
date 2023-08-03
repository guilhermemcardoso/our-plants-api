import mongoose from 'mongoose'
import BadRequestError from '../../error/bad-request.error.js'
import { SpecieModel } from '../specie/specie.model.js'
import { UserModel } from '../user/user.model.js'

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

export const plantSchema = new Schema({
  _id: ObjectId,
  description: { type: String, required: false },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  images: { type: [String], required: false },
  created_by: { type: ObjectId, required: true, ref: UserModel },
  upvotes: [{ type: String }],
  downvotes: [{ type: String }],
  specie_id: { type: ObjectId, ref: SpecieModel, required: true },
  reported: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  editable: { type: Boolean, default: true },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
})

plantSchema.index({ location: '2dsphere' })

export const PlantModel = mongoose.model('Plant', plantSchema)

export default class Plant {
  static async create(data) {
    try {
      let newData = await new PlantModel({
        _id: new ObjectId(),
        ...data,
      }).save()

      newData = await newData.populate([
        { path: 'created_by', select: '-password' },
        { path: 'specie_id' },
      ])
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
      const result = await PlantModel.findOne({ _id: id, ...filters }).populate(
        [{ path: 'created_by', select: '-password' }, { path: 'specie_id' }]
      )
      return result
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async updateById({ id, data }) {
    try {
      const updatedData = await PlantModel.findOneAndUpdate({ _id: id }, data, {
        new: true,
      }).populate([
        { path: 'created_by', select: '-password' },
        { path: 'specie_id' },
      ])
      return updatedData
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async upvote({ id, userId }) {
    try {
      await PlantModel.findOneAndUpdate(
        { _id: id },
        { $pullAll: { upvotes: [userId], downvotes: [userId] } }
      )
      const updatedData = await PlantModel.findOneAndUpdate(
        { _id: id },
        { $push: { upvotes: userId } },
        {
          new: true,
        }
      ).populate([
        { path: 'created_by', select: '-password' },
        { path: 'specie_id' },
      ])
      return updatedData
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async downvote({ id, userId }) {
    try {
      await PlantModel.findOneAndUpdate(
        { _id: id },
        { $pullAll: { upvotes: [userId], downvotes: [userId] } }
      )
      const updatedData = await PlantModel.findOneAndUpdate(
        { _id: id },
        { $push: { downvotes: userId } },
        {
          new: true,
        }
      ).populate([
        { path: 'created_by', select: '-password' },
        { path: 'specie_id' },
      ])
      return updatedData
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async removeById({ id }) {
    try {
      const updatedData = await PlantModel.findOneAndUpdate(
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
      const count = await PlantModel.countDocuments(filters)
      return count
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async list({ page, perPage, filters }) {
    try {
      const result = await PlantModel.find(filters)
        .limit(perPage)
        .skip((page - 1) * perPage)
        .populate([
          { path: 'created_by', select: '-password' },
          { path: 'specie_id' },
        ])
        .lean()

      const count = await PlantModel.countDocuments(filters)

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

  static async getNearBy({
    latitude,
    longitude,
    distance,
    filters,
    filteredSpecies,
  }) {
    try {
      const filter =
        filteredSpecies && filteredSpecies.length > 0
          ? { ...filters, specie_id: { $in: filteredSpecies } }
          : filters

      const result = await PlantModel.find({
        location: {
          $near: {
            $maxDistance: distance,
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
          },
        },
        ...filter,
      })
        .populate([
          { path: 'created_by', select: '-password' },
          { path: 'specie_id' },
        ])
        .lean()

      return {
        items: result,
      }
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }
}
