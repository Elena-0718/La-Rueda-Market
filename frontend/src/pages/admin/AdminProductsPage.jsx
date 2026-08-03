import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  activateProduct,
  deactivateProduct,
  getAdminProducts,
} from '../../api/adminProductsService'

const getAvailabilityLabel = (availabilityType) => {
  const availability = {
    daily: 'DISPONIBLE HOY',
    scheduled: 'BAJO PEDIDO',
  }

  return availability[availabilityType] || 'DISPONIBLE'
}

const getUnitLabel = (unitMeasure) => {
  const units = {
    unit: 'UNIDAD',
    lb: 'LIBRA',
    bag: 'BOLSA',
    bottle: 'BOTELLA',
  }

  return units[unitMeasure] || unitMeasure?.toUpperCase() || 'UNIDAD'
}

function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [searchText, setSearchText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [productBeingUpdated, setProductBeingUpdated] = useState(null)

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return products
    }

    return products.filter((product) => {
      const name = product.name?.toLowerCase() || ''
      const description = product.description?.toLowerCase() || ''
      const categoryName = product.category?.name?.toLowerCase() || ''
      const unit = getUnitLabel(product.unitMeasure).toLowerCase()
      const availability = getAvailabilityLabel(
        product.availabilityType,
      ).toLowerCase()
      const status = product.isActive ? 'activo' : 'inactivo'
      const featured = product.isFeatured ? 'destacado' : ''

      return (
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        categoryName.includes(normalizedSearch) ||
        unit.includes(normalizedSearch) ||
        availability.includes(normalizedSearch) ||
        status.includes(normalizedSearch) ||
        featured.includes(normalizedSearch)
      )
    })
  }, [products, searchTerm])

  const loadProducts = async () => {
    try {
      const data = await getAdminProducts()
      setProducts(data)
    } catch (error) {
      console.error(error)
      setErrorMessage('NO SE PUDIERON CARGAR LOS PRODUCTOS.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleSearchProducts = (event) => {
    event.preventDefault()
    setSearchTerm(searchText)
  }

  const handleClearSearch = () => {
    setSearchText('')
    setSearchTerm('')
  }

  const handleDeactivateProduct = async (product) => {
    const confirmDeactivate = window.confirm(
      `¿SEGURO QUE DESEAS DESACTIVAR EL PRODUCTO "${product.name}"?`,
    )

    if (!confirmDeactivate) return

    try {
      setProductBeingUpdated(product.uuid)
      setErrorMessage('')
      setSuccessMessage('')

      await deactivateProduct(product.uuid)

      setProducts((currentProducts) =>
        currentProducts.map((currentProduct) =>
          currentProduct.uuid === product.uuid
            ? { ...currentProduct, isActive: false }
            : currentProduct,
        ),
      )

      setSuccessMessage('PRODUCTO DESACTIVADO CORRECTAMENTE.')
    } catch (error) {
      console.error(error)
      setErrorMessage('NO SE PUDO DESACTIVAR EL PRODUCTO.')
    } finally {
      setProductBeingUpdated(null)
    }
  }

  const handleActivateProduct = async (product) => {
    const confirmActivate = window.confirm(
      `¿SEGURO QUE DESEAS ACTIVAR EL PRODUCTO "${product.name}"?`,
    )

    if (!confirmActivate) return

    try {
      setProductBeingUpdated(product.uuid)
      setErrorMessage('')
      setSuccessMessage('')

      await activateProduct(product.uuid)

      setProducts((currentProducts) =>
        currentProducts.map((currentProduct) =>
          currentProduct.uuid === product.uuid
            ? { ...currentProduct, isActive: true }
            : currentProduct,
        ),
      )

      setSuccessMessage('PRODUCTO ACTIVADO CORRECTAMENTE.')
    } catch (error) {
      console.error(error)
      setErrorMessage('NO SE PUDO ACTIVAR EL PRODUCTO.')
    } finally {
      setProductBeingUpdated(null)
    }
  }

  return (
    <main className="p-6">
      <section className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-green-700">
              ADMINISTRACIÓN
            </p>

            <h1 className="mt-2 text-3xl font-bold text-green-900">
              PRODUCTOS
            </h1>

            <p className="mt-3 text-stone-700">
              GESTIONA PRODUCTOS ACTIVOS E INACTIVOS DEL CATÁLOGO.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/admin/productos/nuevo"
              className="rounded-2xl bg-green-800 px-5 py-3 text-center font-bold text-white hover:bg-green-900"
            >
              NUEVO PRODUCTO
            </Link>

            <Link
              to="/admin"
              className="rounded-2xl border border-green-800 px-5 py-3 text-center font-bold text-green-900 hover:bg-green-100"
            >
              VOLVER AL PANEL
            </Link>
          </div>
        </header>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow">
          {isLoading && (
            <p className="font-semibold text-stone-700">
              CARGANDO PRODUCTOS...
            </p>
          )}

          {errorMessage && (
            <p className="rounded-2xl bg-red-100 p-4 font-semibold text-red-700">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="rounded-2xl bg-green-100 p-4 font-semibold text-green-800">
              {successMessage}
            </p>
          )}

          {!isLoading && !errorMessage && (
            <>
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-green-900">
                    LISTADO DE PRODUCTOS
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-stone-600">
                    {filteredProducts.length} DE {products.length} PRODUCTOS
                    REGISTRADOS
                  </p>

                  {searchTerm && (
                    <p className="mt-1 text-sm font-semibold text-stone-600">
                      BÚSQUEDA: {searchTerm}
                    </p>
                  )}
                </div>

                <form
                  onSubmit={handleSearchProducts}
                  className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto"
                >
                  <input
                    type="text"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Buscar producto, categoría o estado"
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold outline-none focus:border-green-700"
                  />

                  <button
                    type="submit"
                    className="rounded-full bg-green-800 px-4 py-2 text-xs font-black text-white hover:bg-green-900"
                  >
                    BUSCAR
                  </button>

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="rounded-full border border-green-800 px-4 py-2 text-xs font-black text-green-900 hover:bg-green-50"
                    >
                      VER TODOS
                    </button>
                  )}
                </form>
              </div>

              {products.length === 0 ? (
                <section className="rounded-2xl bg-stone-50 p-8 text-center">
                  <h3 className="text-xl font-black text-green-900">
                    AÚN NO HAY PRODUCTOS
                  </h3>
                  <p className="mt-2 text-stone-600">
                    Crea productos para alimentar el catálogo de La Rueda
                    Market.
                  </p>
                </section>
              ) : filteredProducts.length === 0 ? (
                <section className="rounded-2xl bg-stone-50 p-8 text-center">
                  <h3 className="text-xl font-black text-green-900">
                    NO HAY PRODUCTOS PARA ESTA BÚSQUEDA
                  </h3>
                  <p className="mt-2 text-stone-600">
                    Prueba con otro nombre, categoría, disponibilidad o estado.
                  </p>
                </section>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-stone-200 bg-green-50 text-green-900">
                        <th className="p-4">PRODUCTO</th>
                        <th className="p-4">CATEGORÍA</th>
                        <th className="p-4">PRECIO</th>
                        <th className="p-4">UNIDAD</th>
                        <th className="p-4">DISPONIBILIDAD</th>
                        <th className="p-4">STOCK</th>
                        <th className="p-4">ESTADO</th>
                        <th className="p-4">ACCIONES</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr
                          key={product.uuid}
                          className="border-b border-stone-100 hover:bg-stone-50"
                        >
                          <td className="p-4">
                            <div className="font-bold text-green-900">
                              {product.name}
                            </div>

                            <div className="mt-1 line-clamp-2 text-sm text-stone-600">
                              {product.description}
                            </div>
                          </td>

                          <td className="p-4 font-semibold text-stone-700">
                            {product.category?.name || 'SIN CATEGORÍA'}
                          </td>

                          <td className="p-4 font-bold text-green-800">
                            ${product.price}
                          </td>

                          <td className="p-4 text-stone-700">
                            {getUnitLabel(product.unitMeasure)}
                          </td>

                          <td className="p-4">
                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">
                              {getAvailabilityLabel(product.availabilityType)}
                            </span>
                          </td>

                          <td className="p-4 text-stone-700">
                            {product.availabilityType === 'scheduled'
                              ? 'BAJO PEDIDO'
                              : product.stock}
                          </td>

                          <td className="p-4">
                            <span
                              className={`rounded-full px-3 py-1 text-sm font-bold ${
                                product.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {product.isActive ? 'ACTIVO' : 'INACTIVO'}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                to={`/admin/productos/${product.uuid}/editar`}
                                className="rounded-full border border-green-200 px-4 py-2 text-sm font-bold text-green-800 hover:bg-green-50"
                              >
                                EDITAR
                              </Link>

                              {product.isActive ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeactivateProduct(product)
                                  }
                                  disabled={productBeingUpdated === product.uuid}
                                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {productBeingUpdated === product.uuid
                                    ? 'DESACTIVANDO...'
                                    : 'DESACTIVAR'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleActivateProduct(product)
                                  }
                                  disabled={productBeingUpdated === product.uuid}
                                  className="rounded-full border border-green-200 px-4 py-2 text-sm font-bold text-green-800 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {productBeingUpdated === product.uuid
                                    ? 'ACTIVANDO...'
                                    : 'ACTIVAR'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </section>
    </main>
  )
}

export default AdminProductsPage