import express from 'express'

import { create, read, update, remove } from '../../services/mongodb/crud.js'
import { notFound } from '../../common/responses.js'
import Plant from './plant.model.js'
import { successRes, errorRes } from '../../common/responses.js'

const router = express.Router()

router
  .get('/list/:lng/:lat/', listNearBy)
  .post('/', createPlant)
  .put('/:_id', updatePlant)
  .get('/:_id', getPlantById)
  .delete('/:_id', removePlant)
  .use(notFound)

async function createPlant(req, res) {
  try {
    const {
      user: { id },
    } = req
    const item = req.body
    const plant = await PlantService.create({ item, userId: id })
    return successRes(res, { plant }, 201)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

async function updatePlant(req, res) {
  const { _id } = req.params
  const item = req.body
  item.updated_at = new Date()
  try {
    const plant = await update(Plant, _id, item)
    if (plant) {
      return successRes(res, plant, 200)
    }
  } catch (error) {
    return errorRes(res, null, 400)
  }
  return errorRes(res, null, 404)
}

async function removePlant(req, res) {
  const { _id } = req.params
  try {
    const plant = await update(Plant, _id, { status: 'deleted' })
    if (plant) {
      return successRes(res, plant, 200)
    }
  } catch (error) {
    return errorRes(res, null, 400)
  }
  return errorRes(res, null, 404)
}

async function getPlantById(req, res) {
  const { _id } = req.params
  try {
    const plant = await readOne(Plant, { _id })
    if (plant) {
      return successRes(res, plant, 200)
    }
  } catch (error) {
    return errorRes(res, null, 400)
  }
  return errorRes(res, null, 404)
}
async function listNearBy(req, res) {
  const { distance } = req.query
  const { lng, lat } = req.params
  try {
    const plants = await read(Plant, {
      status: { $ne: 'deleted' },
      location: {
        $near: {
          $maxDistance: distance,
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        },
      },
    })
    if (plants) {
      return successRes(res, plants, 200)
    }
  } catch (error) {
    return errorRes(res, 'Bad request.', 400)
  }

  return successRes(res, [], 200)
}

export default router
