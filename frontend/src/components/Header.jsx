import { Link, NavLink } from 'react-router-dom'

function Header() {
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
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 font-semibold ${
                isActive
                  ? 'bg-green-800 text-white'
                  : 'text-green-900 hover:bg-green-100'
              }`
            }
          >
            PRODUCTOS
          </NavLink>

          <NavLink
            to="/carrito"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 font-semibold ${
                isActive
                  ? 'bg-green-800 text-white'
                  : 'text-green-900 hover:bg-green-100'
              }`
            }
          >
            CARRITO
          </NavLink>

          <NavLink
            to="/login"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 font-semibold ${
                isActive
                  ? 'bg-green-800 text-white'
                  : 'text-green-900 hover:bg-green-100'
              }`
            }
          >
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
        </nav>
      </div>
    </header>
  )
}

export default Header