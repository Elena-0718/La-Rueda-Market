import { useEffect, useMemo, useState } from 'react'
import { getProducts } from '../api/productsService'
import { getCategories } from '../api/categoriesService'
import ProductFilters from '../features/products/ProductFilters'
import ProductList from '../features/products/ProductList'

function HomePage() {
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

        <ProductFilters
          categories={categories}
          searchText={searchText}
          selectedCategory={selectedCategory}
          onSearchChange={setSearchText}
          onCategoryChange={setSelectedCategory}
        />

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

          {!isLoading && !errorMessage && (
            <ProductList products={filteredProducts} />
          )}
        </section>
      </section>
    </main>
  )
}

export default HomePage