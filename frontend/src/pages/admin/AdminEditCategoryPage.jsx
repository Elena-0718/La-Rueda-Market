import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  getAdminCategories,
  updateCategory,
} from '../../api/adminCategoriesService'
import CategoryForm from '../../components/admin/CategoryForm'

const initialFormData = {
  name: '',
  description: '',
  sortOrder: '',
  isActive: true,
}

function AdminEditCategoryPage() {
  const { uuid } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState(initialFormData)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const categories = await getAdminCategories()
        const category = categories.find(
          (currentCategory) => currentCategory.uuid === uuid
        )

        if (!category) {
          setErrorMessage('CATEGORÍA NO ENCONTRADA.')
          return
        }

        setFormData({
          name: category.name || '',
          description: category.description || '',
          sortOrder: category.sortOrder || '',
          isActive: Boolean(category.isActive),
        })
      } catch (error) {
        console.error(error)
        setErrorMessage('NO SE PUDO CARGAR LA CATEGORÍA.')
      } finally {
        setIsLoading(false)
      }
    }

    loadCategory()
  }, [uuid])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        sortOrder: Number(formData.sortOrder),
        isActive: formData.isActive,
      }

      await updateCategory(uuid, payload)

      navigate('/admin/categorias')
    } catch (error) {
      console.error(error)
      setErrorMessage('NO SE PUDO ACTUALIZAR LA CATEGORÍA.')
    } finally {
      setIsSubmitting(false)
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
              EDITAR CATEGORÍA
            </h1>

            <p className="mt-3 text-stone-700">
              ACTUALIZA EL NOMBRE, LA DESCRIPCIÓN Y EL ORDEN DE LA CATEGORÍA.
            </p>
          </div>

          <Link
            to="/admin/categorias"
            className="rounded-2xl border border-green-800 px-5 py-3 text-center font-bold text-green-900 hover:bg-green-100"
          >
            VOLVER A CATEGORÍAS
          </Link>
        </header>

        {errorMessage && (
          <p className="mt-6 rounded-2xl bg-red-100 p-4 font-semibold text-red-700">
            {errorMessage}
          </p>
        )}

        {isLoading ? (
          <p className="mt-8 font-semibold text-stone-700">
            CARGANDO CATEGORÍA...
          </p>
        ) : (
          <CategoryForm
            formData={formData}
            isSubmitting={isSubmitting}
            submitLabel="ACTUALIZAR CATEGORÍA"
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        )}
      </section>
    </main>
  )
}

export default AdminEditCategoryPage