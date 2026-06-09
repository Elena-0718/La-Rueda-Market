import { axiosClient } from './axiosClient'

export const createProduct = async (productData) => {
  const response = await axiosClient.post('/products', productData)
  return response.data
}

export const getProductByUuid = async (productUuid) => {
  const response = await axiosClient.get(`/products/${productUuid}`)
  return response.data
}

export const updateProduct = async (productUuid, productData) => {
  const response = await axiosClient.patch(`/products/${productUuid}`, productData)
  return response.data
}

export const uploadProductImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axiosClient.post('/uploads/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export const deactivateProduct = async (productUuid) => {
  const response = await axiosClient.delete(`/products/${productUuid}`)
  return response.data
}