import mongoose from 'mongoose'
import BadRequestError from '../../error/bad-request.error.js'

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

export const userSchema = new Schema({
  _id: ObjectId,
  name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile_image: { type: String, required: false },
  bio: { type: String, required: false },
  address: {
    street_name: { type: String, required: false },
    neighbourhood: { type: String, required: false },
    zip_code: { type: String, required: false },
    house_number: { type: String, required: false },
    city: { type: String, required: false },
    state_or_province: { type: String, required: false },
    country: { type: String, required: false },
  },
  score: {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
  },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  completed_profile: { type: Boolean, default: false },
  confirmed_email: { type: Boolean, required: true, default: false },
})

export const UserModel = mongoose.model('User', userSchema)

export default class User {
  static async create(data) {
    try {
      const newData = await new UserModel({
        _id: new ObjectId(),
        ...data,
      }).save()

      return newData.toObject()
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async removeById({ id }) {
    try {
      await UserModel.deleteOne({ _id: id })
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async getById({ id }) {
    try {
      const result = await UserModel.findOne({ _id: id }).lean()
      return result
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async getByEmail({ email, filters }) {
    try {
      const result = await UserModel.findOne({ email, ...filters }).lean()
      return result
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async updateById({ id, data }) {
    try {
      const updatedData = await UserModel.findOneAndUpdate({ _id: id }, data, {
        new: true,
      })
      return updatedData.toObject()
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async updateByEmail({ email, data }) {
    try {
      const updatedData = await UserModel.findOneAndUpdate({ email }, data, {
        new: true,
      })
      return updatedData.toObject()
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async count(filters) {
    try {
      const count = await UserModel.countDocuments(filters)
      return count
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async list({ page, perPage, filters }) {
    try {
      const result = await UserModel.find(filters)
        .limit(perPage)
        .skip((page - 1) * perPage)
        .lean()

      const count = await UserModel.countDocuments({
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
