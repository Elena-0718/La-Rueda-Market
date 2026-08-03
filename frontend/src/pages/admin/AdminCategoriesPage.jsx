import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deactivateCategory,
  getAdminCategories,
  updateCategory,
} from '../../api/adminCategoriesService'

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [searchText, setSearchText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [categoryBeingUpdated, setCategoryBeingUpdated] = useState(null)

  const filteredCategories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return categories
    }

    return categories.filter((category) => {
      const name = category.name?.toLowerCase() || ''
      const slug = category.slug?.toLowerCase() || ''
      const description = category.description?.toLowerCase() || ''
      const sortOrder = String(category.sortOrder || '').toLowerCase()
      const status = category.isActive ? 'activa activo' : 'inactiva inactivo'

      return (
        name.includes(normalizedSearch) ||
        slug.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        sortOrder.includes(normalizedSearch) ||
        status.includes(normalizedSearch)
      )
    })
  }, [categories, searchTerm])

  const loadCategories = async () => {
    try {
      const data = await getAdminCategories()
      setCategories(data)
    } catch (error) {
      console.error(error)
      setErrorMessage('NO SE PUDIERON CARGAR LAS CATEGORÍAS.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleSearchCategories = (event) => {
    event.preventDefault()
    setSearchTerm(searchText)
  }

  const handleClearSearch = () => {
    setSearchText('')
    setSearchTerm('')
  }

  const handleDeactivateCategory = async (category) => {
    const confirmDeactivate = window.confirm(
      `¿SEGURO QUE DESEAS DESACTIVAR LA CATEGORÍA "${category.name}"?`,
    )

    if (!confirmDeactivate) return

    try {
      setCategoryBeingUpdated(category.uuid)
      setErrorMessage('')
      setSuccessMessage('')

      await deactivateCategory(category.uuid)

      setCategories((currentCategories) =>
        currentCategories.map((currentCategory) =>
          currentCategory.uuid === category.uuid
            ? { ...currentCategory, isActive: false }
            : currentCategory,
        ),
      )

      setSuccessMessage('CATEGORÍA DESACTIVADA CORRECTAMENTE.')
    } catch (error) {
      console.error(error)
      setErrorMessage('NO SE PUDO DESACTIVAR LA CATEGORÍA.')
    } finally {
      setCategoryBeingUpdated(null)
    }
  }

  const handleActivateCategory = async (category) => {
    const confirmActivate = window.confirm(
      `¿SEGURO QUE DESEAS ACTIVAR LA CATEGORÍA "${category.name}"?`,
    )

    if (!confirmActivate) return

    try {
      setCategoryBeingUpdated(category.uuid)
      setErrorMessage('')
      setSuccessMessage('')

      await updateCategory(category.uuid, {
        name: category.name,
        description: category.description,
        sortOrder: Number(category.sortOrder),
        isActive: true,
      })

      setCategories((currentCategories) =>
        currentCategories.map((currentCategory) =>
          currentCategory.uuid === category.uuid
            ? { ...currentCategory, isActive: true }
            : currentCategory,
        ),
      )

      setSuccessMessage('CATEGORÍA ACTIVADA CORRECTAMENTE.')
    } catch (error) {
      console.error(error)
      setErrorMessage('NO SE PUDO ACTIVAR LA CATEGORÍA.')
    } finally {
      setCategoryBeingUpdated(null)
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
              CATEGORÍAS
            </h1>

            <p className="mt-3 text-stone-700">
              GESTIONA LAS CATEGORÍAS QUE ORGANIZAN EL CATÁLOGO.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/admin/categorias/nueva"
              className="rounded-2xl bg-green-800 px-5 py-3 text-center font-bold text-white hover:bg-green-900"
            >
              NUEVA CATEGORÍA
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
              CARGANDO CATEGORÍAS...
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
                    LISTADO DE CATEGORÍAS
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-stone-600">
                    {filteredCategories.length} DE {categories.length}{' '}
                    CATEGORÍAS REGISTRADAS
                  </p>

                  {searchTerm && (
                    <p className="mt-1 text-sm font-semibold text-stone-600">
                      BÚSQUEDA: {searchTerm}
                    </p>
                  )}
                </div>

                <form
                  onSubmit={handleSearchCategories}
                  className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto"
                >
                  <input
                    type="text"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Buscar categoría, descripción o estado"
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
                      VER TODAS
                    </button>
                  )}
                </form>
              </div>

              {categories.length === 0 ? (
                <section className="rounded-2xl bg-stone-50 p-8 text-center">
                  <h3 className="text-xl font-black text-green-900">
                    AÚN NO HAY CATEGORÍAS
                  </h3>

                  <p className="mt-2 text-stone-600">
                    Crea categorías para organizar los productos del catálogo.
                  </p>
                </section>
              ) : filteredCategories.length === 0 ? (
                <section className="rounded-2xl bg-stone-50 p-8 text-center">
                  <h3 className="text-xl font-black text-green-900">
                    NO HAY CATEGORÍAS PARA ESTA BÚSQUEDA
                  </h3>

                  <p className="mt-2 text-stone-600">
                    Prueba con otro nombre, descripción, slug, orden o estado.
                  </p>
                </section>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-stone-200 bg-green-50 text-green-900">
                        <th className="p-4">NOMBRE</th>
                        <th className="p-4">SLUG</th>
                        <th className="p-4">DESCRIPCIÓN</th>
                        <th className="p-4">ORDEN</th>
                        <th className="p-4">ESTADO</th>
                        <th className="p-4">ACCIONES</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCategories.map((category) => (
                        <tr
                          key={category.uuid}
                          className="border-b border-stone-100 hover:bg-stone-50"
                        >
                          <td className="p-4 font-bold text-green-900">
                            {category.name}
                          </td>

                          <td className="p-4 font-semibold text-stone-700">
                            {category.slug || 'SIN SLUG'}
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

                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                to={`/admin/categorias/${category.uuid}/editar`}
                                className="rounded-full border border-green-200 px-4 py-2 text-sm font-bold text-green-800 hover:bg-green-50"
                              >
                                EDITAR
                              </Link>

                              {category.isActive ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeactivateCategory(category)
                                  }
                                  disabled={
                                    categoryBeingUpdated === category.uuid
                                  }
                                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {categoryBeingUpdated === category.uuid
                                    ? 'DESACTIVANDO...'
                                    : 'DESACTIVAR'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleActivateCategory(category)
                                  }
                                  disabled={
                                    categoryBeingUpdated === category.uuid
                                  }
                                  className="rounded-full border border-green-200 px-4 py-2 text-sm font-bold text-green-800 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {categoryBeingUpdated === category.uuid
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

export default AdminCategoriesPage