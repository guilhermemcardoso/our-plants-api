import mongoose from 'mongoose'
import BadRequestError from '../../error/bad-request.error.js'

export function create(model, item) {
  try {
    const newData = new model({
      _id: new mongoose.Types.ObjectId(),
      ...item,
    }).save()

    return newData
  } catch (err) {
    throw new BadRequestError('Bad request.')
  }
}

export function read(model, query = {}) {
  try {
    const result = model.find(query)
    return result
  } catch (err) {
    throw new BadRequestError('Bad request.')
  }
}

export function readOne(model, query = {}) {
  try {
    const result = model.findOne(query)
    return result
  } catch (err) {
    throw new BadRequestError('Bad request.')
  }
}

export function update(model, query, item) {
  try {
    const updatedData = model.findOneAndUpdate(query, item, { new: true })
    return updatedData
  } catch (err) {
    throw new BadRequestError('Bad request.')
  }
}

export function remove(model, query) {
  try {
    const removedData = model.deleteOne(query)
    return removedData
  } catch (err) {
    throw new BadRequestError('Bad request.')
  }
}
