import { axiosClient } from './axiosClient'

export const deactivateProduct = async (productUuid) => {
  const response = await axiosClient.delete(`/products/${productUuid}`)
  return response.data
}