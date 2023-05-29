import express from 'express'

import { notFound } from '../../common/responses.js'
import { successRes, errorRes } from '../../common/responses.js'
import { isAdmin, isAuthorized } from '../../common/middlewares.js'
import { removeForbiddenPlantFields } from './utils/validations.js'
import GamificationService from '../gamification/gamification.service.js'
import PlantService from './plant.service.js'
import BaseError from '../../error/base.error.js'
import { GamifiedUserAction } from '../gamification/constants.js'

const router = express.Router()

router
  .post('/', isAuthorized, createPlant)
  .get('/list', isAuthorized, getPlants)
  .post('/near-by', isAuthorized, getPlantsNearBy)
  .get('/:id', isAuthorized, getPlantById)
  .patch('/:id', isAuthorized, updatePlant)
  .delete('/:id', isAdmin, removePlant)
  .post('/lock/:id', isAdmin, lockPlant)
  .post('/upvote/:id', isAuthorized, upvotePlant)
  .post('/downvote/:id', isAuthorized, downvotePlant)
  .use(notFound)

async function createPlant(req, res) {
  try {
    const {
      user: { id },
    } = req
    const item = req.body
    const plant = await PlantService.create({ item, userId: id })
    const plantIsCompleted = await PlantService.checkPlantCompleted(plant)

    const updatedUser = await GamificationService.gamifyUserAction({
      user: plant.created_by,
      action: plantIsCompleted
        ? GamifiedUserAction.CREATE_PLANT_WITH_OPTIONAL_FIELDS
        : GamifiedUserAction.CREATE_PLANT,
    })
    plant.created_by = updatedUser
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

async function upvotePlant(req, res) {
  try {
    const {
      user: { id: userId },
    } = req
    const { id } = req.params

    const { alreadyVoted, user } = await PlantService.userAlreadyVoted({
      id,
      userId,
    })

    const plant = await PlantService.upvote({ id, userId })

    if (!alreadyVoted) {
      const updatedUser = await GamificationService.gamifyUserAction({
        user,
        action: GamifiedUserAction.UPVOTE_PLANT,
      })
      plant.created_by = updatedUser
    }
    return successRes(res, { plant }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

async function downvotePlant(req, res) {
  try {
    const {
      user: { id: userId },
    } = req
    const { id } = req.params

    const alreadyVoted = PlantService.userAlreadyVoted({ id, userId })
    const plant = await PlantService.downvote({ id, userId })
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

async function getPlants(req, res) {
  try {
    const { page, perPage } = req.query
    const plants = await PlantService.getPlants({
      page: page || 1,
      perPage: perPage || ITEMS_PER_PAGE,
    })
    return successRes(res, plants || [], 200)
  } catch (error) {
    return errorRes(res, null, 400)
  }
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
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

export default router
