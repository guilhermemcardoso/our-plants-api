import BadRequestError from '../../error/bad-request.error.js'
import NotFoundError from '../../error/not-found.error.js'
import ForbiddenError from '../../error/forbidden.error.js'
import Plant from './plant.model.js'
import User from '../user/user.model.js'
import { ADMIN_LEVEL } from '../../common/constants.js'

export default class PlantService {
  static async create({ item, userId }) {
    const data = {
      ...item,
      created_by: userId,
    }

    const plant = await Plant.create(data)

    return plant
  }

  static async update({ id, item, userId }) {
    const plant = await Plant.getById({ id, deleted: false })
    const user = await User.getById({ id: userId })

    if (!plant || !user) {
      throw new BadRequestError('Bad request.')
    }

    if (!plant.editable) {
      throw new ForbiddenError('Forbidden.')
    }

    const isAuthor = plant.created_by._id.toString() === userId
    const userIsAdmin = user.score.level >= ADMIN_LEVEL
    if (!isAuthor && !userIsAdmin) {
      throw new ForbiddenError('Forbidden.')
    }

    const data = {
      ...item,
      updated_at: new Date(),
    }

    const updatedPlant = await Plant.updateById({ id, data })

    return updatedPlant
  }

  static async remove(id) {
    await Plant.removeById({ id })
  }

  static async lock({ id, locked, userId }) {
    const plant = await Plant.getById({ id })
    const user = await User.getById({ id: userId })

    if (!plant || !user) {
      throw new BadRequestError('Bad request.')
    }

    const data = {
      editable: !locked,
      updated_at: new Date(),
    }

    const updatedPlant = await Plant.updateById({ id, data })

    return updatedPlant
  }

  static async userAlreadyVoted({ id, userId }) {
    const plant = await Plant.getById({ id })
    const user = await User.getById({ id: userId })

    if (!plant || !user) {
      throw new BadRequestError('Bad request.')
    }

    const alreadyVoted =
      plant.upvotes.includes(userId) || plant.downvotes.includes(userId)

    return { alreadyVoted, user }
  }

  static async upvote({ id, userId }) {
    const updatedPlant = await Plant.upvote({ id, userId })

    return updatedPlant
  }

  static async downvote({ id, userId }) {
    const updatedPlant = await Plant.downvote({ id, userId })

    return updatedPlant
  }

  static async getPlantById(id) {
    const plant = await Plant.getById({ id, deleted: false })
    if (!plant) {
      throw new NotFoundError('Not found.')
    }

    const formattedPlant = { ...plant.toObject() }
    delete formattedPlant.deleted
    delete formattedPlant.editable
    return formattedPlant
  }

  static async getPlantsNearBy({
    latitude,
    longitude,
    distance,
    filteredSpecies,
  }) {
    const plants = await Plant.getNearBy({
      latitude,
      longitude,
      distance,
      filters: { deleted: false },
      filteredSpecies,
    })

    return plants || []
  }

  static async checkPlantCompleted(plant) {
    if (!plant._id) return false
    if (!plant.description) return false
    if (!plant.location) return false
    if (!plant.location.type) return false
    if (!plant.location.coordinates) return false
    if (plant.location.coordinates.length !== 2) return false
    if (!plant.images) return false
    if (!plant.images.length > 0) return false
    if (!plant.created_by) return false
    if (!plant.specie_id) return false

    return true
  }

  static async getPlants({ page, perPage }) {
    const plants = await Plant.list({
      page,
      perPage,
      filters: { deleted: false },
    })

    return plants
  }
}
