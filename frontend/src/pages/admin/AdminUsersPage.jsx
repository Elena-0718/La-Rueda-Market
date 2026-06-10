import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUsers } from '../../api/adminUsersService'
import {
  activateCredential,
  changeCredentialRole,
  deactivateCredential,
} from '../../api/adminCredentialsService'

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [credentialBeingUpdated, setCredentialBeingUpdated] = useState(null)

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

  const updateCredentialInTable = (userUuid, credentialChanges) => {
    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.uuid === userUuid
          ? {
              ...currentUser,
              credential: {
                ...currentUser.credential,
                ...credentialChanges,
              },
            }
          : currentUser,
      ),
    )
  }

  const handleDeactivateCredential = async (user) => {
    const credentialUuid = user.credential?.uuid

    if (!credentialUuid) {
      setErrorMessage('ESTE USUARIO NO TIENE CREDENCIAL ASOCIADA.')
      return
    }

    const confirmDeactivate = window.confirm(
      `¿SEGURO QUE DESEAS DESACTIVAR LA CUENTA DE "${user.fullName}"?`,
    )

    if (!confirmDeactivate) return

    try {
      setCredentialBeingUpdated(credentialUuid)
      setErrorMessage('')
      setSuccessMessage('')

      await deactivateCredential(credentialUuid)

      updateCredentialInTable(user.uuid, { isActive: false })

      setSuccessMessage('CUENTA DESACTIVADA CORRECTAMENTE.')
    } catch (error) {
      console.error(error)
      setErrorMessage('NO SE PUDO DESACTIVAR LA CUENTA.')
    } finally {
      setCredentialBeingUpdated(null)
    }
  }

  const handleActivateCredential = async (user) => {
    const credentialUuid = user.credential?.uuid

    if (!credentialUuid) {
      setErrorMessage('ESTE USUARIO NO TIENE CREDENCIAL ASOCIADA.')
      return
    }

    const confirmActivate = window.confirm(
      `¿SEGURO QUE DESEAS ACTIVAR LA CUENTA DE "${user.fullName}"?`,
    )

    if (!confirmActivate) return

    try {
      setCredentialBeingUpdated(credentialUuid)
      setErrorMessage('')
      setSuccessMessage('')

      await activateCredential(credentialUuid)

      updateCredentialInTable(user.uuid, { isActive: true })

      setSuccessMessage('CUENTA ACTIVADA CORRECTAMENTE.')
    } catch (error) {
      console.error(error)
      setErrorMessage('NO SE PUDO ACTIVAR LA CUENTA.')
    } finally {
      setCredentialBeingUpdated(null)
    }
  }

  const handleChangeRole = async (user) => {
    const credentialUuid = user.credential?.uuid
    const currentRole = user.credential?.role || 'CLIENT'
    const nextRole = currentRole === 'ADMIN' ? 'CLIENT' : 'ADMIN'

    if (!credentialUuid) {
      setErrorMessage('ESTE USUARIO NO TIENE CREDENCIAL ASOCIADA.')
      return
    }

    const confirmChangeRole = window.confirm(
      `¿SEGURO QUE DESEAS CAMBIAR EL ROL DE "${user.fullName}" A ${nextRole}?`,
    )

    if (!confirmChangeRole) return

    try {
      setCredentialBeingUpdated(credentialUuid)
      setErrorMessage('')
      setSuccessMessage('')

      await changeCredentialRole(credentialUuid, nextRole)

      updateCredentialInTable(user.uuid, { role: nextRole })

      setSuccessMessage(`ROL ACTUALIZADO A ${nextRole} CORRECTAMENTE.`)
    } catch (error) {
      console.error(error)
      setErrorMessage('NO SE PUDO CAMBIAR EL ROL DEL USUARIO.')
    } finally {
      setCredentialBeingUpdated(null)
    }
  }

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
              CONSULTA Y ADMINISTRA EL ACCESO Y ROL DE LOS USUARIOS REGISTRADOS.
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

          {successMessage && (
            <p className="rounded-2xl bg-green-100 p-4 font-semibold text-green-800">
              {successMessage}
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
                <table className="w-full min-w-[1150px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-stone-200 bg-green-50 text-green-900">
                      <th className="p-4">NOMBRE</th>
                      <th className="p-4">CELULAR</th>
                      <th className="p-4">VEREDA</th>
                      <th className="p-4">ROL</th>
                      <th className="p-4">USUARIO</th>
                      <th className="p-4">CREDENCIAL</th>
                      <th className="p-4">ACCIONES</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => {
                      const credentialUuid = user.credential?.uuid
                      const currentRole = user.credential?.role || 'CLIENT'
                      const isCredentialBeingUpdated =
                        credentialBeingUpdated === credentialUuid

                      return (
                        <tr
                          key={user.uuid}
                          className="border-b border-stone-100 hover:bg-stone-50"
                        >
                          <td className="p-4 font-bold text-green-900">
                            {user.fullName}
                          </td>

                          <td className="p-4 font-semibold text-stone-700">
                            {user.phone ||
                              user.credential?.phone ||
                              'SIN CELULAR'}
                          </td>

                          <td className="p-4 text-stone-700">
                            {user.village || 'SIN VEREDA'}
                          </td>

                          <td className="p-4">
                            <span
                              className={`rounded-full px-3 py-1 text-sm font-bold ${
                                currentRole === 'ADMIN'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {currentRole}
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
                              {user.credential?.isActive
                                ? 'ACTIVA'
                                : 'INACTIVA'}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {user.credential?.isActive ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeactivateCredential(user)
                                  }
                                  disabled={isCredentialBeingUpdated}
                                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isCredentialBeingUpdated
                                    ? 'DESACTIVANDO...'
                                    : 'DESACTIVAR'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleActivateCredential(user)}
                                  disabled={isCredentialBeingUpdated}
                                  className="rounded-full border border-green-200 px-4 py-2 text-sm font-bold text-green-800 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isCredentialBeingUpdated
                                    ? 'ACTIVANDO...'
                                    : 'ACTIVAR'}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleChangeRole(user)}
                                disabled={isCredentialBeingUpdated}
                                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {currentRole === 'ADMIN'
                                  ? 'HACER CLIENTE'
                                  : 'HACER ADMIN'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
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