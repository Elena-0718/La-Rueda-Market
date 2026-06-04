function App() {
  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <section className="bg-white rounded-3xl shadow-lg p-8 max-w-md text-center">
        <p className="text-sm font-semibold tracking-widest text-green-700">
          BIENVENIDO A
        </p>

        <h1 className="mt-2 text-4xl font-bold text-green-900">
          LA RUEDA MARKET
        </h1>

        <p className="mt-4 text-lg text-stone-700">
          TU MERCADO MÁS CERCA
        </p>

        <button className="mt-6 w-full rounded-2xl bg-green-700 px-6 py-4 text-xl font-semibold text-white">
          VER PRODUCTOS
        </button>
      </section>
    </main>
  )
}

export default App