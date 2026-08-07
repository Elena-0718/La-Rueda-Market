import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  cancelOrderAdmin,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
} from '../../api/adminOrdersService'
import {
  confirmPaymentAdmin,
  rejectPaymentAdmin,
} from '../../api/adminPaymentsService'
import {
  createDeliveryAdmin,
  updateDeliveryStatusAdmin,
} from '../../api/deliveriesService'

const ORDER_FILTERS = {
  ALL: 'ALL',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  SCHEDULED_DELIVERY: 'SCHEDULED_DELIVERY',
  TO_DELIVER: 'TO_DELIVER',
}

const getFilterLabel = (filter) => {
  const labels = {
    [ORDER_FILTERS.ALL]: 'Todos los pedidos',
    [ORDER_FILTERS.PAYMENT_PENDING]: 'Pagos pendientes',
    [ORDER_FILTERS.SCHEDULED_DELIVERY]: 'Domicilios programados',
    [ORDER_FILTERS.TO_DELIVER]: 'Pedidos por entregar',
  }

  return labels[filter] || 'Todos los pedidos'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

const formatDate = (date) => {
  if (!date) return 'SIN FECHA'

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

const getOrderStatusLabel = (status) => {
  const labels = {
    CREATED: 'PEDIDO CREADO',
    CONFIRMED: 'PEDIDO CONFIRMADO',
    PREPARING: 'PREPARANDO',
    ON_THE_WAY: 'EN CAMINO',
    DELIVERED: 'ENTREGADO',
    CANCELLED: 'CANCELADO',
  }

  return labels[status] || status || 'SIN ESTADO'
}

const getPaymentLabel = (payment) => {
  if (!payment) return 'SIN PAGO'

  const labels = {
    PENDING: 'PAGO PENDIENTE',
    CONFIRMED: 'PAGO CONFIRMADO',
    REJECTED: 'PAGO RECHAZADO',
    CANCELLED: 'PAGO CANCELADO',
  }

  return labels[payment.status] || payment.status || 'SIN ESTADO'
}

const getPaymentMethodLabel = (method) => {
  const labels = {
    CASH: 'EFECTIVO / CONTRAENTREGA',
    TRANSFER: 'TRANSFERENCIA / NEQUI',
  }

  return labels[method] || method || 'NO DEFINIDO'
}

const getFulfillmentLabel = (fulfillmentType) => {
  const labels = {
    PICKUP: 'RECOGER EN TIENDA',
    SCHEDULED_DELIVERY: 'DOMICILIO PROGRAMADO',
  }

  return labels[fulfillmentType] || 'NO DEFINIDO'
}

const getDeliveryStatusLabel = (delivery) => {
  if (!delivery) return 'DOMICILIO SIN CREAR'

  const labels = {
    PENDING: 'DOMICILIO PENDIENTE',
    PREPARING: 'PREPARANDO DOMICILIO',
    ON_THE_WAY: 'DOMICILIO EN CAMINO',
    DELIVERED: 'DOMICILIO ENTREGADO',
    CANCELLED: 'DOMICILIO CANCELADO',
  }

  return labels[delivery.status] || delivery.status || 'SIN ESTADO'
}

const getDeliveryLabel = (order) => {
  if (order.fulfillmentType === 'PICKUP') {
    return 'NO REQUIERE DOMICILIO'
  }

  if (order.fulfillmentType === 'SCHEDULED_DELIVERY') {
    return getDeliveryStatusLabel(order.delivery)
  }

  return 'NO DEFINIDO'
}

const getBadgeClass = (type) => {
  const classes = {
    green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-700',
    stone: 'bg-stone-100 text-stone-700',
  }

  return `inline-flex rounded-full px-3 py-1 text-xs font-black ${
    classes[type] || classes.stone
  }`
}

const getPaymentBadgeType = (payment) => {
  if (!payment) return 'amber'
  if (payment.status === 'CONFIRMED') return 'green'
  if (payment.status === 'REJECTED' || payment.status === 'CANCELLED') {
    return 'red'
  }
  return 'amber'
}

const getOrderBadgeType = (status) => {
  if (status === 'DELIVERED') return 'green'
  if (status === 'CANCELLED') return 'red'
  if (status === 'CREATED') return 'amber'
  return 'stone'
}

const getSummaryCardClass = (isActive) => {
  if (isActive) {
    return 'rounded-3xl border-2 border-green-800 bg-green-50 p-5 text-left shadow cursor-pointer'
  }

  return 'rounded-3xl border-2 border-transparent bg-white p-5 text-left shadow cursor-pointer hover:border-green-200 hover:bg-green-50'
}

const getOrderDetails = (order) => {
  if (!order) return []

  if (Array.isArray(order.details)) return order.details
  if (Array.isArray(order.orderDetails)) return order.orderDetails
  if (Array.isArray(order.items)) return order.items

  return []
}

const getDetailProductName = (detail) => {
  return (
    detail?.product?.name ||
    detail?.productName ||
    detail?.name ||
    'PRODUCTO SIN NOMBRE'
  )
}

const getDetailProductDescription = (detail) => {
  return detail?.product?.description || detail?.description || ''
}

const getDetailQuantity = (detail) => {
  return Number(detail?.quantity || detail?.amount || 0)
}

const getDetailUnitPrice = (detail) => {
  return Number(
    detail?.unitPrice ||
      detail?.price ||
      detail?.productPrice ||
      detail?.salePrice ||
      detail?.product?.price ||
      0,
  )
}

const getDetailSubtotal = (detail) => {
  const backendSubtotal =
    detail?.subtotal ||
    detail?.lineTotal ||
    detail?.total ||
    detail?.totalPrice

  if (backendSubtotal !== undefined && backendSubtotal !== null) {
    return Number(backendSubtotal || 0)
  }

  return getDetailQuantity(detail) * getDetailUnitPrice(detail)
}

function AdminOrdersPage() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [activeFilter, setActiveFilter] = useState(ORDER_FILTERS.ALL)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const selectedOrderDetails = useMemo(() => {
    return getOrderDetails(selectedOrder)
  }, [selectedOrder])

  const selectedOrderProductsTotal = useMemo(() => {
    return selectedOrderDetails.reduce(
      (total, detail) => total + getDetailSubtotal(detail),
      0,
    )
  }, [selectedOrderDetails])

  const summary = useMemo(() => {
    const totalOrders = orders.length

    const pendingPayments = orders.filter(
      (order) => !order.payment || order.payment.status === 'PENDING',
    ).length

    const scheduledDeliveries = orders.filter(
      (order) => order.fulfillmentType === 'SCHEDULED_DELIVERY',
    ).length

    const pendingDeliveries = orders.filter((order) => {
      if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
        return false
      }

      if (order.fulfillmentType === 'PICKUP') {
        return true
      }

      return (
        order.fulfillmentType === 'SCHEDULED_DELIVERY' &&
        (!order.delivery || order.delivery.status !== 'DELIVERED')
      )
    }).length

    return {
      totalOrders,
      pendingPayments,
      scheduledDeliveries,
      pendingDeliveries,
    }
  }, [orders])

  const filteredOrders = useMemo(() => {
    if (activeFilter === ORDER_FILTERS.ALL) {
      return orders
    }

    if (activeFilter === ORDER_FILTERS.PAYMENT_PENDING) {
      return orders.filter(
        (order) => !order.payment || order.payment.status === 'PENDING',
      )
    }

    if (activeFilter === ORDER_FILTERS.SCHEDULED_DELIVERY) {
      return orders.filter(
        (order) => order.fulfillmentType === 'SCHEDULED_DELIVERY',
      )
    }

    if (activeFilter === ORDER_FILTERS.TO_DELIVER) {
      return orders.filter((order) => {
        if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
          return false
        }

        if (order.fulfillmentType === 'PICKUP') {
          return true
        }

        return (
          order.fulfillmentType === 'SCHEDULED_DELIVERY' &&
          (!order.delivery || order.delivery.status !== 'DELIVERED')
        )
      })
    }

    return orders
  }, [orders, activeFilter])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const data = await getAllOrdersAdmin()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        'NO SE PUDIERON CARGAR LOS PEDIDOS.'

      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage.join(' ')
          : backendMessage,
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const runAction = async (action, successText) => {
    try {
      setIsWorking(true)
      setErrorMessage('')
      setSuccessMessage('')

      await action()

      setSuccessMessage(successText)
      await loadOrders()
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        'NO SE PUDO COMPLETAR LA ACCIÓN.'

      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage.join(' ')
          : backendMessage,
      )
    } finally {
      setIsWorking(false)
    }
  }

  const handleConfirmPayment = (order) => {
    runAction(async () => {
      await confirmPaymentAdmin(order.payment.uuid)

      if (
        order.fulfillmentType === 'SCHEDULED_DELIVERY' &&
        !order.delivery
      ) {
        await createDeliveryAdmin({
          orderUuid: order.uuid,
          assignedTo: '',
          deliveryNotes:
            order.deliveryNotes ||
            'DOMICILIO PROGRAMADO SEGÚN RUTA DISPONIBLE.',
        })
      }
    }, 'PAGO CONFIRMADO. SI APLICA, EL DOMICILIO PROGRAMADO FUE CREADO.')
  }

  const handleRejectPayment = (paymentUuid) => {
    const confirmed = window.confirm('¿SEGURO QUE QUIERES RECHAZAR ESTE PAGO?')

    if (!confirmed) return

    runAction(
      () => rejectPaymentAdmin(paymentUuid),
      'PAGO RECHAZADO CORRECTAMENTE.',
    )
  }

  const handleCreateDelivery = (order) => {
    const assignedTo = window.prompt(
      '¿QUIÉN REALIZARÁ EL DOMICILIO? PUEDES DEJARLO EN BLANCO.',
      '',
    )

    if (assignedTo === null) return

    runAction(
      () =>
        createDeliveryAdmin({
          orderUuid: order.uuid,
          assignedTo,
          deliveryNotes:
            order.deliveryNotes ||
            'DOMICILIO PROGRAMADO SEGÚN RUTA DISPONIBLE.',
        }),
      'DOMICILIO CREADO CORRECTAMENTE.',
    )
  }

  const handleUpdateOrderStatus = (orderUuid, status) => {
    runAction(
      () => updateOrderStatusAdmin({ orderUuid, status }),
      `PEDIDO ACTUALIZADO A ${getOrderStatusLabel(status)}.`,
    )
  }

  const handleUpdateDeliveryStatus = (deliveryUuid, status) => {
    runAction(
      () => updateDeliveryStatusAdmin({ deliveryUuid, status }),
      `DOMICILIO ACTUALIZADO A ${getDeliveryStatusLabel({ status })}.`,
    )
  }

  const handleCancelOrder = (orderUuid) => {
    const confirmed = window.confirm('¿SEGURO QUE QUIERES CANCELAR ESTE PEDIDO?')

    if (!confirmed) return

    runAction(
      () => cancelOrderAdmin(orderUuid),
      'PEDIDO CANCELADO CORRECTAMENTE.',
    )
  }

  const canCreateDelivery = (order) => {
    return (
      order.fulfillmentType === 'SCHEDULED_DELIVERY' &&
      !order.delivery &&
      ['CONFIRMED', 'PREPARING', 'ON_THE_WAY'].includes(order.status)
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
                ADMINISTRAR PEDIDOS
              </h1>

              <p className="mt-3 text-stone-700">
                REVISA PEDIDOS, CONFIRMA PAGOS Y GESTIONA DOMICILIOS PROGRAMADOS.
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

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <button
            type="button"
            onClick={() => setActiveFilter(ORDER_FILTERS.ALL)}
            className={getSummaryCardClass(activeFilter === ORDER_FILTERS.ALL)}
          >
            <p className="text-sm font-black text-stone-500">PEDIDOS</p>
            <p className="mt-2 text-3xl font-black text-green-900">
              {summary.totalOrders}
            </p>
            <p className="mt-2 text-xs font-bold text-stone-500">
              VER TODOS
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter(ORDER_FILTERS.PAYMENT_PENDING)}
            className={getSummaryCardClass(
              activeFilter === ORDER_FILTERS.PAYMENT_PENDING,
            )}
          >
            <p className="text-sm font-black text-stone-500">PAGOS PENDIENTES</p>
            <p className="mt-2 text-3xl font-black text-amber-700">
              {summary.pendingPayments}
            </p>
            <p className="mt-2 text-xs font-bold text-stone-500">
              FILTRAR
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter(ORDER_FILTERS.SCHEDULED_DELIVERY)}
            className={getSummaryCardClass(
              activeFilter === ORDER_FILTERS.SCHEDULED_DELIVERY,
            )}
          >
            <p className="text-sm font-black text-stone-500">DOMICILIOS</p>
            <p className="mt-2 text-3xl font-black text-green-900">
              {summary.scheduledDeliveries}
            </p>
            <p className="mt-2 text-xs font-bold text-stone-500">
              FILTRAR
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter(ORDER_FILTERS.TO_DELIVER)}
            className={getSummaryCardClass(
              activeFilter === ORDER_FILTERS.TO_DELIVER,
            )}
          >
            <p className="text-sm font-black text-stone-500">POR ENTREGAR</p>
            <p className="mt-2 text-3xl font-black text-green-900">
              {summary.pendingDeliveries}
            </p>
            <p className="mt-2 text-xs font-bold text-stone-500">
              FILTRAR
            </p>
          </button>
        </section>

        {successMessage && (
          <p className="mt-6 rounded-2xl bg-green-100 p-4 font-bold text-green-800">
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <p className="mt-6 rounded-2xl bg-red-100 p-4 font-bold text-red-700">
            {errorMessage}
          </p>
        )}

        {isLoading && (
          <p className="mt-6 rounded-2xl bg-white p-5 font-semibold text-stone-700 shadow">
            CARGANDO PEDIDOS...
          </p>
        )}

        {!isLoading && orders.length === 0 && (
          <section className="mt-6 rounded-3xl bg-white p-8 text-center shadow">
            <h2 className="text-2xl font-black text-green-900">
              AÚN NO HAY PEDIDOS
            </h2>

            <p className="mt-3 text-stone-700">
              CUANDO LOS CLIENTES FINALICEN COMPRAS, APARECERÁN AQUÍ.
            </p>
          </section>
        )}

        {!isLoading && orders.length > 0 && (
          <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow">
            <div className="flex flex-col gap-3 border-b border-stone-100 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black text-green-900">
                  LISTADO DE PEDIDOS
                </h2>
                <p className="mt-1 text-sm font-semibold text-stone-600">
                  FILTRO ACTIVO: {getFilterLabel(activeFilter)}
                </p>
              </div>

              <div className="flex flex-col gap-2 md:items-end">
                <p className="font-black text-green-900">
                  {filteredOrders.length} DE {orders.length} PEDIDOS
                </p>

                {activeFilter !== ORDER_FILTERS.ALL && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter(ORDER_FILTERS.ALL)}
                    className="rounded-full border border-green-800 px-4 py-2 text-xs font-black text-green-900 hover:bg-green-50"
                  >
                    VER TODOS
                  </button>
                )}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <section className="p-8 text-center">
                <h3 className="text-xl font-black text-green-900">
                  NO HAY PEDIDOS PARA ESTE FILTRO
                </h3>
                <p className="mt-2 text-stone-600">
                  Selecciona otra tarjeta o vuelve a ver todos los pedidos.
                </p>
              </section>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left">
                  <thead className="bg-green-50 text-sm text-green-950">
                    <tr>
                      <th className="px-5 py-4 font-black">PEDIDO</th>
                      <th className="px-5 py-4 font-black">CLIENTE</th>
                      <th className="px-5 py-4 font-black">ENTREGA</th>
                      <th className="px-5 py-4 font-black">PAGO</th>
                      <th className="px-5 py-4 font-black">ESTADO</th>
                      <th className="px-5 py-4 font-black">TOTAL</th>
                      <th className="px-5 py-4 font-black">ACCIONES</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.uuid}
                        className="border-b border-stone-100 align-top"
                      >
                        <td className="px-5 py-5">
                          <p className="font-black text-green-900">
                            #{order.uuid.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-stone-500">
                            {formatDate(order.createdAt)}
                          </p>
                          <p className="mt-2 text-xs text-stone-600">
                            {order.shippingAddress || 'SIN REFERENCIA'}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-black text-green-950">
                            {order.user?.fullName ||
                              order.user?.name ||
                              'SIN NOMBRE'}
                          </p>
                          <p className="mt-1 text-sm text-stone-600">
                            {order.shippingPhone ||
                              order.user?.phone ||
                              'NO REGISTRADO'}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-black text-green-900">
                            {getFulfillmentLabel(order.fulfillmentType)}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-stone-600">
                            {getDeliveryLabel(order)}
                          </p>
                          <p className="mt-1 text-sm text-stone-600">
                            Domicilio: {formatCurrency(order.deliveryCost)}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <span className={getBadgeClass(getPaymentBadgeType(order.payment))}>
                            {getPaymentLabel(order.payment)}
                          </span>

                          {order.payment && (
                            <div className="mt-3 space-y-1 text-xs text-stone-600">
                              <p>
                                <span className="font-bold">Método: </span>
                                {getPaymentMethodLabel(order.payment.method)}
                              </p>
                              <p>
                                <span className="font-bold">Ref: </span>
                                {order.payment.reference || 'SIN REFERENCIA'}
                              </p>
                              <p>
                                <span className="font-bold">Notas: </span>
                                {order.payment.paymentNotes || 'SIN NOTAS'}
                              </p>
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <span className={getBadgeClass(getOrderBadgeType(order.status))}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-xl font-black text-green-900">
                            {formatCurrency(order.total)}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex min-w-[280px] flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={isWorking}
                              onClick={() => setSelectedOrder(order)}
                              className="rounded-full border border-green-800 px-4 py-2 text-xs font-black text-green-900 hover:bg-green-50 disabled:border-stone-300 disabled:text-stone-400"
                            >
                              VER DETALLE
                            </button>

                            {order.payment?.status === 'PENDING' && (
                              <>
                                <button
                                  type="button"
                                  disabled={isWorking}
                                  onClick={() => handleConfirmPayment(order)}
                                  className="rounded-full bg-green-800 px-4 py-2 text-xs font-black text-white hover:bg-green-900 disabled:bg-stone-400"
                                >
                                  CONFIRMAR PAGO
                                </button>

                                <button
                                  type="button"
                                  disabled={isWorking}
                                  onClick={() => handleRejectPayment(order.payment.uuid)}
                                  className="rounded-full border border-red-500 px-4 py-2 text-xs font-black text-red-700 hover:bg-red-50 disabled:border-stone-300 disabled:text-stone-400"
                                >
                                  RECHAZAR
                                </button>
                              </>
                            )}

                            {!order.payment && (
                              <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-black text-amber-800">
                                ESPERANDO PAGO
                              </span>
                            )}

                            {order.fulfillmentType === 'PICKUP' &&
                              order.status !== 'DELIVERED' &&
                              order.status !== 'CANCELLED' && (
                                <>
                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() =>
                                      handleUpdateOrderStatus(order.uuid, 'PREPARING')
                                    }
                                    className="rounded-full border border-green-700 px-4 py-2 text-xs font-black text-green-800 hover:bg-green-50 disabled:border-stone-300 disabled:text-stone-400"
                                  >
                                    PREPARAR
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() =>
                                      handleUpdateOrderStatus(order.uuid, 'DELIVERED')
                                    }
                                    className="rounded-full bg-green-800 px-4 py-2 text-xs font-black text-white hover:bg-green-900 disabled:bg-stone-400"
                                  >
                                    ENTREGADO
                                  </button>
                                </>
                              )}

                            {canCreateDelivery(order) && (
                              <button
                                type="button"
                                disabled={isWorking}
                                onClick={() => handleCreateDelivery(order)}
                                className="rounded-full bg-green-800 px-4 py-2 text-xs font-black text-white hover:bg-green-900 disabled:bg-stone-400"
                              >
                                CREAR DOMICILIO
                              </button>
                            )}

                            {order.fulfillmentType === 'SCHEDULED_DELIVERY' &&
                              !order.delivery &&
                              !canCreateDelivery(order) && (
                                <span className="rounded-full bg-stone-100 px-4 py-2 text-xs font-black text-stone-600">
                                  DOMICILIO AL CONFIRMAR PAGO
                                </span>
                              )}

                            {order.delivery &&
                              order.delivery.status !== 'DELIVERED' &&
                              order.delivery.status !== 'CANCELLED' && (
                                <>
                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() =>
                                      handleUpdateDeliveryStatus(
                                        order.delivery.uuid,
                                        'PREPARING',
                                      )
                                    }
                                    className="rounded-full border border-green-700 px-4 py-2 text-xs font-black text-green-800 hover:bg-green-50 disabled:border-stone-300 disabled:text-stone-400"
                                  >
                                    PREPARANDO
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() =>
                                      handleUpdateDeliveryStatus(
                                        order.delivery.uuid,
                                        'ON_THE_WAY',
                                      )
                                    }
                                    className="rounded-full border border-green-700 px-4 py-2 text-xs font-black text-green-800 hover:bg-green-50 disabled:border-stone-300 disabled:text-stone-400"
                                  >
                                    EN CAMINO
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() =>
                                      handleUpdateDeliveryStatus(
                                        order.delivery.uuid,
                                        'DELIVERED',
                                      )
                                    }
                                    className="rounded-full bg-green-800 px-4 py-2 text-xs font-black text-white hover:bg-green-900 disabled:bg-stone-400"
                                  >
                                    ENTREGADO
                                  </button>
                                </>
                              )}

                            {order.status !== 'CANCELLED' &&
                              order.status !== 'DELIVERED' && (
                                <button
                                  type="button"
                                  disabled={isWorking}
                                  onClick={() => handleCancelOrder(order.uuid)}
                                  className="rounded-full border border-red-500 px-4 py-2 text-xs font-black text-red-700 hover:bg-red-50 disabled:border-stone-300 disabled:text-stone-400"
                                >
                                  CANCELAR
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </section>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
          <section className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-stone-100 p-6 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-bold tracking-widest text-green-700">
                  DETALLE DEL PEDIDO
                </p>

                <h2 className="mt-2 text-3xl font-black text-green-900">
                  #{selectedOrder.uuid.slice(0, 8).toUpperCase()}
                </h2>

                <p className="mt-2 text-sm font-semibold text-stone-500">
                  Registrado: {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-full border border-green-800 px-5 py-3 text-sm font-black text-green-900 hover:bg-green-50"
              >
                CERRAR
              </button>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-3">
              <div className="rounded-2xl bg-green-50 p-4">
                <p className="text-xs font-black uppercase text-green-700">
                  Cliente
                </p>
                <p className="mt-2 font-black text-green-950">
                  {selectedOrder.user?.fullName ||
                    selectedOrder.user?.name ||
                    'SIN NOMBRE'}
                </p>
                <p className="mt-1 text-sm text-stone-700">
                  {selectedOrder.shippingPhone ||
                    selectedOrder.user?.phone ||
                    'NO REGISTRADO'}
                </p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-black uppercase text-stone-500">
                  Entrega
                </p>
                <p className="mt-2 font-black text-green-950">
                  {getFulfillmentLabel(selectedOrder.fulfillmentType)}
                </p>
                <p className="mt-1 text-sm text-stone-700">
                  {getDeliveryLabel(selectedOrder)}
                </p>
                <p className="mt-1 text-sm text-stone-700">
                  Domicilio: {formatCurrency(selectedOrder.deliveryCost)}
                </p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-black uppercase text-stone-500">
                  Estado
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={getBadgeClass(getOrderBadgeType(selectedOrder.status))}>
                    {getOrderStatusLabel(selectedOrder.status)}
                  </span>
                  <span className={getBadgeClass(getPaymentBadgeType(selectedOrder.payment))}>
                    {getPaymentLabel(selectedOrder.payment)}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="mb-4 rounded-2xl border border-stone-200 bg-white p-4">
                <p className="text-sm font-black uppercase text-green-900">
                  Dirección / referencia
                </p>
                <p className="mt-2 text-sm text-stone-700">
                  {selectedOrder.shippingAddress || 'SIN REFERENCIA REGISTRADA'}
                </p>

                {selectedOrder.deliveryNotes && (
                  <>
                    <p className="mt-4 text-sm font-black uppercase text-green-900">
                      Notas de entrega
                    </p>
                    <p className="mt-2 text-sm text-stone-700">
                      {selectedOrder.deliveryNotes}
                    </p>
                  </>
                )}

                {selectedOrder.payment && (
                  <>
                    <p className="mt-4 text-sm font-black uppercase text-green-900">
                      Pago
                    </p>
                    <div className="mt-2 grid gap-2 text-sm text-stone-700 md:grid-cols-3">
                      <p>
                        <span className="font-bold">Método: </span>
                        {getPaymentMethodLabel(selectedOrder.payment.method)}
                      </p>
                      <p>
                        <span className="font-bold">Referencia: </span>
                        {selectedOrder.payment.reference || 'SIN REFERENCIA'}
                      </p>
                      <p>
                        <span className="font-bold">Notas: </span>
                        {selectedOrder.payment.paymentNotes || 'SIN NOTAS'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-green-50 text-green-950">
                    <tr>
                      <th className="px-4 py-3 font-black">PRODUCTO</th>
                      <th className="px-4 py-3 font-black">DESCRIPCIÓN</th>
                      <th className="px-4 py-3 text-right font-black">CANTIDAD</th>
                      <th className="px-4 py-3 text-right font-black">
                        PRECIO UNITARIO
                      </th>
                      <th className="px-4 py-3 text-right font-black">
                        SUBTOTAL
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedOrderDetails.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-8 text-center font-semibold text-stone-500"
                        >
                          ESTE PEDIDO NO TRAE PRODUCTOS EN LA RESPUESTA DEL BACKEND.
                        </td>
                      </tr>
                    ) : (
                      selectedOrderDetails.map((detail, index) => (
                        <tr
                          key={detail.uuid || `${getDetailProductName(detail)}-${index}`}
                          className="border-t border-stone-100"
                        >
                          <td className="px-4 py-4 font-black text-green-950">
                            {getDetailProductName(detail)}
                          </td>

                          <td className="px-4 py-4 text-stone-600">
                            {getDetailProductDescription(detail) || '-'}
                          </td>

                          <td className="px-4 py-4 text-right font-semibold">
                            {getDetailQuantity(detail)}
                          </td>

                          <td className="px-4 py-4 text-right">
                            {formatCurrency(getDetailUnitPrice(detail))}
                          </td>

                          <td className="px-4 py-4 text-right font-black text-green-900">
                            {formatCurrency(getDetailSubtotal(detail))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                  <tfoot className="bg-stone-50">
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-4 text-right font-black text-stone-700"
                      >
                        Subtotal productos
                      </td>
                      <td className="px-4 py-4 text-right font-black text-green-900">
                        {formatCurrency(selectedOrderProductsTotal)}
                      </td>
                    </tr>

                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-4 text-right font-black text-stone-700"
                      >
                        Domicilio
                      </td>
                      <td className="px-4 py-4 text-right font-black text-green-900">
                        {formatCurrency(selectedOrder.deliveryCost)}
                      </td>
                    </tr>

                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-4 text-right text-lg font-black text-green-950"
                      >
                        Total pedido
                      </td>
                      <td className="px-4 py-4 text-right text-lg font-black text-green-950">
                        {formatCurrency(selectedOrder.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default AdminOrdersPage