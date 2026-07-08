import { axiosClient } from './axiosClient'

export const getProducts = async () => {
  const response = await axiosClient.get('/products')
  return response.data
}