import { useEffect, useMemo, useState } from 'react'
import { getCategories } from '../api/categoriesService'
import { getProducts } from '../api/productsService'
import { getAuthUser } from '../features/auth/authStorage'
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

  const authUser = getAuthUser()
  const firstName = authUser?.name?.split(' ')[0]

  return (
    <main className="p-6">
      <section className="mx-auto max-w-6xl">
        <header className="overflow-hidden rounded-3xl bg-white shadow-lg">
  <div className="grid gap-6 p-8 md:grid-cols-[1.4fr_0.8fr] md:items-center">
    <div>
      <p className="text-sm font-semibold tracking-widest text-green-700">
        {firstName ? `HOLA, ${firstName}` : 'BIENVENIDO A'}
      </p>

      <h1 className="mt-2 text-4xl font-black leading-tight text-green-900 md:text-5xl">
        LA RUEDA MARKET
      </h1>

      <p className="mt-4 max-w-2xl text-xl font-semibold text-stone-700">
        {firstName
          ? '¿QUÉ NECESITAS PARA TU HOGAR HOY?'
          : 'MERCADO, ASEO, CARNES Y PAPELERÍA SIN COMPLICARTE.'}
      </p>

      <p className="mt-3 max-w-2xl text-stone-600">
        COMPRA CERCA, FÁCIL Y CON PRODUCTOS PENSADOS PARA TU CASA Y TU VEREDA.
      </p>
    </div>

    <div className="rounded-3xl bg-green-50 p-5">
      <p className="text-sm font-bold text-green-800">
        COMPRA SIMPLE
      </p>

      <ul className="mt-4 space-y-3 text-stone-700">
        <li className="font-semibold">1. MIRA LOS PRODUCTOS</li>
        <li className="font-semibold">2. ELIGE LO QUE NECESITAS</li>
        <li className="font-semibold">3. INICIA SESIÓN PARA COMPRAR</li>
      </ul>
    </div>
  </div>
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