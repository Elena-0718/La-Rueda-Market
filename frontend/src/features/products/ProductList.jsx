import ProductCard from '../../components/ProductCard'

function ProductList({ products }) {
  if (products.length === 0) {
    return (
      <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow">
        <p className="text-xl font-bold text-green-900">
          NO ENCONTRAMOS PRODUCTOS
        </p>

        <p className="mt-2 text-stone-700">
          INTENTA CON OTRO NOMBRE O CAMBIA LA CATEGORÍA.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.uuid} product={product} />
      ))}
    </div>
  )
}

export default ProductList