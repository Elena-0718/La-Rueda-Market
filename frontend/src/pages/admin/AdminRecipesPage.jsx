import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createRecipeAdmin,
  deleteRecipeAdmin,
  getAllRecipesAdmin,
  updateRecipeAdmin,
} from '../../api/recipesService'
import { getProducts } from '../../api/productsService'

const initialForm = {
  title: '',
  description: '',
  videoUrl: '',
  category: 'OTHER',
  difficulty: 'EASY',
  preparationTime: '',
  servings: '',
  ingredientNotes: '',
  stepsText: '',
  extraIngredientsText: '',
  tips: '',
  isActive: true,
  isFeatured: false,
  mainProductUuids: [],
  productUuids: [],
}

const categoryOptions = [
  { value: 'BEEF', label: 'CARNE DE RES' },
  { value: 'CHICKEN', label: 'POLLO' },
  { value: 'PORK', label: 'CERDO' },
  { value: 'FISH', label: 'PESCADO' },
  { value: 'QUICK', label: 'RÁPIDAS' },
  { value: 'ECONOMIC', label: 'ECONÓMICAS' },
  { value: 'LUNCH', label: 'ALMUERZO' },
  { value: 'DINNER', label: 'CENA' },
  { value: 'OTHER', label: 'OTRAS' },
]

const getCategoryLabel = (category) => {
  return categoryOptions.find((item) => item.value === category)?.label || category
}

