import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearCart, getActiveCart } from '../api/cartService'
import {
  deleteProductFromCart,
  updateCartProductQuantity,
} from '../api/cartDetailsService'
import { isAuthenticated } from '../features/auth/authStorage'

const API_URL = 'http://localhost:3000'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function CartPage() {
  const navigate = useNavigate()

  const [cart, setCart] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [isClearing, setIsClearing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const loadCart = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const data = await getActiveCart()
      setCart(data)
    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        'NO SE PUDO CARGAR EL CARRITO.'

      setErrorMessage(backendMessage)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login?from=cart')
      return
    }

    loadCart()
  }, [navigate])

  const handleIncreaseQuantity = async (detail) => {
    await handleUpdateQuantity(detail, detail.quantity + 1)
  }

  const handleDecreaseQuantity = async (detail) => {
    if (detail.quantity <= 1) {
      return
    }

    await handleUpdateQuantity(detail, detail.quantity - 1)
  }

  const handleUpdateQuantity = async (detail, quantity) => {
    try {
      setSuccessMessage('')
      setErrorMessage('')
      setActionLoadingId(detail.uuid)

      await updateCartProductQuantity({
        detailUuid: detail.uuid,
        quantity,
      })

      await loadCart()
      setSuccessMessage('CANTIDAD ACTUALIZADA CORRECTAMENTE.')
    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        'NO SE PUDO ACTUALIZAR LA CANTIDAD.'

      setErrorMessage(backendMessage)
      console.error(error)
    } finally {
      setActionLoadingId('')
    }
  }

  const handleDeleteProduct = async (detailUuid) => {
    try {
      setSuccessMessage('')
      setErrorMessage('')
      setActionLoadingId(detailUuid)

      await deleteProductFromCart(detailUuid)

      await loadCart()
      setSuccessMessage('PRODUCTO ELIMINADO DEL CARRITO.')
    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        'NO SE PUDO ELIMINAR EL PRODUCTO.'

      setErrorMessage(backendMessage)
      console.error(error)
    } finally {
      setActionLoadingId('')
    }
  }

  const handleClearCart = async () => {
    try {
      setSuccessMessage('')
      setErrorMessage('')
      setIsClearing(true)

      await clearCart()

      await loadCart()
      setSuccessMessage('CARRITO VACIADO CORRECTAMENTE.')
    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        'NO SE PUDO VACIAR EL CARRITO.'

      setErrorMessage(backendMessage)
      console.error(error)
    } finally {
      setIsClearing(false)
    }
  }

  const cartDetails = cart?.cartDetails || []
  const isCartEmpty = !isLoading && cartDetails.length === 0

  return (
    <main className="p-6">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-3xl bg-white p-8 shadow">
          <p className="text-sm font-bold tracking-widest text-green-700">
            TU COMPRA
          </p>

          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-black text-green-900">
                CARRITO
              </h1>

              <p className="mt-2 text-stone-700">
                REVISA LOS PRODUCTOS ANTES DE CREAR TU PEDIDO.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-2xl border-2 border-green-800 px-5 py-3 font-bold text-green-900 hover:bg-green-50"
            >
              SEGUIR COMPRANDO
            </button>
          </div>
        </header>

        {isLoading && (
          <p className="mt-6 rounded-2xl bg-white p-5 font-semibold text-stone-700 shadow">
            CARGANDO CARRITO...
          </p>
        )}

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

        {isCartEmpty && (
          <section className="mt-6 rounded-3xl bg-white p-8 text-center shadow">
            <h2 className="text-2xl font-black text-green-900">
              TU CARRITO ESTÁ VACÍO
            </h2>

            <p className="mt-3 text-stone-700">
              AGREGA PRODUCTOS DEL CATÁLOGO PARA CREAR TU PEDIDO.
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

        {!isLoading && !isCartEmpty && (
          <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.7fr]">
            <div className="space-y-4">
              {cartDetails.map((detail) => {
                const product = detail.product
                const image = product?.images?.[0]
                const isActionLoading = actionLoadingId === detail.uuid

                return (
                  <article
                    key={detail.uuid}
                    className="rounded-3xl bg-white p-5 shadow"
                  >
                    <div className="grid gap-4 md:grid-cols-[120px_1fr]">
                      <div className="h-28 overflow-hidden rounded-2xl bg-green-50">
                        {image ? (
                          <img
                            src={`${API_URL}${image}`}
                            alt={product?.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm font-bold text-green-800">
                            SIN IMAGEN
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h2 className="text-xl font-black text-green-900">
                              {product?.name}
                            </h2>

                            <p className="mt-1 text-sm font-semibold text-stone-600">
                              PRECIO UNITARIO: {formatCurrency(detail.unitPrice)}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-stone-600">
                              IVA: {formatCurrency(detail.taxAmount)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(detail.uuid)}
                            disabled={isActionLoading}
                            className="rounded-2xl bg-red-100 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:bg-stone-200"
                          >
                            ELIMINAR
                          </button>
                        </div>

                        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleDecreaseQuantity(detail)}
                              disabled={isActionLoading || detail.quantity <= 1}
                              className="h-10 w-10 rounded-full bg-stone-100 text-xl font-black text-stone-700 hover:bg-stone-200 disabled:cursor-not-allowed disabled:text-stone-400"
                            >
                              -
                            </button>

                            <span className="min-w-10 text-center text-xl font-black text-green-900">
                              {detail.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleIncreaseQuantity(detail)}
                              disabled={isActionLoading}
                              className="h-10 w-10 rounded-full bg-green-100 text-xl font-black text-green-800 hover:bg-green-200 disabled:cursor-not-allowed disabled:bg-stone-200"
                            >
                              +
                            </button>
                          </div>

                          <p className="text-2xl font-black text-green-800">
                            {formatCurrency(detail.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            <aside className="h-fit rounded-3xl bg-white p-6 shadow">
              <h2 className="text-2xl font-black text-green-900">
                RESUMEN
              </h2>

              <div className="mt-5 space-y-3 text-stone-700">
                <div className="flex justify-between gap-4">
                  <span className="font-semibold">SUBTOTAL</span>
                  <span className="font-bold">
                    {formatCurrency(cart?.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="font-semibold">IMPUESTOS</span>
                  <span className="font-bold">
                    {formatCurrency(cart?.tax)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="font-semibold">DESCUENTO</span>
                  <span className="font-bold">
                    {formatCurrency(cart?.discount)}
                  </span>
                </div>

                <div className="border-t border-stone-200 pt-4">
                  <div className="flex justify-between gap-4">
                    <span className="text-xl font-black text-green-900">
                      TOTAL
                    </span>
                    <span className="text-xl font-black text-green-900">
                      {formatCurrency(cart?.total)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="mt-6 w-full rounded-2xl bg-green-800 px-5 py-3 font-bold text-white hover:bg-green-900"
              >
                SEGUIR COMPRANDO
              </button>

              <button
                type="button"
                onClick={() => alert('EL SIGUIENTE PASO SERÁ CREAR EL PEDIDO.')}
                className="mt-3 w-full rounded-2xl bg-amber-500 px-5 py-3 font-bold text-white hover:bg-amber-600"
              >
                FINALIZAR PEDIDO
              </button>

              <button
                type="button"
                onClick={handleClearCart}
                disabled={isClearing}
                className="mt-3 w-full rounded-2xl border-2 border-red-200 px-5 py-3 font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-stone-100"
              >
                {isClearing ? 'VACIANDO...' : 'VACIAR CARRITO'}
              </button>
            </aside>
          </section>
        )}
      </section>
    </main>
  )
}

export default CartPage