import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../../api/productsService'

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
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (error) {
        console.error(error)
        setErrorMessage('NO SE PUDIERON CARGAR LOS PRODUCTOS.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

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
              CONSULTA LOS PRODUCTOS REGISTRADOS EN LA TIENDA.
            </p>
          </div>

          <Link
            to="/admin"
            className="rounded-2xl border border-green-800 px-5 py-3 text-center font-bold text-green-900 hover:bg-green-100"
          >
            VOLVER AL PANEL
          </Link>
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

          {!isLoading && !errorMessage && (
            <>
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-bold text-green-900">
                  LISTADO DE PRODUCTOS
                </h2>

                <p className="font-semibold text-stone-600">
                  {products.length} PRODUCTOS REGISTRADOS
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-stone-200 bg-green-50 text-green-900">
                      <th className="p-4">PRODUCTO</th>
                      <th className="p-4">CATEGORÍA</th>
                      <th className="p-4">PRECIO</th>
                      <th className="p-4">UNIDAD</th>
                      <th className="p-4">DISPONIBILIDAD</th>
                      <th className="p-4">STOCK</th>
                      <th className="p-4">ESTADO</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  )
}

export default AdminProductsPage