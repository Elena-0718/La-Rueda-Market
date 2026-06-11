function CategoryForm({
  formData,
  isSubmitting,
  submitLabel,
  onChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="mt-8 rounded-3xl bg-white p-6 shadow">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold text-green-900">
            NOMBRE DE LA CATEGORÍA
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="EJEMPLO: ABARROTES"
            className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none focus:border-green-700"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold text-green-900">
            ORDEN
          </label>

          <input
            type="number"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={onChange}
            placeholder="EJEMPLO: 1"
            className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none focus:border-green-700"
            min="1"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block font-semibold text-green-900">
            DESCRIPCIÓN
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="DESCRIBE QUÉ PRODUCTOS IRÁN EN ESTA CATEGORÍA."
            rows="4"
            className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none focus:border-green-700"
            required
          />
        </div>
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

export default CategoryForm