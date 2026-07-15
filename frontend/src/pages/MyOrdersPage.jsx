import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getMyOrders } from '../api/ordersService'
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
  if (order.fulfillmentType === 'PICKUP') {
    return 'RECOGE EN TIENDA'
  }

  if (order.fulfillmentType === 'SCHEDULED_DELIVERY') {
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

function MyOrdersPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [successMessage] = useState(location.state?.message || '')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login?from=orders')
      return
    }

    const loadOrders = async () => {
      try {
        const data = await getMyOrders()
        setOrders(data)
      } catch (error) {
        const backendMessage =
          error.response?.data?.message ||
          'NO SE PUDIERON CARGAR TUS PEDIDOS.'

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

    loadOrders()
  }, [navigate])

  return (
    <main className="p-6">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-3xl bg-white p-8 shadow">
          <p className="text-sm font-bold tracking-widest text-green-700">
            MI CUENTA
          </p>

          <h1 className="mt-2 text-4xl font-black text-green-900">
            MIS PEDIDOS
          </h1>

          <p className="mt-3 text-stone-700">
            AQUÍ PUEDES VER TUS COMPRAS, EL ESTADO DEL PAGO Y LA FORMA DE ENTREGA.
          </p>
        </header>

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
              AÚN NO TIENES PEDIDOS
            </h2>

            <p className="mt-3 text-stone-700">
              CUANDO FINALICES UNA COMPRA, APARECERÁ AQUÍ.
            </p>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-6 rounded-2xl bg-green-800 px-6 py-3 font-bold text-white hover:bg-green-900"
            >
              VER PRODUCTOS
            </button>
          </section>
        )}

        {!isLoading && orders.length > 0 && (
          <section className="mt-6 grid gap-5">
            {orders.map((order) => (
              <article
                key={order.uuid}
                className="rounded-3xl bg-white p-6 shadow"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-bold tracking-widest text-green-700">
                      PEDIDO
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-green-900">
                      #{order.uuid.slice(0, 8).toUpperCase()}
                    </h2>

                    <p className="mt-2 font-semibold text-stone-600">
                      FECHA: {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-green-50 px-5 py-3 text-center">
                    <p className="text-sm font-bold text-green-700">
                      TOTAL
                    </p>

                    <p className="text-2xl font-black text-green-900">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-sm font-bold text-stone-500">
                      ESTADO DEL PEDIDO
                    </p>

                    <p className="mt-1 font-black text-green-900">
                      {getOrderStatusLabel(order.status)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-stone-50 p-4">
                    <p className="text-sm font-bold text-stone-500">
                      PAGO
                    </p>

                    <p className="mt-1 font-black text-green-900">
                      {getPaymentLabel(order.payment)}
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

                <div className="mt-5 flex flex-col gap-3 md:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate(`/mis-pedidos/${order.uuid}`)}
                    className="rounded-2xl bg-green-800 px-5 py-3 font-bold text-white hover:bg-green-900"
                  >
                    VER DETALLE
                  </button>

                  {!order.payment && order.status !== 'CANCELLED' && (
                    <button
                      type="button"
                      onClick={() => navigate(`/pagar-pedido/${order.uuid}`)}
                      className="rounded-2xl border-2 border-amber-500 px-5 py-3 font-bold text-amber-700 hover:bg-amber-50"
                    >
                      ELEGIR FORMA DE PAGO
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  )
}

export default MyOrdersPage