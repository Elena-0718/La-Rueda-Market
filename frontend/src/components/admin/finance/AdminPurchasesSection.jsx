import { useEffect, useMemo, useState } from 'react'
import { axiosClient } from '../../../api/axiosClient'
import {
  createPurchase,
  deletePurchase,
  getActivePurchases,
  updatePurchase,
} from '../../../api/purchasesService'

const today = new Date().toISOString().split('T')[0]

const initialForm = {
  purchaseDate: today,
  supplierName: '',
  purchaseType: 'SCHEDULED_ORDER',
  relatedOrderUuid: '',
  notes: '',
}

const initialItemForm = {
  productUuid: '',
  quantity: '',
  unitCost: '',
  profitPercentage: '30',
  manualSalePrice: '',
  updateProductPrice: false,
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

const formatDate = (value) => {
  if (!value) {
    return 'SIN FECHA'
  }

  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

const normalizeDateInput = (value) => {
  if (!value) {
    return today
  }

  return String(value).split('T')[0]
}

const normalizeList = (data) => {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.data)) {
    return data.data
  }

  if (Array.isArray(data?.products)) {
    return data.products
  }

  return []
}

const getPurchaseTypeLabel = (value) => {
  if (value === 'INVENTORY') {
    return 'Inventario físico'
  }

  if (value === 'SCHEDULED_ORDER') {
    return 'Pedido programado'
  }

  return value || 'Sin tipo'
}

const getProductName = (detail) => {
  return detail?.product?.name || detail?.productName || 'Producto'
}

const roundToNearestHundred = (value) => {
  return Math.round(Number(value || 0) / 100) * 100
}

const calculateSuggestedSalePrice = (unitCost, profitPercentage) => {
  const salePrice =
    Number(unitCost || 0) * (1 + Number(profitPercentage || 0) / 100)

  return roundToNearestHundred(salePrice)
}

