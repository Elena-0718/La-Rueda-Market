import { axiosClient } from './axiosClient'

export const getActivePhysicalSales = async ({ startDate, endDate } = {}) => {
  const params = {}

  if (startDate) {
    params.startDate = startDate
  }

  if (endDate) {
    params.endDate = endDate
  }

  const response = await axiosClient.get('/physical-sales/admin', {
    params,
  })

  return response.data
}

export const createPhysicalSale = async (payload) => {
  const response = await axiosClient.post('/physical-sales/admin', payload)

  return response.data
}

export const updatePhysicalSale = async (uuid, payload) => {
  const response = await axiosClient.patch(`/physical-sales/admin/${uuid}`, payload)

  return response.data
}

export const deletePhysicalSale = async (uuid) => {
  const response = await axiosClient.delete(`/physical-sales/admin/${uuid}`)

  return response.data
}