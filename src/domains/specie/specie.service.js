import BadRequestError from '../../error/bad-request.error.js'
import NotFoundError from '../../error/not-found.error.js'
import UnauthorizedError from '../../error/unauthorized.error.js'
import { create, read, update, readOne } from '../../services/mongodb/crud.js'
import Specie from './specie.model.js'
import User from '../user/user.model.js'
import { ADMIN_LEVEL } from '../../common/constants.js'

export default class SpecieService {
  static async create({ item, userId }) {
    const data = {
      ...item,
      created_by: userId,
    }

    const specie = await create(Specie, data)

    return specie
  }

  static async update({ id, item, userId }) {
    const specie = await readOne(Specie, { _id: id })
    const user = await readOne(User, { _id: userId })

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

    const updatedSpecie = await update(Specie, { _id: id }, data)

    return updatedSpecie
  }

  static async remove(id) {
    const data = {
      deleted: true,
      updated_at: new Date(),
    }

    const updatedSpecie = await update(Specie, { _id: id }, data)
  }

  static async lock({ id, locked, userId }) {
    const specie = await readOne(Specie, { _id: id })
    const user = await readOne(User, { _id: userId })

    if (!specie || !user) {
      throw new BadRequestError('Bad request.')
    }

    const data = {
      editable: !locked,
      updated_at: new Date(),
    }

    const updatedSpecie = await update(Specie, { _id: id }, data)

    return updatedSpecie
  }

  static async getSpecieById(id) {
    const specie = await readOne(Specie, { _id: id, deleted: false })
    if (!specie) {
      throw new NotFoundError('Not found.')
    }

    const formattedSpecie = { ...specie.toObject() }
    delete formattedSpecie.deleted
    delete formattedSpecie.editable
    return formattedSpecie
  }

  static async getSpecies({ page, items }) {
    const species = await read(
      Specie,
      { deleted: false },
      items,
      (page - 1) * items
    )

    return species
  }
}
