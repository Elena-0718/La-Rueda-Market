import { axiosClient } from './axiosClient'

export const getAllOrdersAdmin = async () => {
  const response = await axiosClient.get('/orders/admin/all')
  return response.data
}

export const updateOrderStatusAdmin = async ({ orderUuid, status }) => {
  const response = await axiosClient.patch(`/orders/admin/${orderUuid}/status`, {
    status,
  })

  return response.data
}

export const cancelOrderAdmin = async (orderUuid) => {
  const response = await axiosClient.delete(`/orders/admin/${orderUuid}`)
  return response.data
}