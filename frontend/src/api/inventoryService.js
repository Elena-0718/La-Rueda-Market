import { axiosClient } from './axiosClient'

export const getInventorySummaryAdmin = async () => {
  const response = await axiosClient.get('/inventory/admin/summary')
  return response.data
}

export const getAllInventoriesAdmin = async () => {
  const response = await axiosClient.get('/inventory/admin')
  return response.data
}

export const getInventoryByUuidAdmin = async (uuid) => {
  const response = await axiosClient.get(`/inventory/admin/${uuid}`)
  return response.data
}

export const createInventoryAdmin = async ({
  productUuid,
  currentStock,
  minimumStock,
  isTracked,
  isPerishable,
  expirationDate,
  expirationAlertDays,
  supplierName,
  lastPurchasePrice,
  notes,
}) => {
  const payload = {
    productUuid,
    currentStock: Number(currentStock || 0),
    minimumStock: Number(minimumStock || 0),
    isTracked: Boolean(isTracked),
    isPerishable: Boolean(isPerishable),
    expirationAlertDays: Number(expirationAlertDays || 7),
  }

  if (expirationDate) payload.expirationDate = expirationDate
  if (supplierName?.trim()) payload.supplierName = supplierName.trim()
  if (lastPurchasePrice !== '' && lastPurchasePrice !== undefined) {
    payload.lastPurchasePrice = Number(lastPurchasePrice)
  }
  if (notes?.trim()) payload.notes = notes.trim()

  const response = await axiosClient.post('/inventory/admin', payload)
  return response.data
}

export const updateInventoryAdmin = async ({
  inventoryUuid,
  productUuid,
  currentStock,
  minimumStock,
  isTracked,
  isPerishable,
  expirationDate,
  expirationAlertDays,
  supplierName,
  lastPurchasePrice,
  notes,
}) => {
  const payload = {
    productUuid,
    currentStock: Number(currentStock || 0),
    minimumStock: Number(minimumStock || 0),
    isTracked: Boolean(isTracked),
    isPerishable: Boolean(isPerishable),
    expirationAlertDays: Number(expirationAlertDays || 7),
  }

  if (expirationDate) payload.expirationDate = expirationDate
  if (supplierName?.trim()) payload.supplierName = supplierName.trim()
  if (lastPurchasePrice !== '' && lastPurchasePrice !== undefined) {
    payload.lastPurchasePrice = Number(lastPurchasePrice)
  }
  if (notes?.trim()) payload.notes = notes.trim()

  const response = await axiosClient.patch(
    `/inventory/admin/${inventoryUuid}`,
    payload,
  )

  return response.data
}

export const deleteInventoryAdmin = async (inventoryUuid) => {
  const response = await axiosClient.delete(`/inventory/admin/${inventoryUuid}`)
  return response.data
}