import express from 'express'

import { notFound } from '../../common/responses.js'
import { successRes, errorRes } from '../../common/responses.js'
import { isAdmin, isAuthorized } from '../../common/middlewares.js'
import { removeForbiddenPlantFields } from './utils/validations.js'
import PlantService from './plant.service.js'
import BaseError from '../../error/base.error.js'

const router = express.Router()

router
  .post('/', isAuthorized, createPlant)
  .get('/list', isAuthorized, getPlantsNearBy)
  .get('/:id', isAuthorized, getPlantById)
  .patch('/:id', isAuthorized, updatePlant)
  .delete('/:id', isAdmin, removePlant)
  .get('/:_id', getPlantById)
  .delete('/:_id', removePlant)
  .post('/:id', isAdmin, lockPlant)
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
  try {
    const {
      user: { id: userId },
    } = req
    const { id } = req.params
    const item = removeForbiddenPlantFields(req.body)

    const plant = await PlantService.update({ id, item, userId })
    return successRes(res, { plant }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

async function lockPlant(req, res) {
  try {
    const {
      user: { id: userId },
    } = req
    const { id } = req.params
    const { locked } = req.body

    const plant = await PlantService.lock({ id, locked, userId })
    return successRes(res, { plant }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

async function removePlant(req, res) {
  const { id } = req.params
  try {
    await PlantService.remove(id)

    return successRes(res, { message: 'Plant deleted successfully.' }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

async function getPlantById(req, res) {
  const { id } = req.params
  try {
    const plant = await PlantService.getPlantById(id)
    if (plant) {
      return successRes(res, plant, 200)
    }
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
  return errorRes(res, null, 404)
}

async function getPlantsNearBy(req, res) {
  try {
    const { latitude, longitude, distance } = req.body
    const plants = await PlantService.getPlantsNearBy({
      latitude,
      longitude,
      distance,
    })

    return successRes(res, plants, 200)
  } catch (error) {
    return errorRes(res, 'Bad request.', 400)
  }
}

export default router
