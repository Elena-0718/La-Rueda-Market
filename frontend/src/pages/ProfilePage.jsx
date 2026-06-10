import { useEffect, useState } from 'react'
import { changePassword } from '../api/authService'
import {
  getMyProfile,
  updateMyProfile,
  uploadUserImage,
} from '../api/usersService'
import { saveAuthSession, getAuthToken } from '../features/auth/authStorage'

const API_URL = 'http://localhost:3000'

function ProfilePage() {
  const [profile, setProfile] = useState(null)

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    village: '',
    birthDate: '',
    photoUrl: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })

  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const formatBirthDateForInput = (birthDate) => {
    if (!birthDate) {
      return ''
    }

    return birthDate.split('T')[0]
  }

  const getBackendMessage = (error, fallbackMessage) => {
    const message = error.response?.data?.message || fallbackMessage

    return Array.isArray(message) ? message.join(' ') : message
  }

  const getImageSrc = (photoUrl) => {
    if (!photoUrl) {
      return ''
    }

    if (photoUrl.startsWith('/uploads')) {
      return `${API_URL}${photoUrl}`
    }

    return photoUrl
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile()

        setProfile(data)

        setProfileForm({
          fullName: data.fullName || '',
          phone: data.phone || '',
          village: data.village || '',
          birthDate: formatBirthDateForInput(data.birthDate),
          photoUrl: data.photoUrl || '',
        })

        setImagePreview(data.photoUrl || '')
      } catch (error) {
        console.error(error)
        setProfileError('NO SE PUDO CARGAR TU PERFIL.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleProfileChange = (event) => {
    const { name, value } = event.target

    setProfileForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0]

    if (!file) {
      setSelectedImage(null)
      setImagePreview(profileForm.photoUrl || '')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 2 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      setProfileError('SOLO SE PERMITEN IMÁGENES JPG, JPEG, PNG O WEBP.')
      setSelectedImage(null)
      setImagePreview(profileForm.photoUrl || '')
      return
    }

    if (file.size > maxSize) {
      setProfileError('LA FOTO NO PUEDE PESAR MÁS DE 2MB.')
      setSelectedImage(null)
      setImagePreview(profileForm.photoUrl || '')
      return
    }

    setProfileError('')
    setProfileMessage('')
    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target

    setPasswordForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleUpdateProfile = async (event) => {
    event.preventDefault()
    setProfileError('')
    setProfileMessage('')
    setIsUpdatingProfile(true)

    try {
      let photoUrl = profileForm.photoUrl

      if (selectedImage) {
        const uploadedImage = await uploadUserImage(selectedImage)
        photoUrl = uploadedImage.url
      }

      const updatedProfile = await updateMyProfile({
        fullName: profileForm.fullName,
        village: profileForm.village,
        birthDate: profileForm.birthDate,
        photoUrl,
      })

      setProfile(updatedProfile)

      setProfileForm((currentForm) => ({
        ...currentForm,
        photoUrl: updatedProfile.photoUrl || '',
      }))

      setSelectedImage(null)
      setImagePreview(updatedProfile.photoUrl || '')

      const token = getAuthToken()

      saveAuthSession({
        token,
        user: {
          id: updatedProfile.uuid,
          credentialId: updatedProfile.credential?.uuid,
          name: updatedProfile.fullName,
          phone: updatedProfile.phone,
          loginPhone: updatedProfile.credential?.phone,
          village: updatedProfile.village,
          photoUrl: updatedProfile.photoUrl,
          role: updatedProfile.credential?.role,
        },
      })

      setProfileMessage('PERFIL ACTUALIZADO CORRECTAMENTE.')
    } catch (error) {
      console.error(error)
      setProfileError(
        getBackendMessage(error, 'NO SE PUDO ACTUALIZAR EL PERFIL.'),
      )
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordMessage('')

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError('LAS CONTRASEÑAS NO COINCIDEN.')
      return
    }

    const credentialUuid = profile?.credential?.uuid

    if (!credentialUuid) {
      setPasswordError('NO SE ENCONTRÓ LA CREDENCIAL DEL USUARIO.')
      return
    }

    setIsChangingPassword(true)

    try {
      await changePassword({
        credentialUuid,
        ...passwordForm,
      })

      setPasswordMessage('CONTRASEÑA CAMBIADA CORRECTAMENTE.')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      })
    } catch (error) {
      console.error(error)
      setPasswordError(
        getBackendMessage(error, 'NO SE PUDO CAMBIAR LA CONTRASEÑA.'),
      )
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <main className="p-6">
        <section className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow">
          <p className="font-semibold text-stone-700">CARGANDO PERFIL...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="p-6">
      <section className="mx-auto max-w-5xl">
        <header className="rounded-3xl bg-white p-8 shadow">
          <p className="text-sm font-semibold tracking-widest text-green-700">
            MI CUENTA
          </p>

          <h1 className="mt-2 text-3xl font-bold text-green-900">
            PERFIL DE USUARIO
          </h1>

          <p className="mt-3 text-stone-700">
            ACTUALIZA TUS DATOS, TU FOTO DE PERFIL Y TU CONTRASEÑA CUANDO LO NECESITES.
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold text-green-900">
              MIS DATOS
            </h2>

            {profileError && (
              <p className="mt-5 rounded-2xl bg-red-100 p-4 font-semibold text-red-700">
                {profileError}
              </p>
            )}

            {profileMessage && (
              <p className="mt-5 rounded-2xl bg-green-100 p-4 font-semibold text-green-800">
                {profileMessage}
              </p>
            )}

            <form onSubmit={handleUpdateProfile} className="mt-6 space-y-5">
              <div className="rounded-3xl bg-green-50 p-5">
                <p className="mb-3 font-bold text-green-900">
                  FOTO DE PERFIL
                </p>

                {imagePreview ? (
                  <img
                    src={getImageSrc(imagePreview)}
                    alt="Foto de perfil"
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
                  FORMATOS PERMITIDOS: JPG, JPEG, PNG O WEBP. MÁXIMO 2MB.
                </p>

                {selectedImage && (
                  <p className="mt-2 text-sm font-semibold text-green-800">
                    FOTO SELECCIONADA: {selectedImage.name}
                  </p>
                )}
              </div>

              <div>
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
                  value={profileForm.fullName}
                  onChange={handleProfileChange}
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
                  value={profileForm.phone}
                  disabled
                  className="w-full rounded-2xl border border-stone-200 bg-stone-100 px-4 py-4 text-lg text-stone-600 outline-none"
                  required
                />

                <p className="mt-2 text-sm font-semibold text-stone-500">
                  EL CELULAR ES TU USUARIO DE INGRESO. PARA CAMBIARLO, CONTACTA AL ADMINISTRADOR.
                </p>
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
                  value={profileForm.village}
                  onChange={handleProfileChange}
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
                  value={profileForm.birthDate}
                  onChange={handleProfileChange}
                  className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full rounded-2xl bg-green-800 px-6 py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {isUpdatingProfile ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold text-green-900">
              SEGURIDAD
            </h2>

            {passwordError && (
              <p className="mt-5 rounded-2xl bg-red-100 p-4 font-semibold text-red-700">
                {passwordError}
              </p>
            )}

            {passwordMessage && (
              <p className="mt-5 rounded-2xl bg-green-100 p-4 font-semibold text-green-800">
                {passwordMessage}
              </p>
            )}

            <form onSubmit={handleChangePassword} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-2 block font-semibold text-green-900"
                >
                  CONTRASEÑA ACTUAL
                </label>

                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block font-semibold text-green-900"
                >
                  NUEVA CONTRASEÑA
                </label>

                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="mb-2 block font-semibold text-green-900"
                >
                  CONFIRMAR NUEVA CONTRASEÑA
                </label>

                <input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full rounded-2xl bg-green-800 px-6 py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {isChangingPassword
                  ? 'CAMBIANDO...'
                  : 'CAMBIAR CONTRASEÑA'}
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  )
}

export default ProfilePage