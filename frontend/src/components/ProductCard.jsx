const API_URL = 'http://localhost:3000'

function ProductCard({ product }) {
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
        <p className="text-sm font-semibold text-green-700">
          {product.category?.name}
        </p>

        <h3 className="mt-1 text-xl font-bold text-green-900">
          {product.name}
        </h3>

        <p className="mt-2 text-stone-700">
          {product.description}
        </p>

        <p className="mt-4 text-lg font-bold text-green-800">
          ${product.price}
        </p>

        <p className="mt-2 text-sm font-semibold text-stone-500">
          STOCK: {product.stock}
        </p>
      </div>
    </article>
  )
}

export default ProductCard