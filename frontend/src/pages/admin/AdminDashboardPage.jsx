import { Link } from 'react-router-dom'

function AdminDashboardPage() {
  return (
    <main className="p-6">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-3xl bg-white p-8 shadow">
          <p className="text-sm font-semibold tracking-widest text-green-700">
            LA RUEDA MARKET
          </p>

          <h1 className="mt-2 text-3xl font-bold text-green-900">
            PANEL ADMINISTRATIVO
          </h1>

          <p className="mt-3 text-stone-700">
            DESDE AQUÍ PODRÁS GESTIONAR PRODUCTOS, CATEGORÍAS Y USUARIOS.
          </p>
        </header>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold text-green-900">
              PRODUCTOS
            </h2>

            <p className="mt-3 text-stone-700">
              CONSULTA Y ADMINISTRA LOS PRODUCTOS DISPONIBLES EN LA TIENDA.
            </p>

            <Link
              to="/admin/productos"
              className="mt-5 inline-block rounded-2xl bg-green-800 px-5 py-3 font-bold text-white"
            >
              GESTIONAR PRODUCTOS
            </Link>
          </article>

          <article className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold text-green-900">
              CATEGORÍAS
            </h2>

            <p className="mt-3 text-stone-700">
              ORGANIZA LOS PRODUCTOS POR SECCIONES CLARAS PARA EL CLIENTE.
            </p>

            <Link
              to="/admin/categorias"
              className="mt-5 inline-block rounded-2xl bg-green-800 px-5 py-3 font-bold text-white"
            >
              GESTIONAR CATEGORÍAS
            </Link>
          </article>

          <article className="rounded-3xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold text-green-900">
              USUARIOS
            </h2>

            <p className="mt-3 text-stone-700">
              REVISA CLIENTES, ADMINISTRADORES Y ESTADO DE LAS CUENTAS.
            </p>

            <Link
              to="/admin/usuarios"
              className="mt-5 inline-block rounded-2xl bg-green-800 px-5 py-3 font-bold text-white"
            >
              GESTIONAR USUARIOS
            </Link>
          </article>
        </div>
      </section>
    </main>
  )
}

export default AdminDashboardPage