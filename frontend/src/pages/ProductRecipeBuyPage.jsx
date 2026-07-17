import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { addProductToCart } from '../api/cartDetailsService'
import { axiosClient } from '../api/axiosClient'
import { isAuthenticated } from '../features/auth/authStorage'

const API_URL = 'http://localhost:3000'

const getUnitLabel = (unitMeasure) => {
  const units = {
    unit: 'UNIDAD',
    lb: 'LIBRA',
    bag: 'BOLSA',
    bottle: 'BOTELLA',
  }

  return units[unitMeasure] || unitMeasure?.toUpperCase() || 'UNIDAD'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function ProductRecipeBuyPage() {
  const { uuid } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const fromRecipe = searchParams.get('fromRecipe')

  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const response = await axiosClient.get(`/products/${uuid}`)
        setProduct(response.data)
      } catch (error) {
        const backendMessage =
          error?.response?.data?.message ||
          'NO SE PUDO CARGAR EL PRODUCTO.'

        setErrorMessage(
          Array.isArray(backendMessage)
            ? backendMessage.join(' ')
            : backendMessage,
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [uuid])

  const handleAddToCart = async () => {
    setSuccessMessage('')
    setErrorMessage('')

    if (!isAuthenticated()) {
      navigate('/login?from=buy')
      return
    }

    if (Number(quantity) < 1) {
      setErrorMessage('LA CANTIDAD DEBE SER MAYOR A CERO.')
      return
    }

    try {
      setIsAdding(true)

      await addProductToCart({
        productUuid: product.uuid,
        quantity: Number(quantity),
      })

      setSuccessMessage('PRODUCTO AGREGADO AL CARRITO.')
    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        'NO SE PUDO AGREGAR EL PRODUCTO AL CARRITO.'

      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage.join(' ')
          : backendMessage,
      )
    } finally {
      setIsAdding(false)
    }
  }

  if (isLoading) {
    return (
      <main className="bg-stone-50 px-6 py-8">
        <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow">
          <p className="font-semibold text-stone-700">CARGANDO PRODUCTO...</p>
        </section>
      </main>
    )
  }

  if (errorMessage && !product) {
    return (
      <main className="bg-stone-50 px-6 py-8">
        <section className="mx-auto max-w-4xl rounded-3xl bg-red-100 p-8 shadow">
          <p className="font-bold text-red-700">{errorMessage}</p>
        </section>
      </main>
    )
  }

  if (!product) return null

  return (
    <main className="bg-stone-50 px-6 py-8">
      <section className="mx-auto max-w-4xl">
        {fromRecipe && (
          <Link
            to={`/recetas/${fromRecipe}`}
            className="mb-5 inline-flex rounded-full border border-green-800 px-5 py-3 font-black text-green-900 hover:bg-green-50"
          >
            VOLVER A LA RECETA
          </Link>
        )}

        <article className="grid gap-6 rounded-3xl bg-white p-8 shadow md:grid-cols-2">
          <div>
            {product.images?.[0] ? (
              <img
                src={`${API_URL}${product.images[0]}`}
                alt={product.name}
                className="h-72 w-full rounded-3xl object-cover"
              />
            ) : (
              <div className="flex h-72 items-center justify-center rounded-3xl bg-stone-100 font-bold text-stone-500">
                SIN IMAGEN
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-bold tracking-[0.25em] text-green-700">
              PRODUCTO
            </p>

            <h1 className="mt-2 text-4xl font-black text-green-900">
              {product.name}
            </h1>

            <p className="mt-3 text-stone-700">
              {product.description}
            </p>

            <p className="mt-5 text-3xl font-black text-green-800">
              {formatCurrency(product.price)}
            </p>

            <p className="mt-2 font-bold text-stone-600">
              POR: {getUnitLabel(product.unitMeasure)}
            </p>

            <label className="mt-6 block">
              <span className="text-sm font-black text-stone-700">
                CANTIDAD QUE NECESITAS
              </span>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 text-lg font-bold outline-none focus:border-green-700"
              />
            </label>

            {successMessage && (
              <p className="mt-4 rounded-2xl bg-green-100 p-4 font-bold text-green-800">
                {successMessage}
              </p>
            )}

            {errorMessage && (
              <p className="mt-4 rounded-2xl bg-red-100 p-4 font-bold text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              type="button"
              disabled={isAdding}
              onClick={handleAddToCart}
              className="mt-5 w-full rounded-2xl bg-green-800 px-5 py-3 text-lg font-black text-white hover:bg-green-900 disabled:bg-stone-400"
            >
              {isAdding ? 'AGREGANDO...' : 'AGREGAR AL CARRITO'}
            </button>

            {successMessage && fromRecipe && (
              <Link
                to={`/recetas/${fromRecipe}`}
                className="mt-3 block w-full rounded-2xl border border-green-800 px-5 py-3 text-center font-black text-green-900 hover:bg-green-50"
              >
                SEGUIR CON LA RECETA
              </Link>
            )}

            {successMessage && (
              <Link
                to="/carrito"
                className="mt-3 block w-full rounded-2xl bg-stone-100 px-5 py-3 text-center font-black text-stone-800 hover:bg-stone-200"
              >
                VER CARRITO
              </Link>
            )}
          </div>
        </article>
      </section>
    </main>
  )
}

export default ProductRecipeBuyPage