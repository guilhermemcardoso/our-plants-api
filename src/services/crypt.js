import * as bcrypt from 'bcrypt'

export async function encryptPassword(password) {
  return await bcrypt.hash(password, 10)
}

export async function checkPassword({ password, encryptedPassword }) {
  return await bcrypt.compare(password, encryptedPassword)
}
