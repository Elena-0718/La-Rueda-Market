import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getOrderByUuid } from '../api/ordersService'
import { createPayment } from '../api/paymentsService'

function PaymentPage() {
  const { uuid } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [formData, setFormData] = useState({
    method: 'CASH',
    reference: '',
    paymentNotes: '',
  })

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const orderData = await getOrderByUuid(uuid)
        setOrder(orderData)
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.message ||
            'NO PUDIMOS CARGAR LA INFORMACIÓN DEL PEDIDO.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [uuid])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(Number(value || 0))
  }

  const fulfillmentLabel = useMemo(() => {
    if (order?.fulfillmentType === 'PICKUP') {
      return 'RECOGER EN TIENDA'
    }

    if (order?.fulfillmentType === 'SCHEDULED_DELIVERY') {
      return 'DOMICILIO PROGRAMADO'
    }

    return 'NO DEFINIDO'
  }, [order?.fulfillmentType])

  const cashLabel = useMemo(() => {
    if (order?.fulfillmentType === 'PICKUP') {
      return 'PAGO AL RECOGER'
    }

    return 'PAGO CONTRAENTREGA'
  }, [order?.fulfillmentType])

  const handleMethodChange = (method) => {
    setFormData((current) => ({
      ...current,
      method,
      reference: method === 'CASH' ? '' : current.reference,
      paymentNotes:
        method === 'CASH'
          ? order?.fulfillmentType === 'PICKUP'
            ? 'CLIENTE PAGARÁ AL RECOGER EL PEDIDO.'
            : 'CLIENTE PAGARÁ CUANDO RECIBA EL PEDIDO.'
          : current.paymentNotes,
    }))
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.method) {
      return 'DEBES ELEGIR UNA FORMA DE PAGO.'
    }

    if (formData.method === 'TRANSFER' && !formData.reference.trim()) {
      return 'PARA TRANSFERENCIA DEBES ESCRIBIR LA REFERENCIA O NÚMERO DEL COMPROBANTE.'
    }

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setIsSaving(true)
      setErrorMessage('')
      setSuccessMessage('')

      const validationError = validateForm()

      if (validationError) {
        setErrorMessage(validationError)
        return
      }

      await createPayment({
        method: formData.method,
        orderUuid: uuid,
        reference: formData.reference,
        paymentNotes: formData.paymentNotes,
      })

      setSuccessMessage('FORMA DE PAGO REGISTRADA CORRECTAMENTE.')

      setTimeout(() => {
        navigate(`/mis-pedidos/${uuid}`)
      }, 800)
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          'NO PUDIMOS REGISTRAR LA FORMA DE PAGO. INTENTA DE NUEVO.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="font-bold text-green-900">CARGANDO PAGO...</p>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-green-900">
            PEDIDO NO ENCONTRADO
          </h1>
          <button
            type="button"
            onClick={() => navigate('/mis-pedidos')}
            className="mt-6 rounded-full bg-green-800 px-6 py-3 font-bold text-white hover:bg-green-900"
          >
            VER MIS PEDIDOS
          </button>
        </div>
      </main>
    )
  }

  if (order.payment) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-green-900">
            ESTE PEDIDO YA TIENE PAGO REGISTRADO
          </h1>
          <p className="mt-3 text-gray-600">
            PUEDES CONSULTAR EL ESTADO DEL PAGO EN EL DETALLE DEL PEDIDO.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/mis-pedidos/${uuid}`)}
            className="mt-6 rounded-full bg-green-800 px-6 py-3 font-bold text-white hover:bg-green-900"
          >
            VER DETALLE DEL PEDIDO
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-bold tracking-[0.25em] text-green-700">
          LA RUEDA MARKET
        </p>
        <h1 className="mt-2 text-3xl font-black text-green-950">
          ELEGIR FORMA DE PAGO
        </h1>
        <p className="mt-2 text-gray-600">
          TU PEDIDO YA FUE CREADO. AHORA ELIGE CÓMO VAS A PAGAR.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-3xl border border-green-200 bg-green-50 px-5 py-4 font-semibold text-green-800">
          {successMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[1.3fr_0.8fr]"
      >
        <section className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-green-950">
              ELIGE CÓMO VAS A PAGAR
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => handleMethodChange('CASH')}
                className={`rounded-3xl border p-5 text-left transition ${
                  formData.method === 'CASH'
                    ? 'border-green-800 bg-green-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <span className="block text-lg font-black text-green-950">
                  {cashLabel}
                </span>
                <span className="mt-2 block text-sm text-gray-600">
                  {order.fulfillmentType === 'PICKUP'
                    ? 'PAGA CUANDO RECOJAS TU PEDIDO.'
                    : 'PAGA CUANDO RECIBAS TU MERCADO.'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleMethodChange('TRANSFER')}
                className={`rounded-3xl border p-5 text-left transition ${
                  formData.method === 'TRANSFER'
                    ? 'border-green-800 bg-green-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <span className="block text-lg font-black text-green-950">
                  TRANSFERENCIA / NEQUI
                </span>
                <span className="mt-2 block text-sm text-gray-600">
                  REGISTRA LA REFERENCIA PARA QUE LA TIENDA CONFIRME EL PAGO.
                </span>
              </button>
            </div>
          </div>

          {formData.method === 'TRANSFER' && (
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-green-950">
                DATOS DE TRANSFERENCIA
              </h2>

              <div className="mt-5 rounded-2xl bg-green-50 p-5 text-green-950">
                <p className="font-black">NEQUI / TRANSFERENCIA</p>
                
                <p className="mt-3 text-sm">
                  NÚMERO: 318 684 4954
                </p>
                <p className="text-sm">
                  TITULAR: LA RUEDA MARKET
                </p>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-black text-green-950">
                  REFERENCIA O NÚMERO DE TELEFONO DE LA TRANSFERENCIA
                </label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="EJ: NEQUI-123456"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-700"
                />
              </div>

              <div className="mt-5">
                <label className="block text-sm font-black text-green-950">
                  NOTAS DEL PAGO
                </label>
                <textarea
                  name="paymentNotes"
                  value={formData.paymentNotes}
                  onChange={handleChange}
                  placeholder="EJ: TRANSFERÍ DESDE EL NÚMERO 318..."
                  rows="4"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-700"
                />
              </div>
            </div>
          )}

          {formData.method === 'CASH' && (
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-green-950">
                CONFIRMACIÓN
              </h2>

              <p className="mt-3 text-gray-600">
                {order.fulfillmentType === 'PICKUP'
                  ? 'EL PEDIDO QUEDARÁ MARCADO PARA PAGAR AL MOMENTO DE RECOGER EN TIENDA.'
                  : 'EL PEDIDO QUEDARÁ MARCADO PARA PAGAR AL MOMENTO DE RECIBIR EL DOMICILIO PROGRAMADO.'}
              </p>

              <div className="mt-5">
                <label className="block text-sm font-black text-green-950">
                  NOTAS DEL PAGO
                </label>
                <textarea
                  name="paymentNotes"
                  value={formData.paymentNotes}
                  onChange={handleChange}
                  placeholder="EJ: PAGARÉ EN EFECTIVO."
                  rows="4"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-700"
                />
              </div>
            </div>
          )}
        </section>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-green-950">
            RESUMEN DEL PEDIDO
          </h2>

          <div className="mt-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-gray-600">PEDIDO</span>
              <span className="font-black text-green-950">
                #{order.uuid.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-semibold text-gray-600">
                FORMA DE ENTREGA
              </span>
              <span className="font-black text-green-950">
                {fulfillmentLabel}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-semibold text-gray-600">PRODUCTOS</span>
              <span className="font-black text-green-950">
                {formatCurrency(order.subtotal)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-semibold text-gray-600">DOMICILIO</span>
              <span className="font-black text-green-950">
                {formatCurrency(order.deliveryCost)}
              </span>
            </div>

            <div className="flex justify-between border-t border-gray-100 pt-5">
              <span className="text-lg font-black text-green-950">
                TOTAL A PAGAR
              </span>
              <span className="text-2xl font-black text-green-800">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 w-full rounded-full bg-green-800 px-6 py-4 font-black text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSaving ? 'REGISTRANDO...' : 'CONFIRMAR FORMA DE PAGO'}
          </button>

          <button
            type="button"
            onClick={() => navigate(`/mis-pedidos/${uuid}`)}
            className="mt-3 w-full rounded-full border border-green-800 px-6 py-4 font-black text-green-900 hover:bg-green-50"
          >
            VER DETALLE DEL PEDIDO
          </button>

          <p className="mt-4 text-center text-xs font-semibold text-gray-500">
            EL PAGO QUEDARÁ PENDIENTE HASTA QUE LA TIENDA LO CONFIRME.
          </p>
        </aside>
      </form>
    </main>
  )
}

export default PaymentPage