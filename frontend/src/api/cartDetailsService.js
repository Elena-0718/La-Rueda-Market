import { axiosClient } from './axiosClient'

export const addProductToCart = async ({ productUuid, quantity }) => {
  const response = await axiosClient.post('/cart-details/add-product', {
    productUuid,
    quantity,
  })

  return response.data
}

export const updateCartProductQuantity = async ({ detailUuid, quantity }) => {
  const response = await axiosClient.put(
    `/cart-details/update-product-quantity/${detailUuid}`,
    {
      quantity,
    },
  )

  return response.data
}

export const deleteProductFromCart = async (detailUuid) => {
  const response = await axiosClient.delete(
    `/cart-details/delete-product/${detailUuid}`,
  )

  return response.data
}