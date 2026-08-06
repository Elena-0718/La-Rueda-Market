import { axiosClient } from './axiosClient'

export const getCashDeposits = async ({ startDate, endDate } = {}) => {
  const params = {}

  if (startDate) {
    params.startDate = startDate
  }

  if (endDate) {
    params.endDate = endDate
  }

  const response = await axiosClient.get('/cash-deposits/admin', { params })

  return response.data
}

export const getCashDepositSummary = async ({ startDate, endDate } = {}) => {
  const params = {}

  if (startDate) {
    params.startDate = startDate
  }

  if (endDate) {
    params.endDate = endDate
  }

  const response = await axiosClient.get('/cash-deposits/admin/summary', {
    params,
  })

  return response.data
}

export const createCashDeposit = async (payload) => {
  const response = await axiosClient.post('/cash-deposits/admin', payload)

  return response.data
}

export const updateCashDeposit = async (uuid, payload) => {
  const response = await axiosClient.patch(
    `/cash-deposits/admin/${uuid}`,
    payload,
  )

  return response.data
}

export const deleteCashDeposit = async (uuid) => {
  const response = await axiosClient.delete(`/cash-deposits/admin/${uuid}`)

  return response.data
}