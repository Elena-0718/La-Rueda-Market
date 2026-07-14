import { axiosClient } from './axiosClient'

export const getMyOrderDetails = async (orderUuid) => {
  const response = await axiosClient.get(`/order-details/my-order/${orderUuid}`)
  return response.data
}