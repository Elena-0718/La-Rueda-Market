import { axiosClient } from './axiosClient'

export const getActivePurchases = async ({ startDate, endDate } = {}) => {
  const params = {}

  if (startDate) {
    params.startDate = startDate
  }

  if (endDate) {
    params.endDate = endDate
  }

  const response = await axiosClient.get('/purchases/admin', {
    params,
  })

  return response.data
}

export const createPurchase = async (payload) => {
  const response = await axiosClient.post('/purchases/admin', payload)

  return response.data
}

export const updatePurchase = async (uuid, payload) => {
  const response = await axiosClient.patch(`/purchases/admin/${uuid}`, payload)

  return response.data
}

export const deletePurchase = async (uuid) => {
  const response = await axiosClient.delete(`/purchases/admin/${uuid}`)

  return response.data
}