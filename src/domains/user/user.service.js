import * as bcrypt from 'bcrypt'
import BadRequestError from '../../error/bad-request.error.js'
import NotFoundError from '../../error/not-found.error.js'
import {
  create,
  read,
  update,
  readOne,
  remove,
} from '../../services/mongodb/crud.js'
import { encryptPassword, checkPassword } from '../auth/utils/crypt.js'
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

  static async getUserById(id, showPassword = false) {
    const user = await readOne(User, { _id: id })
    if (!user) {
      throw new NotFoundError('Not found.')
    }

    if (showPassword) {
      return user
    }

    const userWithoutPassword = { ...user.toObject() }
    delete userWithoutPassword.password
    return userWithoutPassword
  }

  static async getUserByEmail(email) {
    const user = await readOne(User, { email })
    const userWithoutPassword = { ...user.toObject() }
    delete userWithoutPassword.password
    return userWithoutPassword
  }

  static async updateUser({ id, values }) {
    const item = { ...values }
    item.updated_at = new Date()
    const user = await update(User, { _id: id }, item)
    if (!user) {
      throw new NotFoundError('Not found.')
    }
    const userWithoutPassword = { ...user.toObject() }
    delete userWithoutPassword.password
    return userWithoutPassword
  }

  static async changePassword({ id, newPassword, oldPassword }) {
    const currentUser = await UserService.getUserById(id, true)
    if (!currentUser) {
      throw new BadRequestError('Bad request.')
    }

    const passwordIsValid = await checkPassword({
      password: oldPassword,
      encryptedPassword: currentUser.password,
    })

    if (!passwordIsValid) {
      throw new BadRequestError('Bad request.')
    }

    const password = await encryptPassword(newPassword)
    const item = { password }
    item.updated_at = new Date()
    const user = await update(User, { _id: id }, item)
    if (!user) {
      throw new NotFoundError('Not found.')
    }
    const userWithoutPassword = { ...user.toObject() }
    delete userWithoutPassword.password
    return userWithoutPassword
  }

  static async updateProfileImage({ id, imageBuffer }) {
    const item = { profile_image: imageBuffer }
    item.updated_at = new Date()
    const user = await update(User, { _id: id }, item)
    if (!user) {
      throw new NotFoundError('Not found.')
    }
    const userWithoutPassword = { ...user.toObject() }
    delete userWithoutPassword.password
    return userWithoutPassword
  }

  static async removeProfileImage(id) {
    let user = await update(
      User,
      { _id: id },
      { $unset: { profile_image: '' } }
    )

    if (!user) {
      throw new NotFoundError('Not found.')
    }

    user = await update(User, { _id: id }, { updated_at: new Date() })

    if (!user) {
      throw new NotFoundError('Not found.')
    }

    const userWithoutPassword = { ...user.toObject() }
    delete userWithoutPassword.password
    return userWithoutPassword
  }
}
