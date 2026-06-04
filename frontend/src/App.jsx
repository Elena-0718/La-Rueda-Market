import { useEffect, useState } from 'react'
import { getProducts } from './api/productsService'

function App() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (error) {
        setErrorMessage('NO SE PUDIERON CARGAR LOS PRODUCTOS.')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <p className="text-sm font-semibold tracking-widest text-green-700">
            BIENVENIDO A
          </p>

          <h1 className="mt-2 text-4xl font-bold text-green-900">
            LA RUEDA MARKET
          </h1>

          <p className="mt-4 text-lg text-stone-700">
            TU MERCADO MÁS CERCA
          </p>
        </div>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-green-900">
            PRODUCTOS DISPONIBLES
          </h2>

          {isLoading && (
            <p className="mt-4 text-stone-700">CARGANDO PRODUCTOS...</p>
          )}

          {errorMessage && (
            <p className="mt-4 rounded-2xl bg-red-100 p-4 font-semibold text-red-700">
              {errorMessage}
            </p>
          )}

          {!isLoading && !errorMessage && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
               <article
  key={product.uuid}
  className="overflow-hidden rounded-3xl bg-white shadow"
>
  {product.images?.[0] && (
    <img
      src={`http://localhost:3000${product.images[0]}`}
      alt={product.name}
      className="h-44 w-full object-cover"
    />
  )}

  <div className="p-5">
    <h3 className="text-xl font-bold text-green-900">
      {product.name}
    </h3>

    <p className="mt-2 text-stone-700">
      {product.description}
    </p>

    <p className="mt-4 text-lg font-bold text-green-800">
      ${product.price}
    </p>
  </div>
</article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default App