import { useEffect, useMemo, useState } from 'react'
import { axiosClient } from '../../../api/axiosClient'
import {
  createPhysicalSale,
  deletePhysicalSale,
  getActivePhysicalSales,
  updatePhysicalSale,
} from '../../../api/physicalSalesService'

const today = new Date().toISOString().split('T')[0]

const initialForm = {
  saleDate: today,
  customerType: 'LOCAL',
  customerUserUuid: '',
  customerName: 'Cliente local',
  paymentMethod: 'CASH',
  notes: '',
}

const initialItemForm = {
  productUuid: '',
  quantity: '',
  unitPrice: '',
}

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'CARD', label: 'Tarjeta' },
  { value: 'OTHER', label: 'Otro' },
]

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

  if (Array.isArray(data?.users)) {
    return data.users
  }

  return []
}

const getPaymentMethodLabel = (value) => {
  return PAYMENT_METHODS.find((method) => method.value === value)?.label || value
}

const getUserLabel = (user) => {
  if (!user) {
    return 'Cliente'
  }

  const name =
    user.name ||
    user.fullName ||
    user.firstName ||
    user.username ||
    'Cliente'

  const phone =
    user.phone ||
    user.cellphone ||
    user.email ||
    ''

  return phone ? `${name} - ${phone}` : name
}

const getSaleCustomerName = (sale) => {
  if (sale?.customerUser) {
    return getUserLabel(sale.customerUser)
  }

  return sale?.customerName || 'Cliente local'
}

