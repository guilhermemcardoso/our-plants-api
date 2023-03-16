import express from 'express'
import { create, read, update, readOne } from '../../services/mongodb/crud.js'
import { successRes, errorRes, notFound } from '../../common/responses.js'
import Specie from './specie.model.js'

const router = express.Router()

router
  .get('/list', list)
  .post('/', createSpecie)
  .put('/:_id', updateSpecie)
  .get('/:_id', getSpecieById)
  .delete('/:_id', removeSpecie)
  .use(notFound)

async function createSpecie(req, res) {
  const { user_id } = req.query
  const item = req.body
  item.created_by = user_id
  const specie = await create(Specie, item)
  if (specie) {
    return successRes(res, specie, 200)
  }

  return errorRes(res, null, 404)
}

async function updateSpecie(req, res) {
  const { _id } = req.params
  const item = req.body
  item.updated_at = new Date()
  const specie = await update(Specie, _id, item)
  if (specie) {
    return successRes(res, specie, 200)
  }

  return errorRes(res, null, 404)
}

async function removeSpecie(req, res) {
  const { _id } = req.params
  const specie = await update(Specie, _id, { deleted: true })
  if (specie) {
    return successRes(res, specie, 200)
  }

  return errorRes(res, null, 404)
}

async function getSpecieById(req, res) {
  const { _id } = req.params
  try {
    const specie = await readOne(Specie, { _id, deleted: false })
    if (specie) {
      return successRes(res, specie, 200)
    }
  } catch (error) {
    return errorRes(res, null, 400)
  }
  return errorRes(res, null, 404)
}

async function list(req, res) {
  const { page, items } = req.query
  try {
    const species = await read(Specie, {
      limit: items,
      skip: (page - 1) * items,
    })
    if (specie) {
      return successRes(res, species, 200)
    }
  } catch (error) {
    return errorRes(res, null, 400)
  }
  return successRes(res, [], 200)
}

export default router
