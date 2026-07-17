import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getActiveRecipes } from '../api/recipesService'

const getCategoryLabel = (category) => {
  const labels = {
    BEEF: 'CARNE DE RES',
    CHICKEN: 'POLLO',
    PORK: 'CERDO',
    FISH: 'PESCADO',
    QUICK: 'RÁPIDAS',
    ECONOMIC: 'ECONÓMICAS',
    LUNCH: 'ALMUERZO',
    DINNER: 'CENA',
    OTHER: 'OTRAS',
  }

  return labels[category] || 'RECETA'
}

function RecipesPage() {
  const [searchParams] = useSearchParams()
  const productUuid = searchParams.get('productUuid')

  const [recipes, setRecipes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const data = await getActiveRecipes(productUuid)
        setRecipes(data)
      } catch (error) {
        const backendMessage =
          error?.response?.data?.message ||
          'NO SE PUDIERON CARGAR LAS RECETAS.'

        setErrorMessage(
          Array.isArray(backendMessage)
            ? backendMessage.join(' ')
            : backendMessage,
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadRecipes()
  }, [productUuid])

  return (
    <main className="bg-stone-50 px-6 py-8">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-3xl bg-white p-8 shadow">
          <p className="text-sm font-bold tracking-[0.25em] text-green-700">
            LA RUEDA MARKET
          </p>

          <h1 className="mt-2 text-4xl font-black text-green-900">
            RECETAS PARA TU HOGAR
          </h1>

          <p className="mt-3 max-w-3xl text-stone-700">
            ENCUENTRA IDEAS FÁCILES PARA PREPARAR TUS PRODUCTOS. SELECCIONA
            LOS PRODUCTOS QUE NECESITES Y ELIGE LA CANTIDAD ANTES DE AGREGARLOS
            AL CARRITO.
          </p>
        </header>

        {isLoading && (
          <p className="mt-6 rounded-2xl bg-white p-5 font-semibold text-stone-700 shadow">
            CARGANDO RECETAS...
          </p>
        )}

        {errorMessage && (
          <p className="mt-6 rounded-2xl bg-red-100 p-4 font-bold text-red-700">
            {errorMessage}
          </p>
        )}

        {!isLoading && recipes.length === 0 && (
          <section className="mt-6 rounded-3xl bg-white p-8 text-center shadow">
            <h2 className="text-2xl font-black text-green-900">
              AÚN NO HAY RECETAS DISPONIBLES
            </h2>

            <p className="mt-3 text-stone-700">
              PRONTO ENCONTRARÁS IDEAS PARA PREPARAR TUS PRODUCTOS.
            </p>
          </section>
        )}

        {!isLoading && recipes.length > 0 && (
          <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recipes.map((recipe) => (
              <article
                key={recipe.uuid}
                className="flex min-h-[260px] flex-col justify-between rounded-3xl bg-white p-6 shadow"
              >
                <div>
                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">
                    {getCategoryLabel(recipe.category)}
                  </span>

                  <h2 className="mt-4 text-2xl font-black text-green-900">
                    {recipe.title}
                  </h2>

                  <p className="mt-3 text-stone-700">
                    {recipe.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-stone-600">
                    {recipe.preparationTime && (
                      <span>{recipe.preparationTime} MIN</span>
                    )}

                    {recipe.servings && (
                      <span>{recipe.servings} PORCIONES</span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/recetas/${recipe.uuid}`}
                  className="mt-6 rounded-2xl bg-green-800 px-5 py-3 text-center font-black text-white hover:bg-green-900"
                >
                  VER RECETA
                </Link>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  )
}

export default RecipesPage