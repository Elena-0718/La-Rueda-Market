import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUsers } from '../../api/adminUsersService'

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsers()
        setUsers(data)
      } catch (error) {
        console.error(error)
        setErrorMessage('NO SE PUDIERON CARGAR LOS USUARIOS.')
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  return (
    <main className="p-6">
      <section className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-green-700">
              ADMINISTRACIÓN
            </p>

            <h1 className="mt-2 text-3xl font-bold text-green-900">
              USUARIOS
            </h1>

            <p className="mt-3 text-stone-700">
              CONSULTA LOS CLIENTES Y ADMINISTRADORES REGISTRADOS EN LA PLATAFORMA.
            </p>
          </div>

          <Link
            to="/admin"
            className="rounded-2xl border border-green-800 px-5 py-3 text-center font-bold text-green-900 hover:bg-green-100"
          >
            VOLVER AL PANEL
          </Link>
        </header>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow">
          {isLoading && (
            <p className="font-semibold text-stone-700">
              CARGANDO USUARIOS...
            </p>
          )}

          {errorMessage && (
            <p className="rounded-2xl bg-red-100 p-4 font-semibold text-red-700">
              {errorMessage}
            </p>
          )}

          {!isLoading && !errorMessage && (
            <>
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-bold text-green-900">
                  LISTADO DE USUARIOS
                </h2>

                <p className="font-semibold text-stone-600">
                  {users.length} USUARIOS REGISTRADOS
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-stone-200 bg-green-50 text-green-900">
                      <th className="p-4">NOMBRE</th>
                      <th className="p-4">CELULAR</th>
                      <th className="p-4">VEREDA</th>
                      <th className="p-4">ROL</th>
                      <th className="p-4">USUARIO</th>
                      <th className="p-4">CREDENCIAL</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.uuid}
                        className="border-b border-stone-100 hover:bg-stone-50"
                      >
                        <td className="p-4 font-bold text-green-900">
                          {user.fullName}
                        </td>

                        <td className="p-4 font-semibold text-stone-700">
                          {user.phone || user.credential?.phone || 'SIN CELULAR'}
                        </td>

                        <td className="p-4 text-stone-700">
                          {user.village || 'SIN VEREDA'}
                        </td>

                        <td className="p-4">
                          <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-bold text-stone-700">
                            {user.credential?.role || 'USER'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-bold ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {user.isActive ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-bold ${
                              user.credential?.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {user.credential?.isActive ? 'ACTIVA' : 'INACTIVA'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  )
}

export default AdminUsersPage