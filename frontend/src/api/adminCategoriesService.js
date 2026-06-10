import { axiosClient } from './axiosClient'

export const getAdminCategories = async () => {
  const response = await axiosClient.get('/categories/admin/all')
  return response.data
}

export const getCategoryByUuid = async (categoryUuid) => {
  const response = await axiosClient.get(`/categories/${categoryUuid}`)
  return response.data
}

export const createCategory = async (categoryData) => {
  const response = await axiosClient.post('/categories', categoryData)
  return response.data
}

export const updateCategory = async (categoryUuid, categoryData) => {
  const response = await axiosClient.patch(
    `/categories/${categoryUuid}`,
    categoryData
  )

  return response.data
}

export const deactivateCategory = async (categoryUuid) => {
  const response = await axiosClient.delete(`/categories/${categoryUuid}`)
  return response.data
}