import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMyOrderDetails } from '../api/orderDetailsService'
import { getOrderByUuid } from '../api/ordersService'
import { isAuthenticated } from '../features/auth/authStorage'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

const formatDate = (date) => {
  if (!date) {
    return 'SIN FECHA'
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

const getOrderStatusLabel = (status) => {
  const statuses = {
    CREATED: 'PEDIDO CREADO',
    CONFIRMED: 'PEDIDO CONFIRMADO',
    PREPARING: 'PREPARANDO',
    ON_THE_WAY: 'EN CAMINO',
    DELIVERED: 'ENTREGADO',
    CANCELLED: 'CANCELADO',
  }

  return statuses[status] || status || 'SIN ESTADO'
}

const getPaymentLabel = (payment) => {
  if (!payment) {
    return 'SIN PAGO REGISTRADO'
  }

  const statuses = {
    PENDING: 'PAGO PENDIENTE',
    CONFIRMED: 'PAGO CONFIRMADO',
    REJECTED: 'PAGO RECHAZADO',
    CANCELLED: 'PAGO CANCELADO',
  }

  return statuses[payment.status] || payment.status || 'SIN ESTADO'
}

const getDeliveryLabel = (order) => {
  if (order?.fulfillmentType === 'PICKUP') {
    return 'RECOGE EN TIENDA'
  }

  if (order?.fulfillmentType === 'SCHEDULED_DELIVERY') {
    if (!order.delivery) {
      return 'DOMICILIO PROGRAMADO'
    }

    const statuses = {
      PENDING: 'DOMICILIO PENDIENTE',
      PREPARING: 'PREPARANDO DOMICILIO',
      ON_THE_WAY: 'DOMICILIO EN CAMINO',
      DELIVERED: 'ENTREGADO',
      CANCELLED: 'DOMICILIO CANCELADO',
    }

    return statuses[order.delivery.status] || order.delivery.status
  }

  return 'NO DEFINIDO'
}

const getFulfillmentLabel = (fulfillmentType) => {
  const labels = {
    PICKUP: 'RECOGER EN TIENDA',
    SCHEDULED_DELIVERY: 'DOMICILIO PROGRAMADO',
  }

  return labels[fulfillmentType] || 'NO DEFINIDO'
}

function OrderDetailPage() {
  const { uuid } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [orderDetails, setOrderDetails] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login?from=order-detail')
      return
    }

    const loadOrderDetail = async () => {
      try {
        const [orderData, detailsData] = await Promise.all([
          getOrderByUuid(uuid),
          getMyOrderDetails(uuid),
        ])

        setOrder(orderData)
        setOrderDetails(detailsData)
      } catch (error) {
        const backendMessage =
          error.response?.data?.message ||
          'NO SE PUDO CARGAR EL DETALLE DEL PEDIDO.'

        setErrorMessage(
          Array.isArray(backendMessage)
            ? backendMessage.join(' ')
            : backendMessage,
        )

        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrderDetail()
  }, [uuid, navigate])

  if (isLoading) {
    return (
      <main className="p-6">
        <section className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow">
          <p className="font-semibold text-stone-700">
            CARGANDO DETALLE DEL PEDIDO...
          </p>
        </section>
      </main>
    )
  }

  if (errorMessage) {
    return (
      <main className="p-6">
        <section className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow">
          <p className="rounded-2xl bg-red-100 p-4 font-bold text-red-700">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => navigate('/mis-pedidos')}
            className="mt-6 rounded-2xl bg-green-800 px-6 py-3 font-bold text-white hover:bg-green-900"
          >
            VOLVER A MIS PEDIDOS
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="p-6">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-3xl bg-white p-8 shadow">
          <p className="text-sm font-bold tracking-widest text-green-700">
            DETALLE DEL PEDIDO
          </p>

          <h1 className="mt-2 text-4xl font-black text-green-900">
            PEDIDO #{order?.uuid?.slice(0, 8).toUpperCase()}
          </h1>

          <p className="mt-3 text-stone-700">
            FECHA: {formatDate(order?.createdAt)}
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            <section className="rounded-3xl bg-white p-6 shadow">
              <h2 className="text-2xl font-black text-green-900">
                PRODUCTOS DEL PEDIDO
              </h2>

              <div className="mt-5 space-y-4">
                {orderDetails.map((detail) => (
                  <article
                    key={detail.uuid}
                    className="rounded-2xl bg-green-50 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-xl font-black text-green-900">
                          {detail.product?.name}
                        </h3>

                        <p className="mt-1 font-semibold text-stone-600">
                          CANTIDAD: {detail.quantity}
                        </p>

                        <p className="mt-1 font-semibold text-stone-600">
                          PRECIO UNITARIO: {formatCurrency(detail.unitPrice)}
                        </p>
                      </div>

                      <p className="text-2xl font-black text-green-800">
                        {formatCurrency(detail.total)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow">
              <h2 className="text-2xl font-black text-green-900">
                DATOS DE ENTREGA
              </h2>

              <div className="mt-5 space-y-3 text-stone-700">
                <p>
                  <span className="font-bold text-green-900">
                    FORMA DE ENTREGA:{' '}
                  </span>
                  {getFulfillmentLabel(order?.fulfillmentType)}
                </p>

                <p>
                  <span className="font-bold text-green-900">
                    DIRECCIÓN / REFERENCIA:{' '}
                  </span>
                  {order?.shippingAddress || 'NO REGISTRADA'}
                </p>

                <p>
                  <span className="font-bold text-green-900">CELULAR: </span>
                  {order?.shippingPhone || 'NO REGISTRADO'}
                </p>

                <p>
                  <span className="font-bold text-green-900">NOTAS: </span>
                  {order?.deliveryNotes || 'SIN NOTAS'}
                </p>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow">
              <h2 className="text-2xl font-black text-green-900">
                ESTADO DE TU COMPRA
              </h2>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-sm font-bold text-stone-500">
                    PEDIDO
                  </p>

                  <p className="mt-1 font-black text-green-900">
                    {getOrderStatusLabel(order?.status)}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-sm font-bold text-stone-500">
                    PAGO
                  </p>

                  <p className="mt-1 font-black text-green-900">
                    {getPaymentLabel(order?.payment)}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-sm font-bold text-stone-500">
                    ENTREGA
                  </p>

                  <p className="mt-1 font-black text-green-900">
                    {getDeliveryLabel(order)}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-3xl bg-white p-6 shadow">
            <h2 className="text-2xl font-black text-green-900">
              RESUMEN
            </h2>

            <div className="mt-5 space-y-3 text-stone-700">
              <div className="flex justify-between gap-4">
                <span className="font-semibold">SUBTOTAL</span>

                <span className="font-bold">
                  {formatCurrency(order?.subtotal)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="font-semibold">IMPUESTOS</span>

                <span className="font-bold">
                  {formatCurrency(order?.tax)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="font-semibold">
                  {order?.fulfillmentType === 'PICKUP'
                    ? 'RECOGIDA EN TIENDA'
                    : 'DOMICILIO PROGRAMADO'}
                </span>

                <span className="font-bold">
                  {formatCurrency(order?.deliveryCost)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="font-semibold">DESCUENTO</span>

                <span className="font-bold">
                  {formatCurrency(order?.discount)}
                </span>
              </div>

              <div className="border-t border-stone-200 pt-4">
                <div className="flex justify-between gap-4">
                  <span className="text-xl font-black text-green-900">
                    TOTAL
                  </span>

                  <span className="text-xl font-black text-green-900">
                    {formatCurrency(order?.total)}
                  </span>
                </div>
              </div>
            </div>

            {!order?.payment && order?.status !== 'CANCELLED' && (
              <button
                type="button"
                onClick={() => navigate(`/pagar-pedido/${order.uuid}`)}
                className="mt-6 w-full rounded-2xl bg-amber-500 px-5 py-3 font-bold text-white hover:bg-amber-600"
              >
                ELEGIR FORMA DE PAGO
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/mis-pedidos')}
              className="mt-3 w-full rounded-2xl border-2 border-green-800 px-5 py-3 font-bold text-green-900 hover:bg-green-50"
            >
              VOLVER A MIS PEDIDOS
            </button>
          </aside>
        </section>
      </section>
    </main>
  )
}

export default OrderDetailPage