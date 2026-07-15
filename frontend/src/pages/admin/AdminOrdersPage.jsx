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

  return `inline-flex rounded-full px-3 py-1 text-xs font-black ${classes[type] || classes.stone}`
}

const getPaymentBadgeType = (payment) => {
  if (!payment) return 'amber'
  if (payment.status === 'CONFIRMED') return 'green'
  if (payment.status === 'REJECTED' || payment.status === 'CANCELLED') return 'red'
  return 'amber'
}

const getOrderBadgeType = (status) => {
  if (status === 'DELIVERED') return 'green'
  if (status === 'CANCELLED') return 'red'
  if (status === 'CREATED') return 'amber'
  return 'stone'
}

function AdminOrdersPage() {
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const summary = useMemo(() => {
    const totalOrders = orders.length

    const pendingPayments = orders.filter(
      (order) => !order.payment || order.payment.status === 'PENDING',
    ).length

    const scheduledDeliveries = orders.filter(
      (order) => order.fulfillmentType === 'SCHEDULED_DELIVERY',
    ).length

    const pendingDeliveries = orders.filter(
      (order) =>
        order.fulfillmentType === 'SCHEDULED_DELIVERY' &&
        (!order.delivery || order.delivery.status !== 'DELIVERED'),
    ).length

    return {
      totalOrders,
      pendingPayments,
      scheduledDeliveries,
      pendingDeliveries,
    }
  }, [orders])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const data = await getAllOrdersAdmin()
      setOrders(data)
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
          <article className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm font-black text-stone-500">PEDIDOS</p>
            <p className="mt-2 text-3xl font-black text-green-900">
              {summary.totalOrders}
            </p>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm font-black text-stone-500">PAGOS PENDIENTES</p>
            <p className="mt-2 text-3xl font-black text-amber-700">
              {summary.pendingPayments}
            </p>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm font-black text-stone-500">DOMICILIOS</p>
            <p className="mt-2 text-3xl font-black text-green-900">
              {summary.scheduledDeliveries}
            </p>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm font-black text-stone-500">POR ENTREGAR</p>
            <p className="mt-2 text-3xl font-black text-green-900">
              {summary.pendingDeliveries}
            </p>
          </article>
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
            <div className="flex flex-col gap-2 border-b border-stone-100 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black text-green-900">
                  LISTADO DE PEDIDOS
                </h2>
                <p className="mt-1 text-sm font-semibold text-stone-600">
                  ADMINISTRA EL FLUJO OPERATIVO DE LA RUEDA MARKET.
                </p>
              </div>

              <p className="font-black text-green-900">
                {orders.length} PEDIDOS REGISTRADOS
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-left">
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
                  {orders.map((order) => (
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
                        <div className="flex min-w-[260px] flex-wrap gap-2">
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
          </section>
        )}
      </section>
    </main>
  )
}

export default AdminOrdersPage