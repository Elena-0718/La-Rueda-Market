import { axiosClient } from './axiosClient'

export const getAllDeliveriesAdmin = async () => {
  const response = await axiosClient.get('/deliveries/admin/all')
  return response.data
}

export const createDeliveryAdmin = async ({ orderUuid, assignedTo, deliveryNotes }) => {
  const payload = {
    orderUuid,
  }

  if (assignedTo?.trim()) {
    payload.assignedTo = assignedTo.trim()
  }

  if (deliveryNotes?.trim()) {
    payload.deliveryNotes = deliveryNotes.trim()
  }

  const response = await axiosClient.post('/deliveries/admin', payload)
  return response.data
}

export const updateDeliveryStatusAdmin = async ({ deliveryUuid, status }) => {
  const response = await axiosClient.put(`/deliveries/admin/${deliveryUuid}/status`, {
    status,
  })

  return response.data
}