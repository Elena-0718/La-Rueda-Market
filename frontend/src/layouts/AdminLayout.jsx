import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  AUTH_CHANGE_EVENT_NAME,
  clearAuthSession,
  getAuthUser,
} from '../features/auth/authStorage'

function AdminLayout() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const syncUser = () => {
      setUser(getAuthUser())
    }

    syncUser()

    window.addEventListener(AUTH_CHANGE_EVENT_NAME, syncUser)

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT_NAME, syncUser)
    }
  }, [])

  const handleLogout = () => {
    clearAuthSession()
    setIsMenuOpen(false)
    navigate('/login')
  }

  const getFirstName = () => {
    const name = user?.name || user?.fullName || 'ADMIN'
    return name.split(' ')[0].toUpperCase()
  }

  const getInitial = () => {
    const name = user?.name || user?.fullName || 'A'
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/admin" className="flex flex-col">
            <span className="text-xs font-bold tracking-[0.3em] text-green-700">
              PANEL
            </span>

            <span className="text-2xl font-black text-green-900">
              ADMIN
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              to="/"
              className="rounded-full border border-green-800 px-4 py-2 font-semibold text-green-900 hover:bg-green-100"
            >
              VER TIENDA
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((current) => !current)}
                className="flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-2 font-bold text-green-900 hover:bg-green-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-800 text-sm font-black text-white">
                  {getInitial()}
                </span>

                <span>{getFirstName()}</span>

                <span className="text-xs">
                  {isMenuOpen ? '▲' : '▼'}
                </span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-3xl border border-green-100 bg-white shadow-xl">
                  <Link
                    to="/perfil"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-5 py-4 font-bold text-green-900 hover:bg-green-50"
                  >
                    MI PERFIL
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-5 py-4 text-left font-bold text-red-700 hover:bg-red-50"
                  >
                    CERRAR SESIÓN
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  )
}

export default AdminLayout