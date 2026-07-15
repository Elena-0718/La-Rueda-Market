import { axiosClient } from './axiosClient'

export const getAllPaymentsAdmin = async () => {
  const response = await axiosClient.get('/payments/admin/all')
  return response.data
}

export const confirmPaymentAdmin = async (paymentUuid) => {
  const response = await axiosClient.put(`/payments/admin/confirm/${paymentUuid}`)
  return response.data
}

export const rejectPaymentAdmin = async (paymentUuid) => {
  const response = await axiosClient.delete(`/payments/admin/reject/${paymentUuid}`)
  return response.data
}

export const updatePaymentStatusAdmin = async ({ paymentUuid, status, paymentNotes }) => {
  const payload = { status }

  if (paymentNotes?.trim()) {
    payload.paymentNotes = paymentNotes.trim()
  }

  const response = await axiosClient.put(`/payments/admin/status/${paymentUuid}`, payload)
  return response.data
}