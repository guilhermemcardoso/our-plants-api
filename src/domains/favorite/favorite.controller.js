import express from 'express'
import { successRes, errorRes, notFound } from '../../common/responses.js'
import FavoriteService from './favorite.service.js'
import BaseError from '../../error/base.error.js'
import { isAuthorized } from '../../common/middlewares.js'

const router = express.Router()

router
  .get('/', isAuthorized, getFavorites)
  .post('/:plantId', isAuthorized, addToFavorites)
  .delete('/:plantId', isAuthorized, removeFromFavorites)
  .use(notFound)

async function getFavorites(req, res) {
  try {
    const {
      user: { id: userId },
    } = req

    const favorites = await FavoriteService.getFavorites({ userId })
    return successRes(res, { favorites }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

async function addToFavorites(req, res) {
  try {
    const {
      user: { id: userId },
    } = req
    const { plantId } = req.params
    const favorites = await FavoriteService.addToFavorites({
      userId,
      plantId,
    })
    return successRes(res, { favorites }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

async function removeFromFavorites(req, res) {
  try {
    const {
      user: { id: userId },
    } = req
    const { plantId } = req.params
    const favorites = await FavoriteService.removeFromFavorites({
      userId,
      plantId,
    })
    return successRes(res, { favorites }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

export default router
