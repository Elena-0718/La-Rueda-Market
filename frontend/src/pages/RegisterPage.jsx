import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../api/authService'
import { uploadUserImage } from '../api/usersService'

function RegisterPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    village: '',
    birthDate: '',
    photoUrl: '',
    password: '',
    confirmPassword: '',
  })

  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
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
    const maxSize = 2 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('SOLO SE PERMITEN IMÁGENES JPG, JPEG, PNG O WEBP.')
      setSelectedImage(null)
      setImagePreview('')
      return
    }

    if (file.size > maxSize) {
      setErrorMessage('LA FOTO NO PUEDE PESAR MÁS DE 2MB.')
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
    setErrorMessage('')
    setSuccessMessage('')

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('LAS CONTRASEÑAS NO COINCIDEN.')
      return
    }

    setIsSubmitting(true)

    try {
      let photoUrl = null

      if (selectedImage) {
        const uploadedImage = await uploadUserImage(selectedImage)
        photoUrl = uploadedImage.url
      }

      await signUp({
        ...formData,
        photoUrl,
      })

      setSuccessMessage('CUENTA CREADA CORRECTAMENTE. YA PUEDES INGRESAR.')

      setTimeout(() => {
        navigate('/login')
      }, 1200)
    } catch (error) {
      console.error(error)

      const backendMessage =
        error.response?.data?.message || 'NO SE PUDO CREAR LA CUENTA.'

      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage.join(' ')
          : backendMessage,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="p-6">
      <section className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow">
        <p className="text-sm font-semibold tracking-widest text-green-700">
          LA RUEDA MARKET
        </p>

        <h1 className="mt-2 text-3xl font-bold text-green-900">
          CREAR CUENTA
        </h1>

        <p className="mt-3 text-stone-700">
          REGÍSTRATE PARA PODER HACER PEDIDOS CUANDO EL SERVICIO DE COMPRA ESTÉ DISPONIBLE.
        </p>

        {errorMessage && (
          <p className="mt-5 rounded-2xl bg-red-100 p-4 font-semibold text-red-700">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="mt-5 rounded-2xl bg-green-100 p-4 font-semibold text-green-800">
            {successMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2 rounded-3xl bg-green-50 p-5">
            <p className="mb-3 font-bold text-green-900">
              FOTO DE PERFIL OPCIONAL
            </p>

            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Vista previa de foto de perfil"
                className="h-32 w-32 rounded-full object-cover shadow"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white text-sm font-bold text-stone-500 shadow">
                SIN FOTO
              </div>
            )}

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageChange}
              className="mt-5 w-full rounded-2xl border border-green-200 bg-white px-4 py-3 outline-none focus:border-green-700"
            />

            <p className="mt-2 text-sm font-semibold text-stone-500">
              PUEDES CREAR TU CUENTA SIN FOTO. FORMATOS: JPG, JPEG, PNG O WEBP. MÁXIMO 2MB.
            </p>

            {selectedImage && (
              <p className="mt-2 text-sm font-semibold text-green-800">
                FOTO SELECCIONADA: {selectedImage.name}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="fullName"
              className="mb-2 block font-semibold text-green-900"
            >
              NOMBRE COMPLETO
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="EJEMPLO: ANA MILENA REYES"
              className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
              required
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block font-semibold text-green-900"
            >
              CELULAR
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="EJEMPLO: 3146780918"
              className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
              required
            />
          </div>

          <div>
            <label
              htmlFor="village"
              className="mb-2 block font-semibold text-green-900"
            >
              VEREDA O SECTOR
            </label>

            <input
              id="village"
              name="village"
              type="text"
              value={formData.village}
              onChange={handleChange}
              placeholder="EJEMPLO: EL ESPINAL"
              className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
              required
            />
          </div>

          <div>
            <label
              htmlFor="birthDate"
              className="mb-2 block font-semibold text-green-900"
            >
              FECHA DE NACIMIENTO
            </label>

            <input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-semibold text-green-900"
            >
              CONTRASEÑA
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="MÍNIMO 8 CARACTERES"
              className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block font-semibold text-green-900"
            >
              CONFIRMAR CONTRASEÑA
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="REPITE TU CONTRASEÑA"
              className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 rounded-2xl bg-green-800 px-6 py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {isSubmitting ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
          </button>
        </form>

        <p className="mt-6 text-center font-semibold text-stone-700">
          ¿YA TIENES CUENTA?{' '}
          <Link to="/login" className="text-green-800 hover:underline">
            INGRESA AQUÍ
          </Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage