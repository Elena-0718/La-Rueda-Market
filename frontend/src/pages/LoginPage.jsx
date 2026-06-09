import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { login } from '../api/authService'
import { saveAuthSession } from '../features/auth/authStorage'

function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
const fromBuy = searchParams.get('from') === 'buy'

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const data = await login({ phone, password })

      saveAuthSession({
        token: data.token,
        user: data.user,
      })

      navigate('/')
    } catch (error) {
      console.error(error)
      setErrorMessage('TELÉFONO O CONTRASEÑA INCORRECTOS.')
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
          INGRESAR
        </h1>

        <p className="mt-3 text-stone-700">
  {fromBuy
    ? 'INICIA SESIÓN PARA CONTINUAR CON TU COMPRA.'
    : 'ENTRA CON TU NÚMERO DE CELULAR Y CONTRASEÑA.'}
</p>

        {errorMessage && (
          <p className="mt-5 rounded-2xl bg-red-100 p-4 font-semibold text-red-700">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
              placeholder="EJEMPLO: 3186844954"
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
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="ESCRIBE TU CONTRASEÑA"
              className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-green-800 px-6 py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {isSubmitting ? 'INGRESANDO...' : 'INGRESAR'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center font-semibold">
          <Link
            to="/recuperar-contrasena"
            className="text-green-800 hover:underline"
          >
            OLVIDÉ MI CONTRASEÑA
          </Link>

          <Link
            to="/registro"
            className="text-stone-700 hover:text-green-800"
          >
            CREAR UNA CUENTA NUEVA
          </Link>
        </div>
      </section>
    </main>
  )
}

export default LoginPage