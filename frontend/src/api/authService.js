import { axiosClient } from './axiosClient'

export const login = async ({ phone, password }) => {
  const response = await axiosClient.post('/auth/login', {
    phone,
    password,
  })

  return response.data
}