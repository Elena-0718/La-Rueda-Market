import { axiosClient } from './axiosClient'

export const createOrderFromCart = async ({
  fulfillmentType,
  shippingAddress,
  shippingPhone,
  deliveryNotes,
}) => {
  const payload = {
    fulfillmentType,
    shippingPhone,
    deliveryNotes,
  }

  if (fulfillmentType === 'SCHEDULED_DELIVERY') {
    payload.shippingAddress = shippingAddress
  }

  const response = await axiosClient.post('/orders', payload)
  return response.data
}

export const getMyOrders = async () => {
  const response = await axiosClient.get('/orders/my-orders')
  return response.data
}

export const getOrderByUuid = async (uuid) => {
  const response = await axiosClient.get(`/orders/${uuid}`)
  return response.data
}

export const cancelMyOrder = async (uuid) => {
  const response = await axiosClient.patch(`/orders/${uuid}/cancel`)
  return response.data
}