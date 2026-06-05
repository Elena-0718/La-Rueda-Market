import { useEffect, useState } from 'react'
import { changePassword } from '../api/authService'
import { getMyProfile, updateMyProfile } from '../api/usersService'
import { saveAuthSession, getAuthToken } from '../features/auth/authStorage'

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
      const updatedProfile = await updateMyProfile(profileForm)

      setProfile(updatedProfile)

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
            ACTUALIZA TUS DATOS Y CAMBIA TU CONTRASEÑA CUANDO LO NECESITES.
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
                  onChange={handleProfileChange}
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

              <div>
                <label
                  htmlFor="photoUrl"
                  className="mb-2 block font-semibold text-green-900"
                >
                  FOTO URL
                </label>

                <input
                  id="photoUrl"
                  name="photoUrl"
                  type="url"
                  value={profileForm.photoUrl}
                  onChange={handleProfileChange}
                  placeholder="PUEDES DEJARLO VACÍO"
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