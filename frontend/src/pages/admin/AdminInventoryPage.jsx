import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createInventoryAdmin,
  deleteInventoryAdmin,
  getAllInventoriesAdmin,
  getInventorySummaryAdmin,
} from '../../api/inventoryService'
import {
  createInventoryMovementAdmin,
  getInventoryMovementsByInventoryAdmin,
} from '../../api/inventoryMovementsService'
import { getProducts } from '../../api/productsService'

const initialInventoryForm = {
  productUuid: '',
  currentStock: 0,
  minimumStock: 0,
  isTracked: true,
  isPerishable: false,
  expirationDate: '',
  expirationAlertDays: 7,
  supplierName: '',
  lastPurchasePrice: '',
  notes: '',
}

const initialMovementForm = {
  inventoryUuid: '',
  movementType: 'IN',
  reason: 'SUPPLIER_PURCHASE',
  quantity: 1,
  purchasePrice: '',
  supplierName: '',
  expirationDate: '',
  orderUuid: '',
  notes: '',
}

const movementReasons = {
  IN: [
    {
      value: 'SUPPLIER_PURCHASE',
      label: 'COMPRA A PROVEEDOR',
    },
    {
      value: 'POSITIVE_ADJUSTMENT',
      label: 'AJUSTE POSITIVO',
    },
    {
      value: 'RETURN',
      label: 'DEVOLUCIÓN',
    },
  ],
  OUT: [
    {
      value: 'STORE_SALE',
      label: 'VENTA EN TIENDA',
    },
    {
      value: 'ONLINE_SALE',
      label: 'VENTA ONLINE / PEDIDO PROGRAMADO',
    },
    {
      value: 'LOSS',
      label: 'PÉRDIDA',
    },
    {
      value: 'EXPIRATION',
      label: 'VENCIMIENTO',
    },
    {
      value: 'NEGATIVE_ADJUSTMENT',
      label: 'AJUSTE NEGATIVO',
    },
  ],
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

const formatDate = (date) => {
  if (!date) return 'NO APLICA'

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
  }).format(new Date(date))
}

const getUnitLabel = (unitMeasure) => {
  const units = {
    unit: 'UNIDAD',
    lb: 'LIBRA',
    bag: 'BOLSA',
    bottle: 'BOTELLA',
  }

  return units[unitMeasure] || unitMeasure?.toUpperCase() || 'UNIDAD'
}

const getStatusClass = (status) => {
  const classes = {
    NORMAL: 'bg-green-100 text-green-800',
    'BAJO STOCK': 'bg-amber-100 text-amber-800',
    'PRÓXIMO A VENCER': 'bg-amber-100 text-amber-800',
    VENCIDO: 'bg-red-100 text-red-700',
    'SIN CONTROL': 'bg-stone-100 text-stone-700',
  }

  return `inline-flex rounded-full px-3 py-1 text-xs font-black ${
    classes[status] || classes['SIN CONTROL']
  }`
}

const getMovementTypeLabel = (movementType) => {
  const labels = {
    IN: 'ENTRADA',
    OUT: 'SALIDA',
  }

  return labels[movementType] || movementType
}

const getReasonLabel = (reason) => {
  const labels = {
    SUPPLIER_PURCHASE: 'COMPRA A PROVEEDOR',
    STORE_SALE: 'VENTA EN TIENDA',
    ONLINE_SALE: 'VENTA ONLINE / PEDIDO PROGRAMADO',
    LOSS: 'PÉRDIDA',
    EXPIRATION: 'VENCIMIENTO',
    POSITIVE_ADJUSTMENT: 'AJUSTE POSITIVO',
    NEGATIVE_ADJUSTMENT: 'AJUSTE NEGATIVO',
    RETURN: 'DEVOLUCIÓN',
  }

  return labels[reason] || reason
}

const getBackendErrorMessage = (error, fallbackMessage) => {
  const backendMessage = error?.response?.data?.message || fallbackMessage

  return Array.isArray(backendMessage)
    ? backendMessage.join(' ')
    : backendMessage
}

