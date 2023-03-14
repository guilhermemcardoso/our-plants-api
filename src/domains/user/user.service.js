import * as bcrypt from 'bcrypt'
import InternalServerError from '../../error/internal-server.error.js'
import {
  create,
  read,
  update,
  readOne,
  remove,
} from '../../services/mongodb/crud.js'
import User from './user.model.js'

export default class UserService {
  static async create({ userData }) {
    const data = {
      ...userData,
      password: await bcrypt.hash(userData.password, 10),
    }

    const user = await create(User, data)

    return {
      ...user,
      password: undefined,
    }
  }

  static async getUserById(id) {
    try {
      const user = await readOne(User, { _id: id })
      const userWithoutPassword = { ...user.toObject() }
      delete userWithoutPassword.password
      return userWithoutPassword
    } catch (err) {
      throw new InternalServerError('Internal server error.')
    }
  }

  static async getUserByEmail(email) {
    try {
      const user = await readOne(User, { email })
      const userWithoutPassword = { ...user.toObject() }
      delete userWithoutPassword.password
      return userWithoutPassword
    } catch (err) {
      throw new InternalServerError('Internal server error.')
    }
  }
}
