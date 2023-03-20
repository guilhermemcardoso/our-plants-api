import BadRequestError from '../../error/bad-request.error.js'
import NotFoundError from '../../error/not-found.error.js'
import UnauthorizedError from '../../error/unauthorized.error.js'
import Specie from './specie.model.js'
import User from '../user/user.model.js'
import { ADMIN_LEVEL } from '../../common/constants.js'

export default class SpecieService {
  static async create({ item, userId }) {
    const data = {
      ...item,
      created_by: userId,
    }

    const specie = await Specie.create(data)

    return specie
  }

  static async update({ id, item, userId }) {
    const specie = await Specie.getById({ id, deleted: false })
    const user = await User.getById({ id: userId })

    if (!specie || !user) {
      throw new BadRequestError('Bad request.')
    }

    if (!specie.editable) {
      throw new UnauthorizedError('Unauthorized.')
    }

    const isAuthor = specie.created_by === userId
    const userIsAdmin = user.score.level === ADMIN_LEVEL

    if (!isAuthor && !userIsAdmin) {
      throw new UnauthorizedError('Unauthorized.')
    }

    const data = {
      ...item,
      updated_at: new Date(),
    }

    const updatedSpecie = await Specie.updateById({ id, data })

    return updatedSpecie
  }

  static async remove(id) {
    await Specie.removeById({ id })
  }

  static async lock({ id, locked, userId }) {
    const specie = await Specie.getById({ id })
    const user = await User.getById({ id: userId })

    if (!specie || !user) {
      throw new BadRequestError('Bad request.')
    }

    const data = {
      editable: !locked,
      updated_at: new Date(),
    }

    const updatedSpecie = await Specie.updateById({ id, data })

    return updatedSpecie
  }

  static async getSpecieById(id) {
    const specie = await Specie.getById({ id, deleted: false })
    if (!specie) {
      throw new NotFoundError('Not found.')
    }

    const formattedSpecie = { ...specie }
    delete formattedSpecie.deleted
    delete formattedSpecie.editable
    return formattedSpecie
  }

  static async getSpecies({ page, perPage }) {
    const species = await Specie.list({
      page,
      perPage,
      filters: { deleted: false },
    })

    return species
  }
}
