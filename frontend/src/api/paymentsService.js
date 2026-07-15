import { axiosClient } from './axiosClient'

export const createPayment = async ({
  method,
  orderUuid,
  reference,
  paymentNotes,
}) => {
  const payload = {
    method,
    orderUuid,
  }

  if (reference?.trim()) {
    payload.reference = reference.trim()
  }

  if (paymentNotes?.trim()) {
    payload.paymentNotes = paymentNotes.trim()
  }

  const response = await axiosClient.post('/payments/checkout', payload)
  return response.data
}

export const getPaymentByUuid = async (uuid) => {
  const response = await axiosClient.get(`/payments/${uuid}`)
  return response.data
}