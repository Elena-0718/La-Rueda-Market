import { axiosClient } from './axiosClient'

export const getActiveRecipes = async (productUuid) => {
  const url = productUuid ? `/recipes?productUuid=${productUuid}` : '/recipes'
  const response = await axiosClient.get(url)
  return response.data
}

export const getActiveRecipeByUuid = async (uuid) => {
  const response = await axiosClient.get(`/recipes/${uuid}`)
  return response.data
}

export const getAllRecipesAdmin = async () => {
  const response = await axiosClient.get('/recipes/admin/all')
  return response.data
}

export const getRecipeByUuidAdmin = async (uuid) => {
  const response = await axiosClient.get(`/recipes/admin/${uuid}`)
  return response.data
}

export const createRecipeAdmin = async (recipeData) => {
  const response = await axiosClient.post('/recipes/admin', recipeData)
  return response.data
}

export const updateRecipeAdmin = async ({ recipeUuid, recipeData }) => {
  const response = await axiosClient.patch(
    `/recipes/admin/${recipeUuid}`,
    recipeData,
  )
  return response.data
}

export const deleteRecipeAdmin = async (recipeUuid) => {
  const response = await axiosClient.delete(`/recipes/admin/${recipeUuid}`)
  return response.data
}