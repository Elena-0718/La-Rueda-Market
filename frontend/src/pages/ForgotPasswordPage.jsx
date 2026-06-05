import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  forgotPassword,
  resetPassword,
  verifyResetCode,
} from '../api/authService'

function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const getBackendMessage = (error, fallbackMessage) => {
    const message = error.response?.data?.message || fallbackMessage

    return Array.isArray(message) ? message.join(' ') : message
  }

  const handleRequestCode = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const data = await forgotPassword({ phone })

setSuccessMessage(
  data.resetCode
    ? `CÓDIGO DE PRUEBA: ${data.resetCode}`
    : 'TE ENVIAMOS UN CÓDIGO DE RECUPERACIÓN.',
)

setStep(2)
    } catch (error) {
      console.error(error)
      setErrorMessage(
        getBackendMessage(error, 'NO SE PUDO SOLICITAR EL CÓDIGO.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyCode = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      await verifyResetCode({ phone, code })

      setSuccessMessage('CÓDIGO VERIFICADO. CREA TU NUEVA CONTRASEÑA.')
      setStep(3)
    } catch (error) {
      console.error(error)
      setErrorMessage(
        getBackendMessage(error, 'EL CÓDIGO NO ES VÁLIDO.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('LAS CONTRASEÑAS NO COINCIDEN.')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword({
        phone,
        code,
        newPassword,
        confirmNewPassword,
      })

      setSuccessMessage('CONTRASEÑA ACTUALIZADA CORRECTAMENTE.')

      setTimeout(() => {
        navigate('/login')
      }, 1200)
    } catch (error) {
      console.error(error)
      setErrorMessage(
        getBackendMessage(error, 'NO SE PUDO CAMBIAR LA CONTRASEÑA.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="p-6">
      <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow">
        <p className="text-sm font-semibold tracking-widest text-green-700">
          LA RUEDA MARKET
        </p>

        <h1 className="mt-2 text-3xl font-bold text-green-900">
          RECUPERAR CONTRASEÑA
        </h1>

        <p className="mt-3 text-stone-700">
          SIGUE LOS PASOS PARA CREAR UNA NUEVA CONTRASEÑA.
        </p>

        <div className="mt-6 flex gap-2">
          <span
            className={`h-2 flex-1 rounded-full ${
              step >= 1 ? 'bg-green-800' : 'bg-green-100'
            }`}
          />

          <span
            className={`h-2 flex-1 rounded-full ${
              step >= 2 ? 'bg-green-800' : 'bg-green-100'
            }`}
          />

          <span
            className={`h-2 flex-1 rounded-full ${
              step >= 3 ? 'bg-green-800' : 'bg-green-100'
            }`}
          />
        </div>

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

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block font-semibold text-green-900"
              >
                CELULAR
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="EJEMPLO: 3146780918"
                className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-green-800 px-6 py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-stone-400"
            >
              {isSubmitting ? 'ENVIANDO...' : 'SOLICITAR CÓDIGO'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="code"
                className="mb-2 block font-semibold text-green-900"
              >
                CÓDIGO DE RECUPERACIÓN
              </label>

              <input
                id="code"
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="EJEMPLO: 482913"
                className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-green-800 px-6 py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-stone-400"
            >
              {isSubmitting ? 'VERIFICANDO...' : 'VERIFICAR CÓDIGO'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full rounded-2xl border border-green-200 px-6 py-4 font-bold text-green-800"
            >
              CAMBIAR CELULAR
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block font-semibold text-green-900"
              >
                NUEVA CONTRASEÑA
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="ESCRIBE TU NUEVA CONTRASEÑA"
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
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                placeholder="REPITE TU NUEVA CONTRASEÑA"
                className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-green-800 px-6 py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-stone-400"
            >
              {isSubmitting ? 'GUARDANDO...' : 'CAMBIAR CONTRASEÑA'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center font-semibold text-stone-700">
          ¿YA RECORDARTE TU CONTRASEÑA?{' '}
          <Link to="/login" className="text-green-800 hover:underline">
            INGRESA AQUÍ
          </Link>
        </p>
      </section>
    </main>
  )
}

export default ForgotPasswordPage