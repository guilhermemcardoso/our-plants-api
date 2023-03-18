import BadRequestError from '../../error/bad-request.error.js'
import NotFoundError from '../../error/not-found.error.js'
import {
  create,
  read,
  update,
  readOne,
  remove,
} from '../../services/mongodb/crud.js'
import Plant from './plant.model.js'
import User from '../user/user.model.js'
import { ADMIN_LEVEL } from '../../common/constants.js'

export default class PlantService {
  static async create({ item, userId }) {
    const data = {
      ...item,
      created_by: userId,
    }

    const plant = await create(Plant, data)

    return plant
  }

  static async update({ id, item, userId }) {
    const plant = await readOne(Plant, { _id: id })
    const user = await readOne(User, { _id: userId })

    if (!plant || !user) {
      throw new BadRequestError('Bad request.')
    }

    if (!plant.editable) {
      throw new UnauthorizedError('Unauthorized.')
    }

    const isAuthor = plant.created_by === userId
    const userIsAdmin = user.score.level === ADMIN_LEVEL

    if (!isAuthor && !userIsAdmin) {
      throw new UnauthorizedError('Unauthorized.')
    }

    const data = {
      ...item,
      updated_at: new Date(),
    }

    const updatedPlant = await update(Plant, { _id: id }, data)

    return updatedPlant
  }

  static async remove(id) {
    const data = {
      deleted: true,
      updated_at: new Date(),
    }

    await update(Plant, { _id: id }, data)
  }

  static async lock({ id, locked, userId }) {
    const plant = await readOne(Plant, { _id: id })
    const user = await readOne(User, { _id: userId })

    if (!plant || !user) {
      throw new BadRequestError('Bad request.')
    }

    const data = {
      editable: !locked,
      updated_at: new Date(),
    }

    const updatedPlant = await update(Plant, { _id: id }, data)

    return updatedPlant
  }

  static async getPlantById(id) {
    const plant = await readOne(Plant, { _id: id, deleted: false })
    if (!plant) {
      throw new NotFoundError('Not found.')
    }

    const formattedPlant = { ...plant.toObject() }
    delete formattedPlant.deleted
    delete formattedPlant.editable
    return formattedPlant
  }

  static async getPlantsNearBy({ latitude, longitude, distance }) {
    const plants = await read({
      model: Plant,
      query: {
        deleted: false,
        location: {
          $near: {
            $maxDistance: distance,
            $geometry: {
              type: 'Point',
              coordinates: [latitude, longitude],
            },
          },
        },
      },
      limit: null,
      skip: null,
      populate: 'created_by specie_id',
    })

    return plants || []
  }
}
