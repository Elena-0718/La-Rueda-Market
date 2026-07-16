import { axiosClient } from './axiosClient'

export const getAllInventoryMovementsAdmin = async () => {
  const response = await axiosClient.get('/inventory-movements/admin')
  return response.data
}

export const getInventoryMovementsByInventoryAdmin = async (inventoryUuid) => {
  const response = await axiosClient.get(
    `/inventory-movements/admin/inventory/${inventoryUuid}`,
  )

  return response.data
}

export const createInventoryMovementAdmin = async ({
  inventoryUuid,
  movementType,
  reason,
  quantity,
  purchasePrice,
  supplierName,
  expirationDate,
  orderUuid,
  notes,
}) => {
  const payload = {
    inventoryUuid,
    movementType,
    reason,
    quantity: Number(quantity),
  }

  if (purchasePrice !== '' && purchasePrice !== undefined) {
    payload.purchasePrice = Number(purchasePrice)
  }

  if (supplierName?.trim()) payload.supplierName = supplierName.trim()
  if (expirationDate) payload.expirationDate = expirationDate
  if (orderUuid?.trim()) payload.orderUuid = orderUuid.trim()
  if (notes?.trim()) payload.notes = notes.trim()

  const response = await axiosClient.post('/inventory-movements/admin', payload)
  return response.data
}

export const updateInventoryMovementAdmin = async ({
  movementUuid,
  purchasePrice,
  supplierName,
  expirationDate,
  orderUuid,
  notes,
}) => {
  const payload = {}

  if (purchasePrice !== '' && purchasePrice !== undefined) {
    payload.purchasePrice = Number(purchasePrice)
  }

  if (supplierName?.trim()) payload.supplierName = supplierName.trim()
  if (expirationDate) payload.expirationDate = expirationDate
  if (orderUuid?.trim()) payload.orderUuid = orderUuid.trim()
  if (notes?.trim()) payload.notes = notes.trim()

  const response = await axiosClient.patch(
    `/inventory-movements/admin/${movementUuid}`,
    payload,
  )

  return response.data
}

export const deleteInventoryMovementAdmin = async (movementUuid) => {
  const response = await axiosClient.delete(
    `/inventory-movements/admin/${movementUuid}`,
  )

  return response.data
}