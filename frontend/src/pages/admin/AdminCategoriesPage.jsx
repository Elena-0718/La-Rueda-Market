import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../../api/categoriesService'

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error(error)
        setErrorMessage('NO SE PUDIERON CARGAR LAS CATEGORÍAS.')
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
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
              CATEGORÍAS
            </h1>

            <p className="mt-3 text-stone-700">
              CONSULTA LAS CATEGORÍAS DISPONIBLES PARA ORGANIZAR EL CATÁLOGO.
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
              CARGANDO CATEGORÍAS...
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
                  LISTADO DE CATEGORÍAS
                </h2>

                <p className="font-semibold text-stone-600">
                  {categories.length} CATEGORÍAS REGISTRADAS
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-stone-200 bg-green-50 text-green-900">
                      <th className="p-4">NOMBRE</th>
                      <th className="p-4">SLUG</th>
                      <th className="p-4">DESCRIPCIÓN</th>
                      <th className="p-4">ORDEN</th>
                      <th className="p-4">ESTADO</th>
                    </tr>
                  </thead>

                  <tbody>
                    {categories.map((category) => (
                      <tr
                        key={category.uuid}
                        className="border-b border-stone-100 hover:bg-stone-50"
                      >
                        <td className="p-4 font-bold text-green-900">
                          {category.name}
                        </td>

                        <td className="p-4 font-semibold text-stone-700">
                          {category.slug}
                        </td>

                        <td className="p-4 text-stone-700">
                          {category.description || 'SIN DESCRIPCIÓN'}
                        </td>

                        <td className="p-4 text-stone-700">
                          {category.sortOrder}
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-bold ${
                              category.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {category.isActive ? 'ACTIVA' : 'INACTIVA'}
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

export default AdminCategoriesPage