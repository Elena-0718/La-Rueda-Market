import { useNavigate } from 'react-router-dom'
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

function ProductCard({ product }) {
  const navigate = useNavigate()

  const handleBuyClick = () => {
    if (!isAuthenticated()) {
  navigate('/login?from=buy')
  return
}

    alert('PRONTO PODRÁS FINALIZAR TU PEDIDO.')
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
          ${product.price}
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

        <button
          type="button"
          onClick={handleBuyClick}
          className="mt-5 w-full rounded-2xl bg-green-800 px-5 py-3 text-lg font-bold text-white hover:bg-green-900"
        >
          COMPRAR
        </button>
      </div>
    </article>
  )
}

export default ProductCard