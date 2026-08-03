import { useEffect, useMemo, useState } from 'react'
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
  const [searchText, setSearchText] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const filteredRecipes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return recipes
    }

    return recipes.filter((recipe) => {
      const title = recipe.title?.toLowerCase() || ''
      const description = recipe.description?.toLowerCase() || ''
      const ingredientNotes = recipe.ingredientNotes?.toLowerCase() || ''
      const tips = recipe.tips?.toLowerCase() || ''

      const mainProductsText =
        recipe.mainProducts
          ?.map((product) => product.name)
          .join(' ')
          .toLowerCase() || ''

      const productsText =
        recipe.products
          ?.map((product) => product.name)
          .join(' ')
          .toLowerCase() || ''

      const extraIngredientsText =
        recipe.extraIngredients
          ?.join(' ')
          .toLowerCase() || ''

      return (
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        ingredientNotes.includes(normalizedSearch) ||
        tips.includes(normalizedSearch) ||
        mainProductsText.includes(normalizedSearch) ||
        productsText.includes(normalizedSearch) ||
        extraIngredientsText.includes(normalizedSearch)
      )
    })
  }, [recipes, searchTerm])

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

  const handleSearchRecipes = (event) => {
    event.preventDefault()
    setSearchTerm(searchText)
  }

  const handleClearSearch = () => {
    setSearchText('')
    setSearchTerm('')
  }

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

        {!isLoading && recipes.length > 0 && (
          <section className="mt-6 rounded-3xl bg-white p-6 shadow">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-green-900">
                  BUSCAR RECETAS
                </h2>

                <p className="mt-1 text-sm font-semibold text-stone-600">
                  {filteredRecipes.length} DE {recipes.length} RECETAS
                  DISPONIBLES
                </p>

                {searchTerm && (
                  <p className="mt-1 text-sm font-semibold text-stone-600">
                    BÚSQUEDA: {searchTerm}
                  </p>
                )}
              </div>

              <form
                onSubmit={handleSearchRecipes}
                className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto"
              >
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Buscar receta o producto"
                  className="rounded-full border border-stone-300 px-4 py-3 text-sm font-semibold outline-none focus:border-green-700"
                />

                <button
                  type="submit"
                  className="rounded-full bg-green-800 px-5 py-3 text-xs font-black text-white hover:bg-green-900"
                >
                  BUSCAR
                </button>

                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="rounded-full border border-green-800 px-5 py-3 text-xs font-black text-green-900 hover:bg-green-50"
                  >
                    VER TODAS
                  </button>
                )}
              </form>
            </div>
          </section>
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

        {!isLoading && recipes.length > 0 && filteredRecipes.length === 0 && (
          <section className="mt-6 rounded-3xl bg-white p-8 text-center shadow">
            <h2 className="text-2xl font-black text-green-900">
              NO ENCONTRAMOS RECETAS PARA ESA BÚSQUEDA
            </h2>

            <p className="mt-3 text-stone-700">
              Intenta buscar por producto. Por ejemplo: pechuga, carne molida,
              pescado, costilla o pasta.
            </p>

            <button
              type="button"
              onClick={handleClearSearch}
              className="mt-5 rounded-2xl border border-green-800 px-5 py-3 font-black text-green-900 hover:bg-green-50"
            >
              VER TODAS LAS RECETAS
            </button>
          </section>
        )}

        {!isLoading && filteredRecipes.length > 0 && (
          <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredRecipes.map((recipe) => (
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