import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCategories } from '../../api/categoriesService'
import {
  getProductByUuid,
  updateProduct,
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

function AdminEditProductPage() {
  const { uuid } = useParams()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState(initialFormData)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [currentImageUrl, setCurrentImageUrl] = useState('')
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

        setCategories(categoriesData)

        setFormData({
          name: productData.name || '',
          description: productData.description || '',
          price: productData.price || '',
          stock: productData.stock || '',
          unitMeasure: productData.unitMeasure || 'unit',
          availabilityType: productData.availabilityType || 'daily',
          categoryUuid: productData.category?.uuid || productData.categoryUuid || '',
          isFeatured: Boolean(productData.isFeatured),
        })

        const productImage = productData.images?.[0] || ''
        setCurrentImageUrl(productImage)
        setImagePreview(productImage)
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

  const handleImageChange = (event) => {
    const file = event.target.files[0]

    if (!file) {
      setSelectedImage(null)
      setImagePreview(currentImageUrl)
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 3 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('SOLO SE PERMITEN IMÁGENES JPG, JPEG, PNG O WEBP.')
      setSelectedImage(null)
      setImagePreview(currentImageUrl)
      return
    }

    if (file.size > maxSize) {
      setErrorMessage('LA IMAGEN NO PUEDE PESAR MÁS DE 3MB.')
      setSelectedImage(null)
      setImagePreview(currentImageUrl)
      return
    }

    setErrorMessage('')
    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      let imageUrl = currentImageUrl

      if (selectedImage) {
        const uploadedImage = await uploadProductImage(selectedImage)
        imageUrl = uploadedImage.url
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        unitMeasure: formData.unitMeasure,
        availabilityType: formData.availabilityType,
        categoryUuid: formData.categoryUuid,
        isFeatured: formData.isFeatured,
        images: imageUrl ? [imageUrl] : [],
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
              ACTUALIZA LOS DATOS DEL PRODUCTO Y CAMBIA SU IMAGEN SI ES NECESARIO.
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
            selectedImage={selectedImage}
            imagePreview={imagePreview}
            isSubmitting={isSubmitting}
            submitLabel="ACTUALIZAR PRODUCTO"
            isImageRequired={false}
            onChange={handleChange}
            onImageChange={handleImageChange}
            onSubmit={handleSubmit}
          />
        )}
      </section>
    </main>
  )
}

export default AdminEditProductPage