export const AdminPurchasesSection = ({ startDate, endDate, onDataChange }) => {
  const [products, setProducts] = useState([])
  const [purchases, setPurchases] = useState([])
  const [formData, setFormData] = useState(initialForm)
  const [itemForm, setItemForm] = useState(initialItemForm)
  const [purchaseItems, setPurchaseItems] = useState([])
  const [editingPurchaseUuid, setEditingPurchaseUuid] = useState(null)
  const [editingItemProductUuid, setEditingItemProductUuid] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const isEditing = Boolean(editingPurchaseUuid)
  const isEditingItem = Boolean(editingItemProductUuid)

  const loadProducts = async () => {
    try {
      const response = await axiosClient.get('/products/admin/all')
      setProducts(normalizeList(response.data))
    } catch (error) {
      setProducts([])
    }
  }

  const loadPurchases = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const data = await getActivePurchases({
        startDate,
        endDate,
      })

      setPurchases(Array.isArray(data) ? data : [])
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'No se pudieron cargar las compras.'

      setErrorMessage(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    loadPurchases()
  }, [startDate, endDate])

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.uuid === itemForm.productUuid)
  }, [products, itemForm.productUuid])

  const currentSuggestedSalePrice = useMemo(() => {
    return calculateSuggestedSalePrice(
      itemForm.unitCost,
      itemForm.profitPercentage,
    )
  }, [itemForm.unitCost, itemForm.profitPercentage])

  const currentFinalSalePrice = useMemo(() => {
    if (itemForm.manualSalePrice) {
      return Number(itemForm.manualSalePrice)
    }

    return currentSuggestedSalePrice
  }, [itemForm.manualSalePrice, currentSuggestedSalePrice])

  const currentLineTotal = useMemo(() => {
    return Number(itemForm.quantity || 0) * Number(itemForm.unitCost || 0)
  }, [itemForm.quantity, itemForm.unitCost])

  const purchaseTotal = useMemo(() => {
    return purchaseItems.reduce(
      (total, item) => total + Number(item.lineTotal || 0),
      0,
    )
  }, [purchaseItems])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleItemChange = (event) => {
    const { name, value, type, checked } = event.target

    setItemForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const resetMessages = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const resetItemForm = () => {
    setItemForm(initialItemForm)
    setEditingItemProductUuid(null)
  }

  const resetForm = () => {
    setFormData(initialForm)
    setItemForm(initialItemForm)
    setPurchaseItems([])
    setEditingPurchaseUuid(null)
    setEditingItemProductUuid(null)
  }

  const validateItemForm = () => {
    if (!itemForm.productUuid) {
      setErrorMessage('Debes seleccionar un producto.')
      return false
    }

    if (!itemForm.quantity || Number(itemForm.quantity) <= 0) {
      setErrorMessage('La cantidad debe ser mayor a cero.')
      return false
    }

    if (!itemForm.unitCost || Number(itemForm.unitCost) <= 0) {
      setErrorMessage('El costo unitario debe ser mayor a cero.')
      return false
    }

    return true
  }

  const buildItemFromForm = () => {
    const product = products.find(
      (currentProduct) => currentProduct.uuid === itemForm.productUuid,
    )

    if (!product) {
      return null
    }

    const quantity = Number(itemForm.quantity)
    const unitCost = Number(itemForm.unitCost)
    const profitPercentage = Number(itemForm.profitPercentage || 0)

    const suggestedSalePrice = calculateSuggestedSalePrice(
      unitCost,
      profitPercentage,
    )

    const manualSalePrice = itemForm.manualSalePrice
      ? Number(itemForm.manualSalePrice)
      : null

    const finalSalePrice =
      manualSalePrice !== null ? manualSalePrice : suggestedSalePrice

    const lineTotal = quantity * unitCost

    return {
      productUuid: product.uuid,
      productName: product.name,
      quantity,
      unitCost,
      profitPercentage,
      suggestedSalePrice,
      manualSalePrice,
      finalSalePrice,
      updateProductPrice: itemForm.updateProductPrice,
      lineTotal,
    }
  }

  const handleAddOrUpdateItem = () => {
    resetMessages()

    if (!validateItemForm()) {
      return
    }

    const item = buildItemFromForm()

    if (!item) {
      setErrorMessage('El producto seleccionado no existe.')
      return
    }

    const itemAlreadyExists = purchaseItems.find(
      (currentItem) =>
        currentItem.productUuid === item.productUuid &&
        currentItem.productUuid !== editingItemProductUuid,
    )

    if (itemAlreadyExists) {
      setErrorMessage(
        'Este producto ya está agregado a la compra. Edita la línea existente o quítala antes de agregarlo de nuevo.',
      )
      return
    }

    if (isEditingItem) {
      setPurchaseItems((current) =>
        current.map((currentItem) =>
          currentItem.productUuid === editingItemProductUuid
            ? item
            : currentItem,
        ),
      )

      setSuccessMessage('Producto actualizado en el comprobante.')
      resetItemForm()
      return
    }

    setPurchaseItems((current) => [...current, item])
    resetItemForm()
  }

  const handleEditItem = (item) => {
    resetMessages()

    setEditingItemProductUuid(item.productUuid)

    setItemForm({
      productUuid: item.productUuid,
      quantity: String(item.quantity),
      unitCost: String(item.unitCost),
      profitPercentage: String(item.profitPercentage),
      manualSalePrice:
        item.manualSalePrice !== null && item.manualSalePrice !== undefined
          ? String(item.manualSalePrice)
          : '',
      updateProductPrice: Boolean(item.updateProductPrice),
    })
  }

  const handleCancelItemEdit = () => {
    resetMessages()
    resetItemForm()
  }

  const handleRemoveItem = (productUuid) => {
    setPurchaseItems((current) =>
      current.filter((item) => item.productUuid !== productUuid),
    )

    if (editingItemProductUuid === productUuid) {
      resetItemForm()
    }
  }

  const buildCreatePayload = () => {
    return {
      purchaseDate: formData.purchaseDate,
      supplierName: formData.supplierName.trim() || null,
      purchaseType: formData.purchaseType,
      relatedOrderUuid: formData.relatedOrderUuid.trim() || null,
      notes: formData.notes.trim() || null,
      details: purchaseItems.map((item) => {
        const detail = {
          productUuid: item.productUuid,
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
          profitPercentage: Number(item.profitPercentage || 0),
          updateProductPrice: item.updateProductPrice,
        }

        if (item.manualSalePrice !== null && item.manualSalePrice !== undefined) {
          detail.manualSalePrice = Number(item.manualSalePrice)
        }

        return detail
      }),
    }
  }

  const buildUpdatePayload = () => {
    return {
      purchaseDate: formData.purchaseDate,
      supplierName: formData.supplierName.trim() || null,
      relatedOrderUuid: formData.relatedOrderUuid.trim() || null,
      notes: formData.notes.trim() || null,
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    resetMessages()

    if (!isEditing && purchaseItems.length === 0) {
      setErrorMessage('Debes agregar al menos un producto a la compra.')
      return
    }

    if (!isEditing && isEditingItem) {
      setErrorMessage(
        'Tienes un producto en edición. Actualízalo o cancela la edición antes de registrar la compra.',
      )
      return
    }

    try {
      setIsSaving(true)

      if (isEditing) {
        await updatePurchase(editingPurchaseUuid, buildUpdatePayload())
        setSuccessMessage('Compra actualizada correctamente.')
      } else {
        await createPurchase(buildCreatePayload())
        setSuccessMessage('Compra registrada correctamente.')
      }

      resetForm()

      await loadPurchases()

      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (isEditing
          ? 'No se pudo actualizar la compra.'
          : 'No se pudo registrar la compra.')

      setErrorMessage(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (purchase) => {
    resetMessages()

    setEditingPurchaseUuid(purchase.uuid)
    setPurchaseItems([])
    resetItemForm()

    setFormData({
      purchaseDate: normalizeDateInput(purchase.purchaseDate),
      supplierName: purchase.supplierName || '',
      purchaseType: purchase.purchaseType || 'SCHEDULED_ORDER',
      relatedOrderUuid: purchase.relatedOrderUuid || '',
      notes: purchase.notes || '',
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleCancelEdit = () => {
    resetMessages()
    resetForm()
  }

  const handleDelete = async (purchase) => {
    const confirmed = window.confirm(
      purchase.purchaseType === 'INVENTORY'
        ? 'Esta compra afectó inventario. ¿Seguro que deseas ANULARLA y reversar el inventario?'
        : '¿Seguro que deseas ANULAR esta compra?',
    )

    if (!confirmed) {
      return
    }

    try {
      resetMessages()

      await deletePurchase(purchase.uuid)

      if (editingPurchaseUuid === purchase.uuid) {
        resetForm()
      }

      setSuccessMessage(
        purchase.purchaseType === 'INVENTORY'
          ? 'Compra anulada correctamente y el inventario fue revertido.'
          : 'Compra anulada correctamente.',
      )

      await loadPurchases()

      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'No se pudo anular la compra.'

      setErrorMessage(Array.isArray(message) ? message.join(', ') : message)
    }
  }

  const totalPurchases = purchases.reduce(
    (total, purchase) => total + Number(purchase.total || 0),
    0,
  )

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Control financiero
        </p>

        <h2 className="mt-1 text-2xl font-bold text-gray-900">
          Compras y costos de productos
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Registra una compra con uno o varios productos del mismo proveedor. Si la compra quedó mal en productos o cantidades, anúlala y regístrala de nuevo.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
          {successMessage}
        </div>
      )}

      {isEditing && (
        <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
          Estás editando datos generales de una compra. Los productos, cantidades y costos no se editan aquí para proteger el inventario.
        </div>
      )}

      {isEditingItem && !isEditing && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
          Estás corrigiendo un producto del comprobante antes de registrar la compra.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-5"
      >
        <div className="mb-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Fecha de compra
            </label>

            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Tipo de compra
            </label>

            <select
              name="purchaseType"
              value={formData.purchaseType}
              onChange={handleChange}
              disabled={isEditing}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600 disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="SCHEDULED_ORDER">Pedido programado</option>
              <option value="INVENTORY">Inventario físico</option>
            </select>

            {isEditing && (
              <p className="mt-1 text-xs text-gray-500">
                Si registraste mal el tipo de compra, anula este registro y crea uno nuevo.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Proveedor
            </label>

            <input
              type="text"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              placeholder="Ejemplo: proveedor local"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Pedido relacionado opcional
            </label>

            <input
              type="text"
              name="relatedOrderUuid"
              value={formData.relatedOrderUuid}
              onChange={handleChange}
              placeholder="UUID del pedido si aplica"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
            />
          </div>
        </div>

        {!isEditing && (
          <>
            <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                {isEditingItem
                  ? 'Corregir producto de la compra'
                  : 'Agregar producto a la compra'}
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Producto
                  </label>

                  <select
                    name="productUuid"
                    value={itemForm.productUuid}
                    onChange={handleItemChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                  >
                    <option value="">Selecciona un producto</option>

                    {products.map((product) => (
                      <option key={product.uuid} value={product.uuid}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Cantidad comprada
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    step="1"
                    value={itemForm.quantity}
                    onChange={handleItemChange}
                    placeholder="Ejemplo: 10"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Costo unitario
                  </label>

                  <input
                    type="number"
                    name="unitCost"
                    min="0"
                    step="100"
                    value={itemForm.unitCost}
                    onChange={handleItemChange}
                    placeholder="Ejemplo: 2500"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Porcentaje de ganancia
                  </label>

                  <input
                    type="number"
                    name="profitPercentage"
                    min="0"
                    step="1"
                    value={itemForm.profitPercentage}
                    onChange={handleItemChange}
                    placeholder="Ejemplo: 30"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Precio manual opcional
                  </label>

                  <input
                    type="number"
                    name="manualSalePrice"
                    min="0"
                    step="100"
                    value={itemForm.manualSalePrice}
                    onChange={handleItemChange}
                    placeholder="Ejemplo: 2900"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      name="updateProductPrice"
                      checked={itemForm.updateProductPrice}
                      onChange={handleItemChange}
                    />

                    Actualizar precio de venta del producto
                  </label>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                Producto actual:{' '}
                <strong>{selectedProduct?.name || 'Sin seleccionar'}</strong>
                {' | '}
                Costo unitario:{' '}
                <strong>{formatCurrency(itemForm.unitCost)}</strong>
                {' | '}
                Precio sugerido:{' '}
                <strong>{formatCurrency(currentSuggestedSalePrice)}</strong>
                {' | '}
                Precio final:{' '}
                <strong>{formatCurrency(currentFinalSalePrice)}</strong>
                {' | '}
                Total línea:{' '}
                <strong>{formatCurrency(currentLineTotal)}</strong>
              </div>

              <div className="mt-4 flex flex-col gap-3 md:flex-row">
                <button
                  type="button"
                  onClick={handleAddOrUpdateItem}
                  className="rounded-xl bg-green-700 px-5 py-3 text-sm font-bold uppercase text-white transition hover:bg-green-800"
                >
                  {isEditingItem ? 'Actualizar producto' : 'Agregar producto'}
                </button>

                {isEditingItem && (
                  <button
                    type="button"
                    onClick={handleCancelItemEdit}
                    className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold uppercase text-gray-700 transition hover:bg-gray-100"
                  >
                    Cancelar edición del producto
                  </button>
                )}
              </div>
            </div>

            <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Comprobante de compra
                </h3>

                <p className="text-sm font-semibold text-gray-600">
                  Proveedor: {formData.supplierName || 'Sin proveedor'}
                </p>
              </div>

              {purchaseItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  Agrega productos para construir la compra.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full min-w-[1040px] border-collapse text-sm">
                    <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                      <tr>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3 text-right">Cantidad</th>
                        <th className="px-4 py-3 text-right">Costo unitario</th>
                        <th className="px-4 py-3 text-right">% Ganancia</th>
                        <th className="px-4 py-3 text-right">Precio sugerido</th>
                        <th className="px-4 py-3 text-right">Precio manual</th>
                        <th className="px-4 py-3 text-right">Precio final</th>
                        <th className="px-4 py-3 text-right">Total línea</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {purchaseItems.map((item) => (
                        <tr
                          key={item.productUuid}
                          className={`border-t border-gray-200 ${
                            editingItemProductUuid === item.productUuid
                              ? 'bg-blue-50'
                              : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            {item.productName}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {item.quantity}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {formatCurrency(item.unitCost)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {item.profitPercentage}%
                          </td>

                          <td className="px-4 py-3 text-right">
                            {formatCurrency(item.suggestedSalePrice)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {item.manualSalePrice !== null
                              ? formatCurrency(item.manualSalePrice)
                              : 'No aplica'}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {formatCurrency(item.finalSalePrice)}
                          </td>

                          <td className="px-4 py-3 text-right font-semibold">
                            {formatCurrency(item.lineTotal)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditItem(item)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold uppercase text-gray-700 hover:bg-gray-50"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.productUuid)}
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold uppercase text-red-700 hover:bg-red-50"
                              >
                                Quitar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr className="border-t border-gray-300 bg-gray-50">
                        <td
                          colSpan="7"
                          className="px-4 py-4 text-right text-base font-black text-gray-900"
                        >
                          Total de la compra
                        </td>

                        <td className="px-4 py-4 text-right text-base font-black text-green-800">
                          {formatCurrency(purchaseTotal)}
                        </td>

                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Notas
          </label>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Observaciones internas opcionales"
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
          />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {!isEditing && (
            <div className="rounded-xl bg-green-50 px-5 py-4 text-sm font-semibold text-green-900">
              Total actual de la compra:{' '}
              <span className="text-lg font-black">
                {formatCurrency(purchaseTotal)}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-3 md:flex-row">
            <button
              type="submit"
              disabled={
                isSaving ||
                (!isEditing && purchaseItems.length === 0) ||
                (!isEditing && isEditingItem)
              }
              className="rounded-xl bg-green-700 px-5 py-3 text-sm font-bold uppercase text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSaving
                ? 'Guardando...'
                : isEditing
                  ? 'Actualizar compra'
                  : `Registrar compra por ${formatCurrency(purchaseTotal)}`}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold uppercase text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          Compras registradas
        </h3>

        <p className="text-sm font-semibold text-gray-600">
          Total compras: {formatCurrency(totalPurchases)}
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-gray-50 p-6 text-center text-sm font-semibold text-gray-500">
          Cargando compras...
        </div>
      ) : purchases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
          No hay compras registradas en este periodo.
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <article
              key={purchase.uuid}
              className={`rounded-2xl border bg-white p-4 ${
                editingPurchaseUuid === purchase.uuid
                  ? 'border-yellow-300 ring-2 ring-yellow-100'
                  : 'border-gray-200'
              }`}
            >
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase text-green-700">
                    {getPurchaseTypeLabel(purchase.purchaseType)}
                  </p>

                  <h4 className="mt-1 text-lg font-black text-gray-900">
                    {purchase.supplierName || 'SIN PROVEEDOR'}
                  </h4>

                  <p className="mt-1 text-sm text-gray-600">
                    Fecha: {formatDate(purchase.purchaseDate)}
                  </p>

                  {purchase.relatedOrderUuid && (
                    <p className="mt-1 text-sm text-gray-600">
                      Pedido relacionado: {purchase.relatedOrderUuid}
                    </p>
                  )}
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500">
                    Total compra
                  </p>

                  <p className="text-xl font-black text-gray-900">
                    {formatCurrency(purchase.total)}
                  </p>
                </div>
              </div>

              <div className="mb-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">
                  Notas
                </p>

                <p className="mt-1">
                  {purchase.notes || 'Sin notas registradas.'}
                </p>
              </div>

              {!purchase.details?.length ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  Esta compra no tiene productos registrados.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full min-w-[980px] border-collapse text-sm">
                    <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                      <tr>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3 text-right">Cantidad</th>
                        <th className="px-4 py-3 text-right">Costo unitario</th>
                        <th className="px-4 py-3 text-right">% Ganancia</th>
                        <th className="px-4 py-3 text-right">Precio sugerido</th>
                        <th className="px-4 py-3 text-right">Precio manual</th>
                        <th className="px-4 py-3 text-right">Precio final</th>
                        <th className="px-4 py-3 text-right">Total línea</th>
                      </tr>
                    </thead>

                    <tbody>
                      {purchase.details.map((detail) => (
                        <tr key={detail.uuid} className="border-t border-gray-200">
                          <td className="px-4 py-3">
                            {getProductName(detail)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {Number(detail.quantity || 0)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {formatCurrency(detail.unitCost)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {Number(detail.profitPercentage || 0)}%
                          </td>

                          <td className="px-4 py-3 text-right">
                            {formatCurrency(detail.suggestedSalePrice)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {detail.manualSalePrice
                              ? formatCurrency(detail.manualSalePrice)
                              : 'No aplica'}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {formatCurrency(detail.finalSalePrice)}
                          </td>

                          <td className="px-4 py-3 text-right font-semibold">
                            {formatCurrency(detail.lineTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 flex flex-col gap-3 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={() => handleEdit(purchase)}
                  disabled={isSaving}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold uppercase text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(purchase)}
                  disabled={isSaving}
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold uppercase text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  Anular
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}