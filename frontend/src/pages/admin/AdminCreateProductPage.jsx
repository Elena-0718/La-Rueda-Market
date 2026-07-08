import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCategories } from '../../api/categoriesService'
import {
  createProduct,
  uploadProductImage,
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
  isFeatured: false,
}

function AdminCreateProductPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState(initialFormData)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0]

    if (!file) {
      setSelectedImage(null)
      setImagePreview('')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 3 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('SOLO SE PERMITEN IMÁGENES JPG, JPEG, PNG O WEBP.')
      setSelectedImage(null)
      setImagePreview('')
      return
    }

    if (file.size > maxSize) {
      setErrorMessage('LA IMAGEN NO PUEDE PESAR MÁS DE 3MB.')
      setSelectedImage(null)
      setImagePreview('')
      return
    }

    setErrorMessage('')
    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!selectedImage) {
      setErrorMessage('DEBES SELECCIONAR UNA IMAGEN DEL PRODUCTO.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const uploadedImage = await uploadProductImage(selectedImage)

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        unitMeasure: formData.unitMeasure,
        availabilityType: formData.availabilityType,
        categoryUuid: formData.categoryUuid,
        isFeatured: formData.isFeatured,
        images: [uploadedImage.url],
      }

      await createProduct(payload)

      navigate('/admin/productos')
    } catch (error) {
      console.error(error)
      setErrorMessage('NO SE PUDO CREAR EL PRODUCTO.')
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
              NUEVO PRODUCTO
            </h1>

            <p className="mt-3 text-stone-700">
              CREA UN PRODUCTO CON IMAGEN PARA MOSTRARLO EN EL CATÁLOGO.
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

        {isLoadingCategories ? (
          <p className="mt-8 font-semibold text-stone-700">
            CARGANDO CATEGORÍAS...
          </p>
        ) : (
          <ProductForm
            formData={formData}
            categories={categories}
            selectedImage={selectedImage}
            imagePreview={imagePreview}
            isSubmitting={isSubmitting}
            submitLabel="CREAR PRODUCTO"
            isImageRequired={true}
            onChange={handleChange}
            onImageChange={handleImageChange}
            onSubmit={handleSubmit}
          />
        )}
      </section>
    </main>
  )
}

export default AdminCreateProductPage