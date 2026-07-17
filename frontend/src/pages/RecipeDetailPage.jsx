import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getActiveRecipeByUuid } from '../api/recipesService'

const getUnitLabel = (unitMeasure) => {
  const units = {
    unit: 'UNIDAD',
    lb: 'LIBRA',
    bag: 'BOLSA',
    bottle: 'BOTELLA',
  }

  return units[unitMeasure] || unitMeasure?.toUpperCase() || 'UNIDAD'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

const getYoutubeEmbedUrl = (url) => {
  if (!url) return ''

  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }

  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }

  return url
}

function RecipeDetailPage() {
  const { uuid } = useParams()
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const data = await getActiveRecipeByUuid(uuid)
        setRecipe(data)
      } catch (error) {
        const backendMessage =
          error?.response?.data?.message ||
          'NO SE PUDO CARGAR LA RECETA.'

        setErrorMessage(
          Array.isArray(backendMessage)
            ? backendMessage.join(' ')
            : backendMessage,
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadRecipe()
  }, [uuid])

  if (isLoading) {
    return (
      <main className="bg-stone-50 px-6 py-8">
        <section className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow">
          <p className="font-semibold text-stone-700">CARGANDO RECETA...</p>
        </section>
      </main>
    )
  }

  if (errorMessage) {
    return (
      <main className="bg-stone-50 px-6 py-8">
        <section className="mx-auto max-w-5xl rounded-3xl bg-red-100 p-8 shadow">
          <p className="font-bold text-red-700">{errorMessage}</p>
        </section>
      </main>
    )
  }

  if (!recipe) return null

  const embedUrl = getYoutubeEmbedUrl(recipe.videoUrl)

  return (
    <main className="bg-stone-50 px-6 py-8">
      <section className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate('/recetas')}
          className="mb-5 rounded-full border border-green-800 px-5 py-3 font-black text-green-900 hover:bg-green-50"
        >
          VOLVER A RECETAS
        </button>

        <article className="rounded-3xl bg-white p-8 shadow">
          <p className="text-sm font-bold tracking-[0.25em] text-green-700">
            RECETA
          </p>

          <h1 className="mt-2 text-4xl font-black text-green-900">
            {recipe.title}
          </h1>

          <p className="mt-3 max-w-3xl text-stone-700">
            {recipe.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-stone-600">
            {recipe.preparationTime && (
              <span className="rounded-full bg-stone-100 px-3 py-1">
                {recipe.preparationTime} MINUTOS
              </span>
            )}

            {recipe.servings && (
              <span className="rounded-full bg-stone-100 px-3 py-1">
                {recipe.servings} PORCIONES
              </span>
            )}
          </div>

          {embedUrl && (
            <div className="mt-8 overflow-hidden rounded-3xl bg-stone-100">
              <iframe
                src={embedUrl}
                title={recipe.title}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </article>

        <section className="mt-6 rounded-3xl bg-white p-8 shadow">
          <h2 className="text-2xl font-black text-green-900">
            PRODUCTOS PARA ESTA RECETA
          </h2>

          <p className="mt-2 text-stone-700">
            SELECCIONA LOS PRODUCTOS QUE NECESITES PARA PREPARAR ESTA RECETA.
            PUEDES ELEGIR LA CANTIDAD DE CADA PRODUCTO ANTES DE AGREGARLO AL
            CARRITO.
          </p>

          {recipe.ingredientNotes && (
            <p className="mt-4 rounded-2xl bg-green-50 p-4 font-semibold text-green-900">
              {recipe.ingredientNotes}
            </p>
          )}

          {recipe.products?.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {recipe.products.map((product) => (
                <article
                  key={product.uuid}
                  className="rounded-3xl border border-stone-200 p-5"
                >
                  <p className="text-xl font-black text-green-900">
                    {product.name}
                  </p>

                  <p className="mt-2 text-sm font-semibold text-stone-600">
                    POR: {getUnitLabel(product.unitMeasure)}
                  </p>

                  <p className="mt-3 text-2xl font-black text-green-800">
                    {formatCurrency(product.price)}
                  </p>

                  <Link
                    to={`/productos/${product.uuid}/comprar?fromRecipe=${recipe.uuid}`}
                    className="mt-5 block rounded-2xl bg-green-800 px-5 py-3 text-center font-black text-white hover:bg-green-900"
                  >
                    ELEGIR CANTIDAD
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl bg-stone-100 p-4 font-semibold text-stone-700">
              ESTA RECETA AÚN NO TIENE PRODUCTOS RELACIONADOS.
            </p>
          )}
        </section>

        {recipe.extraIngredients?.length > 0 && (
          <section className="mt-6 rounded-3xl bg-white p-8 shadow">
            <h2 className="text-2xl font-black text-green-900">
              OTROS INGREDIENTES
            </h2>

            <ul className="mt-4 list-inside list-disc space-y-2 font-semibold text-stone-700">
              {recipe.extraIngredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </section>
        )}

        {recipe.steps?.length > 0 && (
          <section className="mt-6 rounded-3xl bg-white p-8 shadow">
            <h2 className="text-2xl font-black text-green-900">
              PREPARACIÓN
            </h2>

            <ol className="mt-4 space-y-3">
              {recipe.steps.map((step, index) => (
                <li key={`${step}-${index}`} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-800 font-black text-white">
                    {index + 1}
                  </span>

                  <span className="pt-1 font-semibold text-stone-700">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {recipe.tips && (
          <section className="mt-6 rounded-3xl bg-green-50 p-8 shadow">
            <h2 className="text-2xl font-black text-green-900">
              CONSEJO
            </h2>

            <p className="mt-3 font-semibold text-green-900">
              {recipe.tips}
            </p>
          </section>
        )}
      </section>
    </main>
  )
}

export default RecipeDetailPage