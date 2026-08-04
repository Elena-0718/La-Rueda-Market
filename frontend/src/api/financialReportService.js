import { axiosClient } from './axiosClient'

export const getFinancialSummary = async ({ startDate, endDate } = {}) => {
  const params = {}

  if (startDate) {
    params.startDate = startDate
  }

  if (endDate) {
    params.endDate = endDate
  }

  const response = await axiosClient.get('/financial-report/admin/summary', {
    params,
  })

  return response.data
}

export const getFinancialDetail = async ({ startDate, endDate } = {}) => {
  const params = {}

  if (startDate) {
    params.startDate = startDate
  }

  if (endDate) {
    params.endDate = endDate
  }

  const response = await axiosClient.get('/financial-report/admin/detail', {
    params,
  })

  return response.data
}