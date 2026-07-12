import { axiosClient } from './axiosClient'

export const getActiveCart = async () => {
  const response = await axiosClient.get('/cart')
  return response.data
}

export const clearCart = async () => {
  const response = await axiosClient.delete('/cart/empty')
  return response.data
}

export const cancelCart = async () => {
  const response = await axiosClient.delete('/cart/cancel')
  return response.data
}