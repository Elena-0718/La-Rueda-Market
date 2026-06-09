import { Link, NavLink, Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <Link to="/admin" className="flex flex-col">
            <span className="text-xs font-bold tracking-[0.3em] text-green-700">
              PANEL
            </span>

            <span className="text-2xl font-black text-green-900">
              ADMIN
            </span>
          </Link>

          <nav className="flex flex-wrap gap-3">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `rounded-full px-4 py-2 font-semibold ${
                  isActive
                    ? 'bg-green-800 text-white'
                    : 'text-green-900 hover:bg-green-100'
                }`
              }
            >
              RESUMEN
            </NavLink>

            <NavLink
              to="/"
              className="rounded-full border border-green-800 px-4 py-2 font-semibold text-green-900 hover:bg-green-100"
            >
              VER TIENDA
            </NavLink>
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  )
}

export default AdminLayout