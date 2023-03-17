import express from 'express'
import { successRes, errorRes, notFound } from '../../common/responses.js'
import SpecieService from './specie.service.js'
import BaseError from '../../error/base.error.js'
import { isAuthorized, isAdmin } from '../../common/middlewares.js'
import { removeForbiddenSpecieFields } from './utils/validations.js'
import { ITEMS_PER_PAGE } from '../../common/constants.js'

const router = express.Router()

router
  .post('/', isAuthorized, createSpecie)
  .get('/list', isAuthorized, getSpecies)
  .get('/:id', isAuthorized, getSpecieById)
  .delete('/:id', isAdmin, removeSpecie)
  .patch('/:id', isAuthorized, updateSpecie)
  .post('/:id', isAdmin, lockSpecie)
  .use(notFound)

async function createSpecie(req, res) {
  try {
    const {
      user: { id },
    } = req
    const item = req.body
    const specie = await SpecieService.create({ item, userId: id })
    return successRes(res, { specie }, 201)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

async function updateSpecie(req, res) {
  try {
    const {
      user: { id: userId },
    } = req
    const { id } = req.params
    const item = removeForbiddenSpecieFields(req.body)

    const specie = await SpecieService.update({ id, item, userId })
    return successRes(res, { specie }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

async function lockSpecie(req, res) {
  try {
    const {
      user: { id: userId },
    } = req
    const { id } = req.params
    const { locked } = req.body

    const specie = await SpecieService.lock({ id, locked, userId })
    return successRes(res, { specie }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

async function removeSpecie(req, res) {
  const { id } = req.params
  try {
    await SpecieService.remove(id)

    return successRes(res, { message: 'Specie deleted successfully.' }, 200)
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
}

async function getSpecieById(req, res) {
  const { id } = req.params
  try {
    const specie = await SpecieService.getSpecieById(id)
    if (specie) {
      return successRes(res, specie, 200)
    }
  } catch (error) {
    if (error instanceof BaseError) {
      return errorRes(res, error.name, error.statusCode)
    }
    return errorRes(res, 'Bad Request.', 400)
  }
  return errorRes(res, null, 404)
}

async function getSpecies(req, res) {
  try {
    const { page, items } = req.query
    const species = await SpecieService.getSpecies({
      page: page || 1,
      items: items || ITEMS_PER_PAGE,
    })
    return successRes(res, species || [], 200)
  } catch (error) {
    return errorRes(res, null, 400)
  }
}

export default router
