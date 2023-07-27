import mongoose from 'mongoose'
import BadRequestError from '../../error/bad-request.error.js'

const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

export const favoriteSchema = new Schema({
  _id: { type: ObjectId, default: new ObjectId() },
  user_id: { type: ObjectId, ref: 'User' },
  plants: [{ type: ObjectId, ref: 'Plant', default: [] }],
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
})

export const FavoriteModel = mongoose.model('Favorite', favoriteSchema)

export default class Favorite {
  static async add({ userId, plantId }) {
    try {
      const options = { upsert: true, new: true, setDefaultsOnInsert: true }
      const query = { user_id: userId }
      const update = {
        $set: {
          user_id: userId,
          updated_at: new Date(),
        },
        $addToSet: { plants: plantId },
      }
      let favorites = await FavoriteModel.findOneAndUpdate(
        query,
        update,
        options
      )

      favorites = await favorites.populate({
        path: 'plants',
        populate: [
          { path: 'created_by', select: '-password' },
          { path: 'specie_id' },
        ],
      })
      return favorites.toObject()
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async remove({ userId, plantId }) {
    try {
      const options = { upsert: true, new: true, setDefaultsOnInsert: true }
      const query = { user_id: userId }
      const update = {
        $set: {
          user_id: userId,
          updated_at: new Date(),
        },
        $pullAll: { plants: [plantId] },
      }
      let favorites = await FavoriteModel.findOneAndUpdate(
        query,
        update,
        options
      )

      favorites = await favorites.populate({
        path: 'plants',
        populate: [
          { path: 'created_by', select: '-password' },
          { path: 'specie_id' },
        ],
      })
      return favorites.toObject()
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }

  static async getByUserId({ userId }) {
    try {
      const result = await FavoriteModel.findOne({
        user_id: userId,
      })
        .populate({
          path: 'plants',
          populate: [
            { path: 'created_by', select: '-password' },
            { path: 'specie_id' },
          ],
        })
        .lean()
      return result
    } catch (err) {
      throw new BadRequestError('Bad request.')
    }
  }
}