function AdminInventoryPage() {
  const navigate = useNavigate()

  const [inventories, setInventories] = useState([])
  const [products, setProducts] = useState([])
  const [summary, setSummary] = useState({
    controlledProducts: 0,
    lowStock: 0,
    nearExpiration: 0,
    expired: 0,
    totalMovements: 0,
  })

  const [inventoryForm, setInventoryForm] = useState(initialInventoryForm)
  const [movementForm, setMovementForm] = useState(initialMovementForm)
  const [selectedInventory, setSelectedInventory] = useState(null)
  const [movements, setMovements] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const inventoriesProductUuids = useMemo(() => {
    return inventories.map((inventory) => inventory.product?.uuid)
  }, [inventories])

  const productsWithoutInventory = useMemo(() => {
    return products.filter(
      (product) => !inventoriesProductUuids.includes(product.uuid),
    )
  }, [products, inventoriesProductUuids])

  const selectedMovementInventory = useMemo(() => {
    return inventories.find(
      (inventory) => inventory.uuid === movementForm.inventoryUuid,
    )
  }, [inventories, movementForm.inventoryUuid])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const [inventoryData, summaryData, productData] = await Promise.all([
        getAllInventoriesAdmin(),
        getInventorySummaryAdmin(),
        getProducts(),
      ])

      setInventories(inventoryData)
      setSummary(summaryData)

      const productsList = Array.isArray(productData)
        ? productData
        : productData?.data || []

      setProducts(productsList)
    } catch (error) {
      setErrorMessage(
        getBackendErrorMessage(
          error,
          'NO SE PUDO CARGAR LA INFORMACIÓN DE INVENTARIO.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const runAction = async (action, successText) => {
    try {
      setIsWorking(true)
      setErrorMessage('')
      setSuccessMessage('')

      await action()

      setSuccessMessage(successText)
      await loadData()
    } catch (error) {
      setErrorMessage(
        getBackendErrorMessage(error, 'NO SE PUDO COMPLETAR LA ACCIÓN.'),
      )
    } finally {
      setIsWorking(false)
    }
  }

  const handleInventoryChange = (event) => {
    const { name, value, type, checked } = event.target

    setInventoryForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleMovementChange = (event) => {
    const { name, value } = event.target

    setMovementForm((current) => {
      const updatedForm = {
        ...current,
        [name]: value,
      }

      if (name === 'movementType') {
        updatedForm.reason =
          value === 'IN' ? 'SUPPLIER_PURCHASE' : 'STORE_SALE'
      }

      return updatedForm
    })
  }

  const handleCreateInventory = (event) => {
    event.preventDefault()

    setErrorMessage('')
    setSuccessMessage('')

    if (!inventoryForm.productUuid) {
      setErrorMessage('DEBES SELECCIONAR UN PRODUCTO.')
      return
    }

    runAction(async () => {
      await createInventoryAdmin(inventoryForm)
      setInventoryForm(initialInventoryForm)
    }, 'CONTROL DE INVENTARIO CREADO CORRECTAMENTE.')
  }

  const handleCreateMovement = (event) => {
    event.preventDefault()

    setErrorMessage('')
    setSuccessMessage('')

    if (!movementForm.inventoryUuid) {
      setErrorMessage('DEBES SELECCIONAR UN PRODUCTO CON INVENTARIO.')
      return
    }

    const quantity = Number(movementForm.quantity)
    const currentStock = Number(selectedMovementInventory?.currentStock || 0)

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setErrorMessage('LA CANTIDAD DEL MOVIMIENTO DEBE SER MAYOR A CERO.')
      return
    }

    if (!selectedMovementInventory) {
      setErrorMessage('NO SE ENCONTRÓ EL INVENTARIO SELECCIONADO.')
      return
    }

    if (movementForm.movementType === 'OUT' && quantity > currentStock) {
      setErrorMessage(
        'LA CANTIDAD DE SALIDA NO PUEDE SER MAYOR AL STOCK DISPONIBLE.',
      )
      return
    }

    runAction(async () => {
      await createInventoryMovementAdmin({
        ...movementForm,
        quantity,
      })

      setMovementForm({
        ...initialMovementForm,
        inventoryUuid: movementForm.inventoryUuid,
      })

      if (selectedInventory?.uuid === movementForm.inventoryUuid) {
        const data = await getInventoryMovementsByInventoryAdmin(
          movementForm.inventoryUuid,
        )

        setMovements(data)
      }
    }, 'MOVIMIENTO DE INVENTARIO REGISTRADO CORRECTAMENTE.')
  }

  const handleSelectInventory = async (inventory) => {
    try {
      setErrorMessage('')
      setSuccessMessage('')
      setSelectedInventory(inventory)
      setMovementForm((current) => ({
        ...current,
        inventoryUuid: inventory.uuid,
      }))

      const data = await getInventoryMovementsByInventoryAdmin(inventory.uuid)
      setMovements(data)
    } catch (error) {
      setErrorMessage(
        getBackendErrorMessage(
          error,
          'NO SE PUDIERON CARGAR LOS MOVIMIENTOS.',
        ),
      )
    }
  }

  const handleDeleteInventory = (inventoryUuid) => {
    const confirmed = window.confirm(
      '¿SEGURO QUE QUIERES ELIMINAR ESTE INVENTARIO? TAMBIÉN SE ELIMINARÁN SUS MOVIMIENTOS.',
    )

    if (!confirmed) return

    runAction(
      () => deleteInventoryAdmin(inventoryUuid),
      'INVENTARIO ELIMINADO CORRECTAMENTE.',
    )
  }

  return (
    <main className="p-6">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-3xl bg-white p-8 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-bold tracking-widest text-green-700">
                PANEL ADMIN
              </p>

              <h1 className="mt-2 text-4xl font-black text-green-900">
                INVENTARIO
              </h1>

              <p className="mt-3 max-w-3xl text-stone-700">
                CONTROLA EL STOCK FÍSICO, REGISTRA ENTRADAS Y SALIDAS, Y
                REVISA ALERTAS DE BAJO STOCK O VENCIMIENTO.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="rounded-full border border-green-800 px-5 py-3 font-black text-green-900 hover:bg-green-50"
            >
              VOLVER AL PANEL
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-5">
          <article className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm font-black text-stone-500">CONTROLADOS</p>
            <p className="mt-2 text-3xl font-black text-green-900">
              {summary.controlledProducts}
            </p>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm font-black text-stone-500">BAJO STOCK</p>
            <p className="mt-2 text-3xl font-black text-amber-700">
              {summary.lowStock}
            </p>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm font-black text-stone-500">POR VENCER</p>
            <p className="mt-2 text-3xl font-black text-amber-700">
              {summary.nearExpiration}
            </p>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm font-black text-stone-500">VENCIDOS</p>
            <p className="mt-2 text-3xl font-black text-red-700">
              {summary.expired}
            </p>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm font-black text-stone-500">MOVIMIENTOS</p>
            <p className="mt-2 text-3xl font-black text-green-900">
              {summary.totalMovements}
            </p>
          </article>
        </section>

        {successMessage && (
          <p
            role="alert"
            className="mt-6 rounded-2xl bg-green-100 p-4 font-bold text-green-800"
          >
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <p
            role="alert"
            className="mt-6 rounded-2xl bg-red-100 p-4 font-bold text-red-700"
          >
            {errorMessage}
          </p>
        )}

        {isLoading && (
          <p className="mt-6 rounded-2xl bg-white p-5 font-semibold text-stone-700 shadow">
            CARGANDO INVENTARIO...
          </p>
        )}

        {!isLoading && (
          <>
            <section className="mt-6 grid gap-6 xl:grid-cols-2">
              <form
                onSubmit={handleCreateInventory}
                className="rounded-3xl bg-white p-6 shadow"
              >
                <h2 className="text-2xl font-black text-green-900">
                  CREAR CONTROL DE INVENTARIO
                </h2>

                <p className="mt-2 text-sm font-semibold text-stone-600">
                  SELECCIONA UN PRODUCTO DEL CATÁLOGO Y ACTIVA SU CONTROL
                  FÍSICO.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="text-sm font-black text-stone-700">
                      PRODUCTO
                    </span>
                    <select
                      name="productUuid"
                      value={inventoryForm.productUuid}
                      onChange={handleInventoryChange}
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    >
                      <option value="">SELECCIONA UN PRODUCTO</option>
                      {productsWithoutInventory.map((product) => (
                        <option key={product.uuid} value={product.uuid}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-sm font-black text-stone-700">
                      STOCK ACTUAL
                    </span>
                    <input
                      type="number"
                      name="currentStock"
                      min="0"
                      value={inventoryForm.currentStock}
                      onChange={handleInventoryChange}
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    />
                  </label>

                  <label>
                    <span className="text-sm font-black text-stone-700">
                      STOCK MÍNIMO
                    </span>
                    <input
                      type="number"
                      name="minimumStock"
                      min="0"
                      value={inventoryForm.minimumStock}
                      onChange={handleInventoryChange}
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    />
                  </label>

                  <label>
                    <span className="text-sm font-black text-stone-700">
                      PROVEEDOR
                    </span>
                    <input
                      type="text"
                      name="supplierName"
                      value={inventoryForm.supplierName}
                      onChange={handleInventoryChange}
                      placeholder="Ej: Distribuidora El Campo"
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    />
                  </label>

                  <label>
                    <span className="text-sm font-black text-stone-700">
                      ÚLTIMO PRECIO COMPRA
                    </span>
                    <input
                      type="number"
                      name="lastPurchasePrice"
                      min="0"
                      value={inventoryForm.lastPurchasePrice}
                      onChange={handleInventoryChange}
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    />
                  </label>

                  <label>
                    <span className="text-sm font-black text-stone-700">
                      FECHA DE VENCIMIENTO
                    </span>
                    <input
                      type="date"
                      name="expirationDate"
                      value={inventoryForm.expirationDate}
                      onChange={handleInventoryChange}
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    />
                  </label>

                  <label>
                    <span className="text-sm font-black text-stone-700">
                      ALERTAR DÍAS ANTES
                    </span>
                    <input
                      type="number"
                      name="expirationAlertDays"
                      min="0"
                      value={inventoryForm.expirationAlertDays}
                      onChange={handleInventoryChange}
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border border-stone-200 p-4">
                    <input
                      type="checkbox"
                      name="isTracked"
                      checked={inventoryForm.isTracked}
                      onChange={handleInventoryChange}
                      className="h-5 w-5"
                    />
                    <span className="font-black text-stone-700">
                      CONTROLAR INVENTARIO
                    </span>
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border border-stone-200 p-4">
                    <input
                      type="checkbox"
                      name="isPerishable"
                      checked={inventoryForm.isPerishable}
                      onChange={handleInventoryChange}
                      className="h-5 w-5"
                    />
                    <span className="font-black text-stone-700">
                      PRODUCTO PERECEDERO
                    </span>
                  </label>

                  <label className="md:col-span-2">
                    <span className="text-sm font-black text-stone-700">
                      NOTAS
                    </span>
                    <textarea
                      name="notes"
                      value={inventoryForm.notes}
                      onChange={handleInventoryChange}
                      rows="3"
                      placeholder="Observaciones internas del inventario."
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isWorking}
                  className="mt-5 w-full rounded-2xl bg-green-800 px-5 py-3 font-black text-white hover:bg-green-900 disabled:bg-stone-400"
                >
                  {isWorking ? 'PROCESANDO...' : 'CREAR INVENTARIO'}
                </button>
              </form>

              <form
                onSubmit={handleCreateMovement}
                className="rounded-3xl bg-white p-6 shadow"
              >
                <h2 className="text-2xl font-black text-green-900">
                  REGISTRAR MOVIMIENTO
                </h2>

                <p className="mt-2 text-sm font-semibold text-stone-600">
                  REGISTRA ENTRADAS, VENTAS, PÉRDIDAS, VENCIMIENTOS O AJUSTES.
                </p>

                {selectedMovementInventory && (
                  <p className="mt-4 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-900">
                    STOCK DISPONIBLE PARA ESTE PRODUCTO:{' '}
                    {selectedMovementInventory.currentStock}{' '}
                    {getUnitLabel(
                      selectedMovementInventory.product?.unitMeasure,
                    )}
                  </p>
                )}

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="text-sm font-black text-stone-700">
                      PRODUCTO EN INVENTARIO
                    </span>
                    <select
                      name="inventoryUuid"
                      value={movementForm.inventoryUuid}
                      onChange={handleMovementChange}
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    >
                      <option value="">SELECCIONA UN INVENTARIO</option>
                      {inventories.map((inventory) => (
                        <option key={inventory.uuid} value={inventory.uuid}>
                          {inventory.product?.name} - STOCK:{' '}
                          {inventory.currentStock}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-sm font-black text-stone-700">
                      TIPO
                    </span>
                    <select
                      name="movementType"
                      value={movementForm.movementType}
                      onChange={handleMovementChange}
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    >
                      <option value="IN">ENTRADA</option>
                      <option value="OUT">SALIDA</option>
                    </select>
                  </label>

                  <label>
                    <span className="text-sm font-black text-stone-700">
                      MOTIVO
                    </span>
                    <select
                      name="reason"
                      value={movementForm.reason}
                      onChange={handleMovementChange}
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    >
                      {movementReasons[movementForm.movementType].map(
                        (reason) => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label>
                    <span className="text-sm font-black text-stone-700">
                      CANTIDAD
                    </span>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={movementForm.quantity}
                      onChange={handleMovementChange}
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    />
                  </label>

                  <label>
                    <span className="text-sm font-black text-stone-700">
                      PRECIO COMPRA
                    </span>
                    <input
                      type="number"
                      name="purchasePrice"
                      min="0"
                      value={movementForm.purchasePrice}
                      onChange={handleMovementChange}
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    />
                  </label>

                  <label>
                    <span className="text-sm font-black text-stone-700">
                      PROVEEDOR
                    </span>
                    <input
                      type="text"
                      name="supplierName"
                      value={movementForm.supplierName}
                      onChange={handleMovementChange}
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    />
                  </label>

                  <label>
                    <span className="text-sm font-black text-stone-700">
                      VENCIMIENTO
                    </span>
                    <input
                      type="date"
                      name="expirationDate"
                      value={movementForm.expirationDate}
                      onChange={handleMovementChange}
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <span className="text-sm font-black text-stone-700">
                      REFERENCIA PEDIDO ONLINE
                    </span>
                    <input
                      type="text"
                      name="orderUuid"
                      value={movementForm.orderUuid}
                      onChange={handleMovementChange}
                      placeholder="Opcional"
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <span className="text-sm font-black text-stone-700">
                      NOTAS
                    </span>
                    <textarea
                      name="notes"
                      value={movementForm.notes}
                      onChange={handleMovementChange}
                      rows="3"
                      placeholder="Ej: salida para cubrir pedidos programados."
                      className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isWorking}
                  className="mt-5 w-full rounded-2xl bg-green-800 px-5 py-3 font-black text-white hover:bg-green-900 disabled:bg-stone-400"
                >
                  {isWorking ? 'PROCESANDO...' : 'REGISTRAR MOVIMIENTO'}
                </button>
              </form>
            </section>

            <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow">
              <div className="flex flex-col gap-2 border-b border-stone-100 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-green-900">
                    INVENTARIO FÍSICO
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-stone-600">
                    REVISA STOCK, ALERTAS Y MOVIMIENTOS POR PRODUCTO.
                  </p>
                </div>

                <p className="font-black text-green-900">
                  {inventories.length} PRODUCTOS CONTROLADOS
                </p>
              </div>

              {inventories.length === 0 ? (
                <section className="p-8 text-center">
                  <h3 className="text-2xl font-black text-green-900">
                    AÚN NO HAY INVENTARIO
                  </h3>
                  <p className="mt-3 text-stone-700">
                    CREA EL CONTROL DE INVENTARIO PARA LOS PRODUCTOS QUE QUIERAS
                    MANEJAR FÍSICAMENTE.
                  </p>
                </section>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1150px] text-left">
                    <thead className="bg-green-50 text-sm text-green-950">
                      <tr>
                        <th className="px-5 py-4 font-black">PRODUCTO</th>
                        <th className="px-5 py-4 font-black">STOCK</th>
                        <th className="px-5 py-4 font-black">MÍNIMO</th>
                        <th className="px-5 py-4 font-black">UNIDAD</th>
                        <th className="px-5 py-4 font-black">VENCIMIENTO</th>
                        <th className="px-5 py-4 font-black">ESTADO</th>
                        <th className="px-5 py-4 font-black">PROVEEDOR</th>
                        <th className="px-5 py-4 font-black">ACCIONES</th>
                      </tr>
                    </thead>

                    <tbody>
                      {inventories.map((inventory) => (
                        <tr
                          key={inventory.uuid}
                          className="border-b border-stone-100 align-top"
                        >
                          <td className="px-5 py-5">
                            <p className="font-black text-green-950">
                              {inventory.product?.name || 'SIN PRODUCTO'}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-stone-500">
                              {inventory.product?.category?.name ||
                                'SIN CATEGORÍA'}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-2xl font-black text-green-900">
                              {inventory.currentStock}
                            </p>
                          </td>

                          <td className="px-5 py-5 font-bold text-stone-700">
                            {inventory.minimumStock}
                          </td>

                          <td className="px-5 py-5 font-bold text-stone-700">
                            {getUnitLabel(inventory.product?.unitMeasure)}
                          </td>

                          <td className="px-5 py-5 font-bold text-stone-700">
                            {formatDate(inventory.expirationDate)}
                          </td>

                          <td className="px-5 py-5">
                            <span
                              className={getStatusClass(
                                inventory.alerts?.status,
                              )}
                            >
                              {inventory.alerts?.status || 'SIN ESTADO'}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <p className="font-semibold text-stone-700">
                              {inventory.supplierName || 'NO REGISTRADO'}
                            </p>
                            <p className="mt-1 text-xs text-stone-500">
                              Compra:{' '}
                              {inventory.lastPurchasePrice
                                ? formatCurrency(inventory.lastPurchasePrice)
                                : 'NO REGISTRADA'}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex min-w-[260px] flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleSelectInventory(inventory)}
                                className="rounded-full bg-green-800 px-4 py-2 text-xs font-black text-white hover:bg-green-900"
                              >
                                VER MOVIMIENTOS
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setMovementForm((current) => ({
                                    ...current,
                                    inventoryUuid: inventory.uuid,
                                  }))
                                }
                                className="rounded-full border border-green-700 px-4 py-2 text-xs font-black text-green-800 hover:bg-green-50"
                              >
                                USAR EN MOVIMIENTO
                              </button>

                              <button
                                type="button"
                                disabled={isWorking}
                                onClick={() =>
                                  handleDeleteInventory(inventory.uuid)
                                }
                                className="rounded-full border border-red-500 px-4 py-2 text-xs font-black text-red-700 hover:bg-red-50 disabled:border-stone-300 disabled:text-stone-400"
                              >
                                ELIMINAR
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {selectedInventory && (
              <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow">
                <div className="border-b border-stone-100 p-6">
                  <h2 className="text-2xl font-black text-green-900">
                    MOVIMIENTOS DE {selectedInventory.product?.name}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-stone-600">
                    HISTORIAL DE ENTRADAS Y SALIDAS DEL PRODUCTO.
                  </p>
                </div>

                {movements.length === 0 ? (
                  <p className="p-6 font-semibold text-stone-700">
                    ESTE PRODUCTO AÚN NO TIENE MOVIMIENTOS.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                      <thead className="bg-stone-50 text-sm text-stone-800">
                        <tr>
                          <th className="px-5 py-4 font-black">TIPO</th>
                          <th className="px-5 py-4 font-black">MOTIVO</th>
                          <th className="px-5 py-4 font-black">CANTIDAD</th>
                          <th className="px-5 py-4 font-black">ANTES</th>
                          <th className="px-5 py-4 font-black">DESPUÉS</th>
                          <th className="px-5 py-4 font-black">PROVEEDOR</th>
                          <th className="px-5 py-4 font-black">NOTAS</th>
                        </tr>
                      </thead>

                      <tbody>
                        {movements.map((movement) => (
                          <tr
                            key={movement.uuid}
                            className="border-b border-stone-100"
                          >
                            <td className="px-5 py-5 font-black text-green-900">
                              {getMovementTypeLabel(movement.movementType)}
                            </td>

                            <td className="px-5 py-5 font-semibold text-stone-700">
                              {getReasonLabel(movement.reason)}
                            </td>

                            <td className="px-5 py-5 font-black text-stone-900">
                              {movement.quantity}
                            </td>

                            <td className="px-5 py-5 text-stone-700">
                              {movement.previousStock}
                            </td>

                            <td className="px-5 py-5 text-stone-700">
                              {movement.newStock}
                            </td>

                            <td className="px-5 py-5 text-stone-700">
                              {movement.supplierName || 'NO REGISTRADO'}
                            </td>

                            <td className="px-5 py-5 text-sm text-stone-600">
                              {movement.notes || 'SIN NOTAS'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default AdminInventoryPage