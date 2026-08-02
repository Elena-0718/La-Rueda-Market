import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCategories } from '../../api/categoriesService'
import {
  getProductByUuid,
  updateProduct,
} from '../../api/adminProductsService'
import ProductForm from '../../components/admin/ProductForm'

const initialFormData = {
  name: '',
  description: '',
  price: '',
  stock: '',
  unitMeasure: 'unit',
  availabilityType: 'daily',
  categoryUuid: '',
  imageUrl: '',
  isFeatured: false,
}

function AdminEditProductPage() {
  const { uuid } = useParams()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState(initialFormData)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, productData] = await Promise.all([
          getCategories(),
          getProductByUuid(uuid),
        ])

        const productImage = productData.images?.[0] || ''

        setCategories(categoriesData)

        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price || '',
          stock: productData.stock || '',
          unitMeasure: productData.unitMeasure || 'unit',
          availabilityType: productData.availabilityType || 'daily',
          categoryUuid:
            productData.category?.uuid || productData.categoryUuid || '',
          imageUrl: productImage,
          isFeatured: Boolean(productData.isFeatured),
        })
      } catch (error) {
        console.error(error)
        setErrorMessage('NO SE PUDO CARGAR LA INFORMACIÓN DEL PRODUCTO.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [uuid])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const isValidImageUrl = (url) => {
    if (!url.trim()) return false

    try {
      const parsedUrl = new URL(url)
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.name.trim()) {
      setErrorMessage('DEBES INGRESAR EL NOMBRE DEL PRODUCTO.')
      return
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setErrorMessage('DEBES INGRESAR UN PRECIO VÁLIDO.')
      return
    }

    if (!formData.stock || Number(formData.stock) < 0) {
      setErrorMessage('DEBES INGRESAR UN STOCK VÁLIDO.')
      return
    }

    if (!formData.categoryUuid) {
      setErrorMessage('DEBES SELECCIONAR UNA CATEGORÍA.')
      return
    }

    if (!isValidImageUrl(formData.imageUrl)) {
      setErrorMessage('DEBES PEGAR UNA URL VÁLIDA DE IMAGEN.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        unitMeasure: formData.unitMeasure,
        availabilityType: formData.availabilityType,
        categoryUuid: formData.categoryUuid,
        isFeatured: formData.isFeatured,
        images: [formData.imageUrl.trim()],
      }

      await updateProduct(uuid, payload)

      navigate('/admin/productos')
    } catch (error) {
      console.error(error)
      setErrorMessage('NO SE PUDO ACTUALIZAR EL PRODUCTO.')
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
              EDITAR PRODUCTO
            </h1>

            <p className="mt-3 text-stone-700">
              ACTUALIZA LOS DATOS DEL PRODUCTO Y CAMBIA LA URL DE IMAGEN SI ES
              NECESARIO.
            </p>
          </div>

          <Link
            to="/admin/productos"
            className="rounded-2xl border border-green-800 px-5 py-3 text-center font-bold text-green-900 hover:bg-green-100"
          >
            VOLVER A PRODUCTOS
          </Link>
        </header>

        {errorMessage && (
          <p className="mt-6 rounded-2xl bg-red-100 p-4 font-semibold text-red-700">
            {errorMessage}
          </p>
        )}

        {isLoading ? (
          <p className="mt-8 font-semibold text-stone-700">
            CARGANDO PRODUCTO...
          </p>
        ) : (
          <ProductForm
            formData={formData}
            categories={categories}
            isSubmitting={isSubmitting}
            submitLabel="ACTUALIZAR PRODUCTO"
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        )}
      </section>
    </main>
  )
}

export default AdminEditProductPage