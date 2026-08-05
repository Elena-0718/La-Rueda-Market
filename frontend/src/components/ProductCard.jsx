import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addProductToCart } from '../api/cartDetailsService'
import { isAuthenticated } from '../features/auth/authStorage'

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

const getProductImage = (product) => {
  const image = product.images?.[0]

  if (!image) {
    return ''
  }

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${image}`
}

function ProductCard({
  product,
  isFavorite = false,
  onToggleFavorite,
}) {
  const navigate = useNavigate()

  const [isAdding, setIsAdding] = useState(false)
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const productImage = getProductImage(product)

  const handleFavoriteClick = async () => {
    setSuccessMessage('')
    setErrorMessage('')

    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    if (!onToggleFavorite) {
      return
    }

    try {
      setIsUpdatingFavorite(true)
      await onToggleFavorite(product.uuid)
    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        'NO SE PUDO ACTUALIZAR EL FAVORITO.'

      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage.join(' ')
          : backendMessage,
      )

      console.error(error)
    } finally {
      setIsUpdatingFavorite(false)
    }
  }

  const handleBuyClick = async () => {
    setSuccessMessage('')
    setErrorMessage('')

    if (!isAuthenticated()) {
      navigate('/login?from=buy')
      return
    }

    try {
      setIsAdding(true)

      await addProductToCart({
        productUuid: product.uuid,
        quantity: 1,
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

      console.error(error)
    } finally {
      setIsAdding(false)
    }
  }

  const getButtonText = () => {
    if (isAdding) {
      return 'AGREGANDO...'
    }

    if (successMessage) {
      return 'AGREGAR OTRO'
    }

    return 'AGREGAR AL CARRITO'
  }

  return (
    <article className="relative overflow-hidden rounded-3xl bg-white shadow">
      <button
        type="button"
        onClick={handleFavoriteClick}
        disabled={isUpdatingFavorite}
        className={`absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 ${
          isFavorite ? 'text-red-600' : 'text-stone-500'
        }`}
        aria-label={
          isFavorite
            ? 'QUITAR DE FAVORITOS'
            : 'AGREGAR A FAVORITOS'
        }
        title={
          isFavorite
            ? 'QUITAR DE FAVORITOS'
            : 'AGREGAR A FAVORITOS'
        }
      >
        {isFavorite ? '♥' : '♡'}
      </button>

      {productImage ? (
        <img
          src={productImage}
          alt={product.name}
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-green-50 text-sm font-bold text-green-800">
          SIN IMAGEN
        </div>
      )}

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
            {product.category?.name}
          </span>

          {isFavorite && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
              FAVORITO
            </span>
          )}
        </div>

        <h3 className="mt-3 text-xl font-bold text-green-900">
          {product.name}
        </h3>

        <p className="mt-2 text-stone-700">
          {product.description}
        </p>

        <p className="mt-4 text-2xl font-black text-green-800">
          {formatCurrency(product.price)}
        </p>

        <div className="mt-2 text-sm font-semibold text-stone-600">
          <span>POR: {getUnitLabel(product.unitMeasure)}</span>
        </div>

        {successMessage && (
          <p className="mt-4 rounded-2xl bg-green-100 p-3 text-sm font-bold text-green-800">
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <p className="mt-4 rounded-2xl bg-red-100 p-3 text-sm font-bold text-red-700">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handleBuyClick}
          disabled={isAdding}
          className="mt-5 w-full rounded-2xl bg-green-800 px-5 py-3 text-lg font-bold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {getButtonText()}
        </button>

        {product.hasRecipes === true && (
          <Link
            to={`/recetas?productUuid=${product.uuid}`}
            className="mt-3 block w-full rounded-2xl border border-green-800 px-5 py-3 text-center text-lg font-bold text-green-900 hover:bg-green-50"
          >
            VER RECETAS
          </Link>
        )}
      </div>
    </article>
  )
}

export default ProductCard