export const AdminPhysicalSalesSection = ({
  startDate,
  endDate,
  onDataChange,
}) => {
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [sales, setSales] = useState([])
  const [formData, setFormData] = useState(initialForm)
  const [itemForm, setItemForm] = useState(initialItemForm)
  const [saleItems, setSaleItems] = useState([])
  const [editingSaleUuid, setEditingSaleUuid] = useState(null)
  const [editingItemProductUuid, setEditingItemProductUuid] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const isEditing = Boolean(editingSaleUuid)
  const isEditingItem = Boolean(editingItemProductUuid)

  const loadProducts = async () => {
    try {
      const response = await axiosClient.get('/products/admin/all')
      setProducts(normalizeList(response.data))
    } catch (error) {
      setProducts([])
    }
  }

  const loadUsers = async () => {
    try {
      const response = await axiosClient.get('/users/admin/all')
      setUsers(normalizeList(response.data))
    } catch (error) {
      setUsers([])
    }
  }

  const loadSales = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const data = await getActivePhysicalSales({
        startDate,
        endDate,
      })

      setSales(Array.isArray(data) ? data : [])
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'No se pudieron cargar las ventas físicas.'

      setErrorMessage(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
    loadUsers()
  }, [])

  useEffect(() => {
    loadSales()
  }, [startDate, endDate])

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.uuid === itemForm.productUuid)
  }, [products, itemForm.productUuid])

  const selectedUser = useMemo(() => {
    return users.find((user) => user.uuid === formData.customerUserUuid)
  }, [users, formData.customerUserUuid])

  const currentUnitPrice = useMemo(() => {
    if (itemForm.unitPrice) {
      return Number(itemForm.unitPrice)
    }

    return Number(selectedProduct?.price || 0)
  }, [itemForm.unitPrice, selectedProduct])

  const currentLineTotal = useMemo(() => {
    return Number(itemForm.quantity || 0) * Number(currentUnitPrice || 0)
  }, [itemForm.quantity, currentUnitPrice])

  const saleTotal = useMemo(() => {
    return saleItems.reduce(
      (total, item) => total + Number(item.lineTotal || 0),
      0,
    )
  }, [saleItems])

  const handleFormChange = (event) => {
    const { name, value } = event.target

    if (name === 'customerType') {
      setFormData((current) => ({
        ...current,
        customerType: value,
        customerUserUuid: '',
        customerName: value === 'LOCAL' ? 'Cliente local' : '',
      }))

      return
    }

    if (name === 'customerUserUuid') {
      const user = users.find((currentUser) => currentUser.uuid === value)

      setFormData((current) => ({
        ...current,
        customerUserUuid: value,
        customerName: user ? getUserLabel(user) : '',
      }))

      return
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleItemChange = (event) => {
    const { name, value } = event.target

    setItemForm((current) => ({
      ...current,
      [name]: value,
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
    setSaleItems([])
    setEditingSaleUuid(null)
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

    if (!currentUnitPrice || Number(currentUnitPrice) <= 0) {
      setErrorMessage('El producto no tiene un precio válido.')
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
    const unitPrice = Number(currentUnitPrice)
    const lineTotal = quantity * unitPrice

    return {
      productUuid: product.uuid,
      productName: product.name,
      quantity,
      unitPrice,
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

    const itemAlreadyExists = saleItems.find(
      (currentItem) =>
        currentItem.productUuid === item.productUuid &&
        currentItem.productUuid !== editingItemProductUuid,
    )

    if (itemAlreadyExists) {
      setErrorMessage(
        'Este producto ya está agregado al comprobante. Edita la línea existente o quítala antes de agregarlo de nuevo.',
      )
      return
    }

    if (isEditingItem) {
      setSaleItems((current) =>
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

    setSaleItems((current) => [...current, item])
    resetItemForm()
  }

  const handleEditItem = (item) => {
    resetMessages()

    setEditingItemProductUuid(item.productUuid)

    setItemForm({
      productUuid: item.productUuid,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
    })
  }

  const handleCancelItemEdit = () => {
    resetMessages()
    resetItemForm()
  }

  const handleRemoveItem = (productUuid) => {
    setSaleItems((current) =>
      current.filter((item) => item.productUuid !== productUuid),
    )

    if (editingItemProductUuid === productUuid) {
      resetItemForm()
    }
  }

  const buildCreatePayload = () => {
    const payload = {
      saleDate: formData.saleDate,
      paymentMethod: formData.paymentMethod,
      customerName:
        formData.customerName?.trim() ||
        selectedUser?.name ||
        selectedUser?.fullName ||
        'Cliente local',
      notes:
        formData.notes.trim() ||
        `Venta física registrada para ${
          formData.customerName || 'Cliente local'
        }.`,
      details: saleItems.map((item) => ({
        productUuid: item.productUuid,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    }

    if (formData.customerType === 'REGISTERED') {
      payload.customerUserUuid = formData.customerUserUuid
    }

    return payload
  }

  const buildUpdatePayload = () => {
    const payload = {
      saleDate: formData.saleDate,
      paymentMethod: formData.paymentMethod,
      customerName:
        formData.customerName?.trim() ||
        selectedUser?.name ||
        selectedUser?.fullName ||
        'Cliente local',
      notes: formData.notes.trim() || null,
    }

    if (formData.customerType === 'REGISTERED') {
      payload.customerUserUuid = formData.customerUserUuid
    }

    return payload
  }

  const validateHeader = () => {
    if (formData.customerType === 'REGISTERED' && !formData.customerUserUuid) {
      setErrorMessage('Debes seleccionar un cliente registrado.')
      return false
    }

    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    resetMessages()

    if (!validateHeader()) {
      return
    }

    if (!isEditing && saleItems.length === 0) {
      setErrorMessage('Debes agregar al menos un producto a la venta.')
      return
    }

    if (!isEditing && isEditingItem) {
      setErrorMessage(
        'Tienes un producto en edición. Actualízalo o cancela la edición antes de registrar la venta.',
      )
      return
    }

    try {
      setIsSaving(true)

      if (isEditing) {
        await updatePhysicalSale(editingSaleUuid, buildUpdatePayload())
        setSuccessMessage('Venta física actualizada correctamente.')
      } else {
        await createPhysicalSale(buildCreatePayload())
        setSuccessMessage('Venta física registrada correctamente.')
      }

      resetForm()

      await loadSales()

      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (isEditing
          ? 'No se pudo actualizar la venta física.'
          : 'No se pudo registrar la venta física.')

      setErrorMessage(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (sale) => {
    resetMessages()

    const hasRegisteredCustomer = Boolean(sale.customerUser?.uuid)

    setEditingSaleUuid(sale.uuid)
    setSaleItems([])
    resetItemForm()

    setFormData({
      saleDate: normalizeDateInput(sale.saleDate),
      customerType: hasRegisteredCustomer ? 'REGISTERED' : 'LOCAL',
      customerUserUuid: sale.customerUser?.uuid || '',
      customerName: sale.customerName || getSaleCustomerName(sale),
      paymentMethod: sale.paymentMethod || 'CASH',
      notes: sale.notes || '',
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

  const handleDelete = async (sale) => {
    const confirmed = window.confirm(
      'Esta venta física ya descontó inventario. ¿Seguro que deseas ANULARLA y devolver los productos al inventario?',
    )

    if (!confirmed) {
      return
    }

    try {
      resetMessages()

      await deletePhysicalSale(sale.uuid)

      if (editingSaleUuid === sale.uuid) {
        resetForm()
      }

      setSuccessMessage(
        'Venta física anulada correctamente y el inventario fue devuelto.',
      )

      await loadSales()

      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'No se pudo anular la venta física.'

      setErrorMessage(Array.isArray(message) ? message.join(', ') : message)
    }
  }

  const totalSales = sales.reduce(
    (total, sale) => total + Number(sale.total || 0),
    0,
  )

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Control financiero
        </p>

        <h2 className="mt-1 text-2xl font-bold text-gray-900">
          Ventas físicas del local
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Registra ventas del local, asócialas a un cliente registrado si aplica y revisa el total antes de cobrar.
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
          Estás editando datos generales de una venta física. Los productos y cantidades no se editan aquí para proteger el inventario.
        </div>
      )}

      {isEditingItem && !isEditing && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
          Estás corrigiendo un producto del comprobante antes de registrar la venta.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-5"
      >
        <div className="mb-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Fecha de venta
            </label>

            <input
              type="date"
              name="saleDate"
              value={formData.saleDate}
              onChange={handleFormChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Forma de pago
            </label>

            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleFormChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Tipo de cliente
            </label>

            <select
              name="customerType"
              value={formData.customerType}
              onChange={handleFormChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
            >
              <option value="LOCAL">Cliente local</option>
              <option value="REGISTERED">Cliente registrado</option>
            </select>
          </div>

          {formData.customerType === 'LOCAL' && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nombre del cliente
              </label>

              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleFormChange}
                placeholder="Ejemplo: Cliente local"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
              />
            </div>
          )}

          {formData.customerType === 'REGISTERED' && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Cliente registrado
              </label>

              <select
                name="customerUserUuid"
                value={formData.customerUserUuid}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
              >
                <option value="">Selecciona un cliente</option>

                {users.map((user) => (
                  <option key={user.uuid} value={user.uuid}>
                    {getUserLabel(user)}
                  </option>
                ))}
              </select>

              {users.length === 0 && (
                <p className="mt-1 text-xs text-red-600">
                  No se pudieron cargar clientes. Revisa el endpoint /users/admin/all.
                </p>
              )}
            </div>
          )}
        </div>

        {!isEditing && (
          <>
            <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                {isEditingItem
                  ? 'Corregir producto del comprobante'
                  : 'Agregar producto al comprobante'}
              </h3>

              <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto]">
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
                        {product.name} - {formatCurrency(product.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Cantidad
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    step="1"
                    value={itemForm.quantity}
                    onChange={handleItemChange}
                    placeholder="Ejemplo: 2"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Precio unitario
                  </label>

                  <input
                    type="number"
                    name="unitPrice"
                    min="0"
                    step="100"
                    value={itemForm.unitPrice}
                    onChange={handleItemChange}
                    placeholder={
                      selectedProduct
                        ? String(Number(selectedProduct.price || 0))
                        : 'Precio'
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Si lo dejas vacío, usa el precio actual del producto.
                  </p>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddOrUpdateItem}
                    className="w-full rounded-xl bg-green-700 px-5 py-3 text-sm font-bold uppercase text-white transition hover:bg-green-800"
                  >
                    {isEditingItem ? 'Actualizar' : 'Agregar'}
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                Producto actual:{' '}
                <strong>{selectedProduct?.name || 'Sin seleccionar'}</strong>
                {' | '}
                Precio usado:{' '}
                <strong>{formatCurrency(currentUnitPrice)}</strong>
                {' | '}
                Total línea:{' '}
                <strong>{formatCurrency(currentLineTotal)}</strong>
              </div>

              {isEditingItem && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleCancelItemEdit}
                    className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold uppercase text-gray-700 transition hover:bg-gray-100"
                  >
                    Cancelar edición del producto
                  </button>
                </div>
              )}
            </div>

            <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Comprobante de venta
                </h3>

                <p className="text-sm font-semibold text-gray-600">
                  Cliente:{' '}
                  {formData.customerType === 'REGISTERED'
                    ? getUserLabel(selectedUser)
                    : formData.customerName || 'Cliente local'}
                </p>
              </div>

              {saleItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  Agrega productos para construir el comprobante.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full min-w-[840px] border-collapse text-sm">
                    <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                      <tr>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3 text-right">Cantidad</th>
                        <th className="px-4 py-3 text-right">Precio unitario</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {saleItems.map((item) => (
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
                            {formatCurrency(item.unitPrice)}
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
                          colSpan="3"
                          className="px-4 py-4 text-right text-base font-black text-gray-900"
                        >
                          Total a cobrar
                        </td>

                        <td className="px-4 py-4 text-right text-base font-black text-green-800">
                          {formatCurrency(saleTotal)}
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
            onChange={handleFormChange}
            rows="3"
            placeholder="Observaciones internas opcionales"
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
          />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {!isEditing && (
            <div className="rounded-xl bg-green-50 px-5 py-4 text-sm font-semibold text-green-900">
              Total actual del comprobante:{' '}
              <span className="text-lg font-black">
                {formatCurrency(saleTotal)}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-3 md:flex-row">
            <button
              type="submit"
              disabled={
                isSaving ||
                (!isEditing && saleItems.length === 0) ||
                (!isEditing && isEditingItem)
              }
              className="rounded-xl bg-green-700 px-5 py-3 text-sm font-bold uppercase text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSaving
                ? 'Guardando...'
                : isEditing
                  ? 'Actualizar venta'
                  : `Registrar venta por ${formatCurrency(saleTotal)}`}
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
          Ventas físicas registradas
        </h3>

        <p className="text-sm font-semibold text-gray-600">
          Total ventas físicas: {formatCurrency(totalSales)}
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-gray-50 p-6 text-center text-sm font-semibold text-gray-500">
          Cargando ventas físicas...
        </div>
      ) : sales.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
          No hay ventas físicas registradas en este periodo.
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <article
              key={sale.uuid}
              className={`rounded-2xl border bg-white p-4 ${
                editingSaleUuid === sale.uuid
                  ? 'border-yellow-300 ring-2 ring-yellow-100'
                  : 'border-gray-200'
              }`}
            >
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase text-green-700">
                    Venta física
                  </p>

                  <h4 className="mt-1 text-lg font-black text-gray-900">
                    Cliente: {getSaleCustomerName(sale)}
                  </h4>

                  <p className="text-sm text-gray-600">
                    Fecha: {formatDate(sale.saleDate)} | Pago:{' '}
                    {getPaymentMethodLabel(sale.paymentMethod)}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500">
                    Total venta
                  </p>

                  <p className="text-xl font-black text-gray-900">
                    {formatCurrency(sale.total)}
                  </p>
                </div>
              </div>

              <div className="mb-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">
                  Notas
                </p>

                <p className="mt-1">
                  {sale.notes || 'Sin notas registradas.'}
                </p>
              </div>

              {!sale.details?.length ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                  Esta venta no tiene productos registrados.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full min-w-[760px] border-collapse text-sm">
                    <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                      <tr>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3 text-right">Cantidad</th>
                        <th className="px-4 py-3 text-right">Precio unitario</th>
                        <th className="px-4 py-3 text-right">Total línea</th>
                      </tr>
                    </thead>

                    <tbody>
                      {sale.details.map((detail) => (
                        <tr key={detail.uuid} className="border-t border-gray-200">
                          <td className="px-4 py-3">
                            {detail.product?.name || 'Producto'}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {Number(detail.quantity || 0)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {formatCurrency(detail.unitPrice)}
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
                  onClick={() => handleEdit(sale)}
                  disabled={isSaving}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold uppercase text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(sale)}
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