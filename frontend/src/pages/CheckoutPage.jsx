import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getActiveCart } from '../api/cartService'
import { createOrderFromCart } from '../api/ordersService'
import { getMyProfile } from '../api/usersService'

const SCHEDULED_DELIVERY_COST = 2000
const PICKUP_DEFAULT_NOTE = 'CLIENTE RECOGE EN TIENDA.'

function CheckoutPage() {
  const navigate = useNavigate()

  const [cart, setCart] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [formData, setFormData] = useState({
    fulfillmentType: 'SCHEDULED_DELIVERY',
    shippingAddress: '',
    shippingPhone: '',
    deliveryNotes: '',
  })

  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const [cartData, profileData] = await Promise.all([
          getActiveCart(),
          getMyProfile(),
        ])

        const normalizedCart = cartData?.cart || cartData
        const normalizedProfile =
          profileData?.user || profileData?.profile || profileData

        setCart(normalizedCart)

        setFormData((current) => ({
          ...current,
          shippingAddress:
            normalizedProfile?.village ||
            normalizedProfile?.address ||
            '',
          shippingPhone:
            normalizedProfile?.phone ||
            normalizedProfile?.credential?.phone ||
            '',
        }))
      } catch (error) {
        setErrorMessage(
          error?.response?.data?.message ||
            'NO PUDIMOS CARGAR LA INFORMACIÓN DEL PEDIDO.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadCheckoutData()
  }, [])

  const cartSubtotal = Number(cart?.subtotal || 0)
  const cartTax = Number(cart?.tax || 0)
  const cartDiscount = Number(cart?.discount || 0)

  const visualDeliveryCost = useMemo(() => {
    if (formData.fulfillmentType === 'PICKUP') {
      return 0
    }

    return SCHEDULED_DELIVERY_COST
  }, [formData.fulfillmentType])

  const visualTotal = useMemo(() => {
    return cartSubtotal + cartTax + visualDeliveryCost - cartDiscount
  }, [cartSubtotal, cartTax, cartDiscount, visualDeliveryCost])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(Number(value || 0))
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleFulfillmentTypeChange = (fulfillmentType) => {
    setFormData((current) => {
      let deliveryNotes = current.deliveryNotes

      if (fulfillmentType === 'PICKUP') {
        deliveryNotes = PICKUP_DEFAULT_NOTE
      }

      if (
        fulfillmentType === 'SCHEDULED_DELIVERY' &&
        current.deliveryNotes === PICKUP_DEFAULT_NOTE
      ) {
        deliveryNotes = ''
      }

      return {
        ...current,
        fulfillmentType,
        deliveryNotes,
      }
    })
  }

  const validateForm = () => {
    if (!formData.fulfillmentType) {
      return 'DEBES ELEGIR CÓMO QUIERES RECIBIR TU PEDIDO.'
    }

    if (!formData.shippingPhone.trim()) {
      return 'DEBES CONFIRMAR UN CELULAR DE CONTACTO.'
    }

    if (
      formData.fulfillmentType === 'SCHEDULED_DELIVERY' &&
      !formData.shippingAddress.trim()
    ) {
      return 'PARA DOMICILIO PROGRAMADO DEBES CONFIRMAR TU DIRECCIÓN, VEREDA O REFERENCIA.'
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

      const response = await createOrderFromCart({
        fulfillmentType: formData.fulfillmentType,
        shippingAddress: formData.shippingAddress.trim(),
        shippingPhone: formData.shippingPhone.trim(),
        deliveryNotes: formData.deliveryNotes.trim(),
      })

      const createdOrder = response?.order || response

      setSuccessMessage('PEDIDO CREADO CORRECTAMENTE.')

      setTimeout(() => {
        navigate(`/mis-pedidos/${createdOrder.uuid}`)
      }, 700)
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          'NO PUDIMOS CREAR EL PEDIDO. REVISA LA INFORMACIÓN E INTENTA DE NUEVO.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="font-bold text-green-900">CARGANDO PEDIDO...</p>
        </div>
      </main>
    )
  }

  if (!cart || !cart.cartDetails || cart.cartDetails.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-green-900">
            TU CARRITO ESTÁ VACÍO
          </h1>
          <p className="mt-3 text-gray-600">
            AGREGA PRODUCTOS ANTES DE FINALIZAR TU PEDIDO.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 rounded-full bg-green-800 px-6 py-3 font-bold text-white hover:bg-green-900"
          >
            VER PRODUCTOS
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
          FINALIZAR PEDIDO
        </h1>
        <p className="mt-2 text-gray-600">
          CONFIRMA CÓMO QUIERES RECIBIR TU MERCADO Y REVISA EL TOTAL ANTES DE CONTINUAR.
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
        className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]"
      >
        <section className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-green-950">
              ¿CÓMO QUIERES RECIBIR TU PEDIDO?
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => handleFulfillmentTypeChange('PICKUP')}
                className={`rounded-3xl border p-5 text-left transition ${
                  formData.fulfillmentType === 'PICKUP'
                    ? 'border-green-800 bg-green-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <span className="block text-lg font-black text-green-950">
                  RECOGER EN TIENDA
                </span>
                <span className="mt-2 block text-sm text-gray-600">
                  SIN COSTO DE ENVÍO.
                </span>
                <span className="mt-4 block text-2xl font-black text-green-800">
                  {formatCurrency(0)}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleFulfillmentTypeChange('SCHEDULED_DELIVERY')
                }
                className={`rounded-3xl border p-5 text-left transition ${
                  formData.fulfillmentType === 'SCHEDULED_DELIVERY'
                    ? 'border-green-800 bg-green-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <span className="block text-lg font-black text-green-950">
                  DOMICILIO PROGRAMADO
                </span>
                <span className="mt-2 block text-sm text-gray-600">
                  ENTREGA SEGÚN PROGRAMACIÓN.
                </span>
                <span className="mt-4 block text-2xl font-black text-green-800">
                  {formatCurrency(SCHEDULED_DELIVERY_COST)}
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-green-950">
              DATOS DE CONTACTO
            </h2>

            {formData.fulfillmentType === 'SCHEDULED_DELIVERY' && (
              <div className="mt-5">
                <label className="block text-sm font-black text-green-950">
                  DIRECCIÓN, VEREDA O REFERENCIA DE ENTREGA
                </label>
                <input
                  type="text"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  placeholder="EJ: VEREDA EL ESPINAL, CASA BLANCA AL LADO DE LA ESCUELA"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-700"
                />
                <p className="mt-2 text-sm text-gray-500">
                  PUEDES AJUSTAR ESTE DATO SOLO PARA ESTE PEDIDO.
                </p>
              </div>
            )}

            {formData.fulfillmentType === 'PICKUP' && (
              <div className="mt-5 rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-900">
                EL PEDIDO QUEDARÁ MARCADO COMO “RECOGE EN TIENDA”.
              </div>
            )}

            <div className="mt-5">
              <label className="block text-sm font-black text-green-950">
                CELULAR DE CONTACTO
              </label>
              <input
                type="text"
                name="shippingPhone"
                value={formData.shippingPhone}
                onChange={handleChange}
                placeholder="EJ: 3186844954"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-700"
              />
            </div>

            <div className="mt-5">
              <label className="block text-sm font-black text-green-950">
                NOTAS PARA LA TIENDA
              </label>
              <textarea
                name="deliveryNotes"
                value={formData.deliveryNotes}
                onChange={handleChange}
                placeholder={
                  formData.fulfillmentType === 'PICKUP'
                    ? 'EJ: PASO A RECOGER EN LA TARDE.'
                    : 'EJ: LLAMAR ANTES DE LLEGAR O DEJAR UNA REFERENCIA ADICIONAL.'
                }
                rows="4"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-700"
              />
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-green-950">
            RESUMEN DEL PEDIDO
          </h2>

          <div className="mt-5 space-y-4">
            {cart.cartDetails.map((detail) => (
              <div
                key={detail.uuid}
                className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4"
              >
                <div>
                  <p className="font-black text-green-950">
                    {detail.product?.name || 'PRODUCTO'}
                  </p>
                  <p className="text-sm text-gray-500">
                    CANTIDAD: {detail.quantity}
                  </p>
                </div>
                <p className="font-black text-green-900">
                  {formatCurrency(detail.total)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t border-gray-100 pt-5">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-gray-600">PRODUCTOS</span>
              <span className="font-black text-green-950">
                {formatCurrency(cartSubtotal)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-semibold text-gray-600">IMPUESTOS</span>
              <span className="font-black text-green-950">
                {formatCurrency(cartTax)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-semibold text-gray-600">DESCUENTOS</span>
              <span className="font-black text-green-950">
                {formatCurrency(cartDiscount)}
              </span>
            </div>

            <div className="flex justify-between rounded-2xl bg-green-50 p-4 text-sm">
              <span className="font-black text-green-950">
                {formData.fulfillmentType === 'PICKUP'
                  ? 'RECOGIDA EN TIENDA'
                  : 'DOMICILIO PROGRAMADO'}
              </span>
              <span className="font-black text-green-800">
                {formatCurrency(visualDeliveryCost)}
              </span>
            </div>

            <div className="flex justify-between border-t border-gray-100 pt-5">
              <span className="text-lg font-black text-green-950">
                TOTAL A PAGAR
              </span>
              <span className="text-2xl font-black text-green-800">
                {formatCurrency(visualTotal)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 w-full rounded-full bg-green-800 px-6 py-4 font-black text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSaving ? 'CREANDO PEDIDO...' : 'CONFIRMAR PEDIDO'}
          </button>

          <p className="mt-4 text-center text-xs font-semibold text-gray-500">
            COSTO TOTAL DE TU PEDIDO INCLUYENDO DOMICILIO.
          </p>
        </aside>
      </form>
    </main>
  )
}

export default CheckoutPage