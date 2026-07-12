import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addProductToCart } from '../api/cartDetailsService'
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

const getAvailabilityLabel = (availabilityType) => {
  const availability = {
    daily: 'DISPONIBLE HOY',
    scheduled: 'BAJO PEDIDO',
  }

  return availability[availabilityType] || 'DISPONIBLE'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function ProductCard({ product }) {
  const navigate = useNavigate()

  const [isAdding, setIsAdding] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

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

      setErrorMessage(backendMessage)
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

    if (product.availabilityType === 'scheduled') {
      return 'PEDIR'
    }

    return 'COMPRAR'
  }

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow">
      {product.images?.[0] && (
        <img
          src={`${API_URL}${product.images[0]}`}
          alt={product.name}
          className="h-44 w-full object-cover"
        />
      )}

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
            {product.category?.name}
          </span>

          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
            {getAvailabilityLabel(product.availabilityType)}
          </span>
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

        <div className="mt-2 flex flex-wrap gap-2 text-sm font-semibold text-stone-600">
          <span>POR: {getUnitLabel(product.unitMeasure)}</span>

          {product.availabilityType === 'daily' && (
            <>
              <span>·</span>
              <span>DISPONIBLES: {product.stock}</span>
            </>
          )}

          {product.availabilityType === 'scheduled' && (
            <>
              <span>·</span>
              <span>SE ENTREGA BAJO PEDIDO</span>
            </>
          )}
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
      </div>
    </article>
  )
}

export default ProductCard