import { useEffect, useMemo, useState } from 'react'
import { getProducts } from './api/productsService'
import { getCategories } from './api/categoriesService'

const API_URL = 'http://localhost:3000'

function App() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ])

        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        setErrorMessage('NO SE PUDIERON CARGAR LOS PRODUCTOS.')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productName = product.name?.toLowerCase() || ''
      const categoryUuid = product.category?.uuid || ''

      const matchesSearch = productName.includes(searchText.toLowerCase())

      const matchesCategory =
        selectedCategory === 'all' || categoryUuid === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, searchText, selectedCategory])

  return (
    <main className="min-h-screen bg-green-50 p-6">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-3xl bg-white p-8 shadow-lg">
          <p className="text-sm font-semibold tracking-widest text-green-700">
            BIENVENIDO A
          </p>

          <h1 className="mt-2 text-4xl font-bold text-green-900">
            LA RUEDA MARKET
          </h1>

          <p className="mt-4 text-lg text-stone-700">
            TU MERCADO MÁS CERCA
          </p>
        </header>

        <section className="mt-8 rounded-3xl bg-white p-5 shadow">
          <h2 className="text-2xl font-bold text-green-900">
            BUSCAR PRODUCTOS
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="search"
                className="mb-2 block font-semibold text-green-900"
              >
                BUSCAR POR NOMBRE
              </label>

              <input
                id="search"
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="EJEMPLO: ARROZ, JABÓN, TOMATE..."
                className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block font-semibold text-green-900"
              >
                FILTRAR POR CATEGORÍA
              </label>

              <select
                id="category"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
              >
                <option value="all">TODAS LAS CATEGORÍAS</option>

                {categories.map((category) => (
                  <option key={category.uuid} value={category.uuid}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-green-900">
              PRODUCTOS DISPONIBLES
            </h2>

            <p className="font-semibold text-stone-700">
              {filteredProducts.length} PRODUCTOS ENCONTRADOS
            </p>
          </div>

          {isLoading && (
            <p className="mt-4 text-stone-700">CARGANDO PRODUCTOS...</p>
          )}

          {errorMessage && (
            <p className="mt-4 rounded-2xl bg-red-100 p-4 font-semibold text-red-700">
              {errorMessage}
            </p>
          )}

          {!isLoading && !errorMessage && filteredProducts.length === 0 && (
            <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow">
              <p className="text-xl font-bold text-green-900">
                NO ENCONTRAMOS PRODUCTOS
              </p>

              <p className="mt-2 text-stone-700">
                INTENTA CON OTRO NOMBRE O CAMBIA LA CATEGORÍA.
              </p>
            </div>
          )}

          {!isLoading && !errorMessage && filteredProducts.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.uuid}
                  className="overflow-hidden rounded-3xl bg-white shadow"
                >
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
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default App