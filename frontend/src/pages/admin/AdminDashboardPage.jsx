import { useNavigate } from 'react-router-dom'

function AdminDashboardPage() {
  const navigate = useNavigate()

  const modules = [
    {
      title: 'PEDIDOS Y ENTREGAS',
      description:
        'REVISA PEDIDOS, CONFIRMA PAGOS Y GESTIONA DOMICILIOS PROGRAMADOS DESDE UN SOLO LUGAR.',
      buttonText: 'GESTIONAR PEDIDOS',
      path: '/admin/pedidos',
      enabled: true,
    },
    {
      title: 'PRODUCTOS',
      description:
        'CREA, EDITA Y ACTIVA LOS PRODUCTOS QUE SE MUESTRAN EN LA TIENDA.',
      buttonText: 'GESTIONAR PRODUCTOS',
      path: '/admin/productos',
      enabled: true,
    },
    {
      title: 'CATEGORÍAS',
      description:
        'ORGANIZA LOS PRODUCTOS POR SECCIONES CLARAS PARA EL CLIENTE.',
      buttonText: 'GESTIONAR CATEGORÍAS',
      path: '/admin/categorias',
      enabled: true,
    },
    {
      title: 'USUARIOS',
      description:
        'REVISA CLIENTES, ADMINISTRADORES Y ESTADO DE LAS CUENTAS.',
      buttonText: 'GESTIONAR USUARIOS',
      path: '/admin/usuarios',
      enabled: true,
    },
    {
  title: 'INVENTARIO',
  description:
    'CONTROLA ENTRADAS, SALIDAS, STOCK FÍSICO, VENCIMIENTOS Y ALERTAS.',
  buttonText: 'GESTIONAR INVENTARIO',
  path: '/admin/inventario',
  enabled: true,
},
  ]

  return (
    <main className="p-6">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-3xl bg-white p-8 shadow">
          <p className="text-sm font-bold tracking-[0.25em] text-green-700">
            LA RUEDA MARKET
          </p>

          <h1 className="mt-2 text-4xl font-black text-green-900">
            PANEL ADMINISTRATIVO
          </h1>

          <p className="mt-3 max-w-3xl text-stone-700">
            DESDE AQUÍ PUEDES GESTIONAR LA OPERACIÓN DE LA TIENDA:
            PEDIDOS, PRODUCTOS, CATEGORÍAS, USUARIOS E INVENTARIO.
          </p>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <article
              key={module.title}
              className="flex min-h-[210px] flex-col justify-between rounded-3xl bg-white p-6 shadow"
            >
              <div>
                <h2 className="text-2xl font-black text-green-900">
                  {module.title}
                </h2>

                <p className="mt-3 leading-relaxed text-stone-700">
                  {module.description}
                </p>
              </div>

              <button
                type="button"
                disabled={!module.enabled}
                onClick={() => navigate(module.path)}
                className={`mt-6 rounded-2xl px-5 py-3 font-black ${
                  module.enabled
                    ? 'bg-green-800 text-white hover:bg-green-900'
                    : 'cursor-not-allowed bg-stone-200 text-stone-500'
                }`}
              >
                {module.buttonText}
              </button>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}

export default AdminDashboardPage