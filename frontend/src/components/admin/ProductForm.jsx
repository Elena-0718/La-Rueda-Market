const API_URL = 'http://localhost:3000'

function ProductForm({
  formData,
  categories,
  selectedImage,
  imagePreview,
  isSubmitting,
  submitLabel,
  isImageRequired = true,
  onChange,
  onImageChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="mt-8 rounded-3xl bg-white p-6 shadow">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold text-green-900">
            NOMBRE DEL PRODUCTO
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="EJEMPLO: ARROZ DIANA 500G"
            className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none focus:border-green-700"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold text-green-900">
            PRECIO
          </label>

          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={onChange}
            placeholder="EJEMPLO: 3200"
            className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none focus:border-green-700"
            min="0"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold text-green-900">
            STOCK
          </label>

          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={onChange}
            placeholder="EJEMPLO: 50"
            className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none focus:border-green-700"
            min="0"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold text-green-900">
            CATEGORÍA
          </label>

          <select
            name="categoryUuid"
            value={formData.categoryUuid}
            onChange={onChange}
            className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none focus:border-green-700"
            required
          >
            <option value="">SELECCIONA UNA CATEGORÍA</option>

            {categories.map((category) => (
              <option key={category.uuid} value={category.uuid}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold text-green-900">
            UNIDAD DE MEDIDA
          </label>

          <select
            name="unitMeasure"
            value={formData.unitMeasure}
            onChange={onChange}
            className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none focus:border-green-700"
            required
          >
            <option value="unit">UNIDAD</option>
            <option value="lb">LIBRA</option>
            <option value="bag">BOLSA</option>
            <option value="bottle">BOTELLA</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold text-green-900">
            DISPONIBILIDAD
          </label>

          <select
            name="availabilityType"
            value={formData.availabilityType}
            onChange={onChange}
            className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none focus:border-green-700"
            required
          >
            <option value="daily">DISPONIBLE HOY</option>
            <option value="scheduled">BAJO PEDIDO</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block font-semibold text-green-900">
            DESCRIPCIÓN
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="DESCRIBE EL PRODUCTO DE FORMA CLARA."
            rows="4"
            className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none focus:border-green-700"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block font-semibold text-green-900">
            IMAGEN DEL PRODUCTO
          </label>

          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={onImageChange}
            className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none focus:border-green-700"
            required={isImageRequired}
          />

          <p className="mt-2 text-sm font-semibold text-stone-500">
            FORMATOS PERMITIDOS: JPG, JPEG, PNG O WEBP. MÁXIMO 3MB.
          </p>

          {!isImageRequired && (
            <p className="mt-2 text-sm font-semibold text-stone-500">
              SI NO SELECCIONAS UNA NUEVA IMAGEN, SE CONSERVA LA ACTUAL.
            </p>
          )}

          {selectedImage && (
            <p className="mt-2 text-sm font-semibold text-green-800">
              IMAGEN SELECCIONADA: {selectedImage.name}
            </p>
          )}

          {imagePreview && (
            <div className="mt-4">
              <p className="mb-2 font-semibold text-green-900">
                VISTA PREVIA
              </p>

              <img
                src={
                  imagePreview.startsWith('/uploads')
                    ? `${API_URL}${imagePreview}`
                    : imagePreview
                }
                alt="Vista previa del producto"
                className="h-56 w-full rounded-3xl object-cover md:w-96"
              />
            </div>
          )}
        </div>

        <label className="flex items-center gap-3 font-semibold text-green-900">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={onChange}
            className="h-5 w-5"
          />
          PRODUCTO DESTACADO
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 rounded-2xl bg-green-800 px-6 py-3 font-bold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'GUARDANDO...' : submitLabel}
      </button>
    </form>
  )
}

export default ProductForm