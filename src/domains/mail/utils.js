import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import InternalServerError from '../../error/internal-server.error.js'

export const __filename = fileURLToPath(import.meta.url)
export const __dirname = dirname(__filename)

export function readTemplate(filename) {
  try {
    const template = fs.readFileSync(
      path.join(__dirname, `/templates/${filename}.hbs`),
      'utf8'
    )
    return template
  } catch (err) {
    throw new InternalServerError('Could not read file.')
  }
}
