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

export default class PlantService {
  static async create({ item, userId }) {
    const data = {
      ...item,
      created_by: userId,
    }

    const plant = await create(Plant, data)

    return plant
  }
}

const plant = await create(Plant, item)
if (plant) {
  return successRes(res, plant, 200)
}
