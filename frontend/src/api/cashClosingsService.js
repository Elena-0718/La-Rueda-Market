import { axiosClient } from './axiosClient'

export const getCashClosings = async ({ startDate, endDate } = {}) => {
  const params = {}

  if (startDate) {
    params.startDate = startDate
  }

  if (endDate) {
    params.endDate = endDate
  }

  const response = await axiosClient.get('/cash-closings/admin', { params })

  return response.data
}

export const getCashClosingSummary = async ({ startDate, endDate } = {}) => {
  const params = {}

  if (startDate) {
    params.startDate = startDate
  }

  if (endDate) {
    params.endDate = endDate
  }

  const response = await axiosClient.get('/cash-closings/admin/summary', {
    params,
  })

  return response.data
}

export const createCashClosing = async (payload) => {
  const response = await axiosClient.post('/cash-closings/admin', payload)

  return response.data
}

export const updateCashClosing = async (uuid, payload) => {
  const response = await axiosClient.patch(
    `/cash-closings/admin/${uuid}`,
    payload,
  )

  return response.data
}

export const deleteCashClosing = async (uuid) => {
  const response = await axiosClient.delete(`/cash-closings/admin/${uuid}`)

  return response.data
}