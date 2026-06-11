import { axiosClient } from './axiosClient'

export const getUsers = async () => {
  const response = await axiosClient.get('/users/all')
  return response.data
}