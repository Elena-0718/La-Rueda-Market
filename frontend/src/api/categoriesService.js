import { axiosClient } from './axiosClient'

export const getCategories = async () => {
  const response = await axiosClient.get('/categories')
  return response.data
}