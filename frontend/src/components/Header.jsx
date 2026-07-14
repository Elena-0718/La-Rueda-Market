import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  AUTH_CHANGE_EVENT_NAME,
  clearAuthSession,
  getAuthUser,
} from '../features/auth/authStorage'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()

  const [user, setUser] = useState(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  useEffect(() => {
    const syncUser = () => {
      setUser(getAuthUser())
    }

    syncUser()

    window.addEventListener(AUTH_CHANGE_EVENT_NAME, syncUser)

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT_NAME, syncUser)
    }
  }, [location.pathname])

  useEffect(() => {
    setIsUserMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    clearAuthSession()
    setUser(null)
    setIsUserMenuOpen(false)
    navigate('/login')
  }

  const getNavLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 font-semibold ${
      isActive
        ? 'bg-green-800 text-white'
        : 'text-green-900 hover:bg-green-100'
    }`

  const getFirstName = () => {
    const name = user?.name || user?.fullName || 'MI CUENTA'
    return name.split(' ')[0].toUpperCase()
  }

  const getInitial = () => {
    const name = user?.name || user?.fullName || 'U'
    return name.charAt(0).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-green-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="flex flex-col">
          <span className="text-xs font-bold tracking-[0.3em] text-green-700">
            LA RUEDA
          </span>

          <span className="text-2xl font-black text-green-900">
            MARKET
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-3">
          <NavLink to="/" className={getNavLinkClass}>
            PRODUCTOS
          </NavLink>

          {!user && (
            <>
              <NavLink to="/login" className={getNavLinkClass}>
                INGRESAR
              </NavLink>

              <NavLink
                to="/registro"
                className={({ isActive }) =>
                  `rounded-full border border-green-800 px-4 py-2 font-semibold ${
                    isActive
                      ? 'bg-green-800 text-white'
                      : 'text-green-900 hover:bg-green-100'
                  }`
                }
              >
                CREAR CUENTA
              </NavLink>
            </>
          )}

          {user && (
            <>
              {user.role === 'ADMIN' && (
                <NavLink to="/admin" className={getNavLinkClass}>
                  PANEL ADMIN
                </NavLink>
              )}

              {user.role === 'CLIENT' && (
                <NavLink
                  to="/carrito"
                  className={({ isActive }) =>
                    `rounded-full border border-green-800 px-4 py-2 font-bold ${
                      isActive
                        ? 'bg-green-800 text-white'
                        : 'bg-green-50 text-green-900 hover:bg-green-100'
                    }`
                  }
                >
                  🛒 MI CARRITO
                </NavLink>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((current) => !current)}
                  className="flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-2 font-bold text-green-900 hover:bg-green-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-800 text-sm font-black text-white">
                    {getInitial()}
                  </span>

                  <span>{getFirstName()}</span>

                  <span className="text-xs">
                    {isUserMenuOpen ? '▲' : '▼'}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-3xl border border-green-100 bg-white shadow-xl">
                    <NavLink
                      to="/perfil"
                      className="block px-5 py-4 font-bold text-green-900 hover:bg-green-50"
                    >
                      MI PERFIL
                    </NavLink>

                    {user.role === 'CLIENT' && (
                      <NavLink
                        to="/mis-pedidos"
                        className="block px-5 py-4 font-bold text-green-900 hover:bg-green-50"
                      >
                        MIS PEDIDOS
                      </NavLink>
                    )}

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
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header