function AdminRecipesPage() {
  const navigate = useNavigate()

  const [recipes, setRecipes] = useState([])
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState(initialForm)
  const [editingRecipeUuid, setEditingRecipeUuid] = useState(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const summary = useMemo(() => {
    return {
      total: recipes.length,
      active: recipes.filter((recipe) => recipe.isActive).length,
      featured: recipes.filter((recipe) => recipe.isFeatured).length,
    }
  }, [recipes])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const [recipesData, productsData] = await Promise.all([
        getAllRecipesAdmin(),
        getProducts(),
      ])

      setRecipes(recipesData)

      const productsList = Array.isArray(productsData)
        ? productsData
        : productsData?.data || []

      setProducts(productsList)
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        'NO SE PUDO CARGAR LA INFORMACIÓN DE RECETAS.'

      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage.join(' ')
          : backendMessage,
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleMainProductToggle = (productUuid) => {
    setFormData((current) => {
      const alreadySelected = current.mainProductUuids.includes(productUuid)

      return {
        ...current,
        mainProductUuids: alreadySelected
          ? current.mainProductUuids.filter((uuid) => uuid !== productUuid)
          : [...current.mainProductUuids, productUuid],
      }
    })
  }

  const handleProductToggle = (productUuid) => {
    setFormData((current) => {
      const alreadySelected = current.productUuids.includes(productUuid)

      return {
        ...current,
        productUuids: alreadySelected
          ? current.productUuids.filter((uuid) => uuid !== productUuid)
          : [...current.productUuids, productUuid],
      }
    })
  }

  const buildPayload = () => {
    const steps = formData.stepsText
      .split('\n')
      .map((step) => step.trim())
      .filter(Boolean)

    const extraIngredients = formData.extraIngredientsText
      .split('\n')
      .map((ingredient) => ingredient.trim())
      .filter(Boolean)

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      difficulty: formData.difficulty,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      mainProductUuids: formData.mainProductUuids,
      productUuids: formData.productUuids,
    }

    if (formData.videoUrl.trim()) payload.videoUrl = formData.videoUrl.trim()

    if (formData.preparationTime) {
      payload.preparationTime = Number(formData.preparationTime)
    }

    if (formData.servings) {
      payload.servings = Number(formData.servings)
    }

    if (formData.ingredientNotes.trim()) {
      payload.ingredientNotes = formData.ingredientNotes.trim()
    }

    if (steps.length) {
      payload.steps = steps
    }

    if (extraIngredients.length) {
      payload.extraIngredients = extraIngredients
    }

    if (formData.tips.trim()) {
      payload.tips = formData.tips.trim()
    }

    return payload
  }

  const resetForm = () => {
    setFormData(initialForm)
    setEditingRecipeUuid(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMessage('EL TÍTULO Y LA DESCRIPCIÓN SON OBLIGATORIOS.')
      return
    }

    if (formData.mainProductUuids.length === 0) {
      setErrorMessage(
        'DEBES SELECCIONAR AL MENOS UN PRODUCTO PRINCIPAL PARA ACTIVAR VER RECETAS.',
      )
      return
    }

    if (formData.productUuids.length === 0) {
      setErrorMessage(
        'DEBES SELECCIONAR AL MENOS UN PRODUCTO RECOMENDADO DENTRO DE LA RECETA.',
      )
      return
    }

    try {
      setIsWorking(true)
      setErrorMessage('')
      setSuccessMessage('')

      const payload = buildPayload()

      if (editingRecipeUuid) {
        await updateRecipeAdmin({
          recipeUuid: editingRecipeUuid,
          recipeData: payload,
        })

        setSuccessMessage('RECETA ACTUALIZADA CORRECTAMENTE.')
      } else {
        await createRecipeAdmin(payload)
        setSuccessMessage('RECETA CREADA CORRECTAMENTE.')
      }

      resetForm()
      await loadData()
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        'NO SE PUDO GUARDAR LA RECETA.'

      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage.join(' ')
          : backendMessage,
      )
    } finally {
      setIsWorking(false)
    }
  }

  const handleEdit = (recipe) => {
    setEditingRecipeUuid(recipe.uuid)

    setFormData({
      title: recipe.title || '',
      description: recipe.description || '',
      videoUrl: recipe.videoUrl || '',
      category: recipe.category || 'OTHER',
      difficulty: recipe.difficulty || 'EASY',
      preparationTime: recipe.preparationTime || '',
      servings: recipe.servings || '',
      ingredientNotes: recipe.ingredientNotes || '',
      stepsText: recipe.steps?.join('\n') || '',
      extraIngredientsText: recipe.extraIngredients?.join('\n') || '',
      tips: recipe.tips || '',
      isActive: Boolean(recipe.isActive),
      isFeatured: Boolean(recipe.isFeatured),
      mainProductUuids:
        recipe.mainProducts?.map((product) => product.uuid) || [],
      productUuids: recipe.products?.map((product) => product.uuid) || [],
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (recipeUuid) => {
    const confirmed = window.confirm('¿SEGURO QUE QUIERES ELIMINAR ESTA RECETA?')

    if (!confirmed) return

    try {
      setIsWorking(true)
      setErrorMessage('')
      setSuccessMessage('')

      await deleteRecipeAdmin(recipeUuid)
      setSuccessMessage('RECETA ELIMINADA CORRECTAMENTE.')
      await loadData()
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        'NO SE PUDO ELIMINAR LA RECETA.'

      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage.join(' ')
          : backendMessage,
      )
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <main className="p-6">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-3xl bg-white p-8 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-bold tracking-widest text-green-700">
                PANEL ADMIN
              </p>

              <h1 className="mt-2 text-4xl font-black text-green-900">
                RECETAS
              </h1>

              <p className="mt-3 max-w-3xl text-stone-700">
                CREA RECETAS CON VIDEO, PRODUCTOS PRINCIPALES Y PRODUCTOS
                RECOMENDADOS PARA QUE EL CLIENTE PUEDA ELEGIR QUÉ NECESITA
                COMPRAR.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="rounded-full border border-green-800 px-5 py-3 font-black text-green-900 hover:bg-green-50"
            >
              VOLVER AL PANEL
            </button>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm font-black text-stone-500">RECETAS</p>
            <p className="mt-2 text-3xl font-black text-green-900">
              {summary.total}
            </p>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm font-black text-stone-500">ACTIVAS</p>
            <p className="mt-2 text-3xl font-black text-green-900">
              {summary.active}
            </p>
          </article>

          <article className="rounded-3xl bg-white p-5 shadow">
            <p className="text-sm font-black text-stone-500">DESTACADAS</p>
            <p className="mt-2 text-3xl font-black text-green-900">
              {summary.featured}
            </p>
          </article>
        </section>

        {successMessage && (
          <p className="mt-6 rounded-2xl bg-green-100 p-4 font-bold text-green-800">
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <p className="mt-6 rounded-2xl bg-red-100 p-4 font-bold text-red-700">
            {errorMessage}
          </p>
        )}

        {isLoading && (
          <p className="mt-6 rounded-2xl bg-white p-5 font-semibold text-stone-700 shadow">
            CARGANDO RECETAS...
          </p>
        )}

        {!isLoading && (
          <>
            <form
              onSubmit={handleSubmit}
              className="mt-6 rounded-3xl bg-white p-6 shadow"
            >
              <h2 className="text-2xl font-black text-green-900">
                {editingRecipeUuid ? 'EDITAR RECETA' : 'CREAR RECETA'}
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label>
                  <span className="text-sm font-black text-stone-700">
                    TÍTULO
                  </span>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                  />
                </label>

                <label>
                  <span className="text-sm font-black text-stone-700">
                    URL DEL VIDEO
                  </span>
                  <input
                    type="text"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="text-sm font-black text-stone-700">
                    DESCRIPCIÓN
                  </span>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                  />
                </label>

                <label>
                  <span className="text-sm font-black text-stone-700">
                    CATEGORÍA
                  </span>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                  >
                    {categoryOptions.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="text-sm font-black text-stone-700">
                    DIFICULTAD
                  </span>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                  >
                    <option value="EASY">FÁCIL</option>
                    <option value="MEDIUM">MEDIA</option>
                  </select>
                </label>

                <label>
                  <span className="text-sm font-black text-stone-700">
                    TIEMPO EN MINUTOS
                  </span>
                  <input
                    type="number"
                    name="preparationTime"
                    min="1"
                    value={formData.preparationTime}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                  />
                </label>

                <label>
                  <span className="text-sm font-black text-stone-700">
                    PORCIONES
                  </span>
                  <input
                    type="number"
                    name="servings"
                    min="1"
                    value={formData.servings}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="text-sm font-black text-stone-700">
                    NOTAS DE INGREDIENTES
                  </span>
                  <textarea
                    name="ingredientNotes"
                    value={formData.ingredientNotes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Ej: Puedes prepararla con carne de res, cerdo o pollo. Elige la proteína que prefieras."
                    className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                  />
                </label>

                <label>
                  <span className="text-sm font-black text-stone-700">
                    PASOS, UNO POR LÍNEA
                  </span>
                  <textarea
                    name="stepsText"
                    value={formData.stepsText}
                    onChange={handleChange}
                    rows="6"
                    className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                  />
                </label>

                <label>
                  <span className="text-sm font-black text-stone-700">
                    INGREDIENTES EXTRA, UNO POR LÍNEA
                  </span>
                  <textarea
                    name="extraIngredientsText"
                    value={formData.extraIngredientsText}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Sal&#10;Pimienta&#10;Agua"
                    className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="text-sm font-black text-stone-700">
                    CONSEJO
                  </span>
                  <textarea
                    name="tips"
                    value={formData.tips}
                    onChange={handleChange}
                    rows="3"
                    className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 font-semibold outline-none focus:border-green-700"
                  />
                </label>

                <div className="md:col-span-2">
                  <p className="text-sm font-black text-green-900">
                    PRODUCTOS PRINCIPALES QUE ACTIVAN “VER RECETAS”
                  </p>

                  <p className="mt-1 text-xs font-semibold text-stone-500">
                    SELECCIONA SOLO LOS PRODUCTOS DESDE LOS CUALES EL CLIENTE
                    PODRÁ LLEGAR A ESTA RECETA. EJEMPLO: CARNE MOLIDA, POLLO O
                    CERDO.
                  </p>

                  <div className="mt-3 grid max-h-72 gap-3 overflow-y-auto rounded-2xl border border-green-200 bg-green-50 p-4 md:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                      <label
                        key={product.uuid}
                        className="flex items-center gap-3 rounded-2xl bg-white p-3"
                      >
                        <input
                          type="checkbox"
                          checked={formData.mainProductUuids.includes(
                            product.uuid,
                          )}
                          onChange={() => handleMainProductToggle(product.uuid)}
                          className="h-5 w-5"
                        />

                        <span className="font-bold text-green-900">
                          {product.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm font-black text-stone-700">
                    PRODUCTOS RECOMENDADOS DENTRO DE LA RECETA
                  </p>

                  <p className="mt-1 text-xs font-semibold text-stone-500">
                    SELECCIONA TODOS LOS PRODUCTOS QUE EL CLIENTE PODRÁ ELEGIR
                    PARA PREPARAR ESTA RECETA, INCLUYENDO EL PRODUCTO PRINCIPAL
                    SI TAMBIÉN LO QUIERES MOSTRAR PARA COMPRA.
                  </p>

                  <div className="mt-3 grid max-h-72 gap-3 overflow-y-auto rounded-2xl border border-stone-200 p-4 md:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                      <label
                        key={product.uuid}
                        className="flex items-center gap-3 rounded-2xl bg-stone-50 p-3"
                      >
                        <input
                          type="checkbox"
                          checked={formData.productUuids.includes(product.uuid)}
                          onChange={() => handleProductToggle(product.uuid)}
                          className="h-5 w-5"
                        />

                        <span className="font-bold text-stone-700">
                          {product.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 rounded-2xl border border-stone-200 p-4">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-5 w-5"
                  />
                  <span className="font-black text-stone-700">
                    RECETA ACTIVA
                  </span>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-stone-200 p-4">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="h-5 w-5"
                  />
                  <span className="font-black text-stone-700">
                    RECETA DESTACADA
                  </span>
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isWorking}
                  className="rounded-2xl bg-green-800 px-5 py-3 font-black text-white hover:bg-green-900 disabled:bg-stone-400"
                >
                  {editingRecipeUuid ? 'GUARDAR CAMBIOS' : 'CREAR RECETA'}
                </button>

                {editingRecipeUuid && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-2xl border border-stone-400 px-5 py-3 font-black text-stone-700 hover:bg-stone-100"
                  >
                    CANCELAR EDICIÓN
                  </button>
                )}
              </div>
            </form>

            <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow">
              <div className="border-b border-stone-100 p-6">
                <h2 className="text-2xl font-black text-green-900">
                  RECETAS REGISTRADAS
                </h2>
              </div>

              {recipes.length === 0 ? (
                <p className="p-6 font-semibold text-stone-700">
                  AÚN NO HAY RECETAS REGISTRADAS.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-left">
                    <thead className="bg-green-50 text-sm text-green-950">
                      <tr>
                        <th className="px-5 py-4 font-black">RECETA</th>
                        <th className="px-5 py-4 font-black">CATEGORÍA</th>
                        <th className="px-5 py-4 font-black">PRINCIPALES</th>
                        <th className="px-5 py-4 font-black">RECOMENDADOS</th>
                        <th className="px-5 py-4 font-black">ESTADO</th>
                        <th className="px-5 py-4 font-black">ACCIONES</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recipes.map((recipe) => (
                        <tr
                          key={recipe.uuid}
                          className="border-b border-stone-100 align-top"
                        >
                          <td className="px-5 py-5">
                            <p className="font-black text-green-950">
                              {recipe.title}
                            </p>
                            <p className="mt-1 text-sm text-stone-600">
                              {recipe.description}
                            </p>
                          </td>

                          <td className="px-5 py-5 font-bold text-stone-700">
                            {getCategoryLabel(recipe.category)}
                          </td>

                          <td className="px-5 py-5">
                            <p className="font-bold text-green-800">
                              {recipe.mainProducts?.length || 0} PRODUCTOS
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <p className="font-bold text-stone-700">
                              {recipe.products?.length || 0} PRODUCTOS
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex flex-col gap-2">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                                  recipe.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {recipe.isActive ? 'ACTIVA' : 'INACTIVA'}
                              </span>

                              {recipe.isFeatured && (
                                <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                                  DESTACADA
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(recipe)}
                                className="rounded-full bg-green-800 px-4 py-2 text-xs font-black text-white hover:bg-green-900"
                              >
                                EDITAR
                              </button>

                              <button
                                type="button"
                                disabled={isWorking}
                                onClick={() => handleDelete(recipe.uuid)}
                                className="rounded-full border border-red-500 px-4 py-2 text-xs font-black text-red-700 hover:bg-red-50 disabled:border-stone-300 disabled:text-stone-400"
                              >
                                ELIMINAR
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  )
}

export default AdminRecipesPage