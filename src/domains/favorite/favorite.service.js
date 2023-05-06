import Favorite from './favorite.model.js'

export default class FavoriteService {
  static async getFavorites({ userId }) {
    const favorites = await Favorite.getByUserId({ userId })
    if (!favorites) {
      return []
    }

    return favorites
  }

  static async addToFavorites({ userId, plantId }) {
    const favorites = await Favorite.add({ userId, plantId })

    return favorites
  }

  static async removeFromFavorites({ userId, plantId }) {
    const favorites = await Favorite.remove({ userId, plantId })

    return favorites
  }
}
