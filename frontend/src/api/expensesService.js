import { axiosClient } from './axiosClient'

export const getActiveExpenses = async ({ startDate, endDate } = {}) => {
  const params = {}

  if (startDate) {
    params.startDate = startDate
  }

  if (endDate) {
    params.endDate = endDate
  }

  const response = await axiosClient.get('/expenses/admin', {
    params,
  })

  return response.data
}

export const getAllExpenses = async () => {
  const response = await axiosClient.get('/expenses/admin/all')

  return response.data
}

export const createExpense = async (payload) => {
  const response = await axiosClient.post('/expenses/admin', payload)

  return response.data
}

export const updateExpense = async (uuid, payload) => {
  const response = await axiosClient.patch(`/expenses/admin/${uuid}`, payload)

  return response.data
}

export const deleteExpense = async (uuid) => {
  const response = await axiosClient.delete(`/expenses/admin/${uuid}`)

  return response.data
}