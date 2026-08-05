import { axiosClient } from './axiosClient'

export const getMyFavorites = async () => {
  const response = await axiosClient.get('/favorites/my-products')
  return response.data
}

export const getMyFavoriteProductUuids = async () => {
  const response = await axiosClient.get('/favorites/my-product-uuids')
  return response.data
}

export const addFavorite = async (productUuid) => {
  const response = await axiosClient.post(`/favorites/${productUuid}`)
  return response.data
}

export const removeFavorite = async (productUuid) => {
  const response = await axiosClient.delete(`/favorites/${productUuid}`)
  return response.data
}

export const toggleFavorite = async (productUuid) => {
  const response = await axiosClient.post(`/favorites/toggle/${productUuid}`)
  return response.data
}