function ProductFilters({
  categories,
  searchText,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
}) {
  return (
    <section className="mt-8 rounded-3xl bg-white p-5 shadow">
      <h2 className="text-2xl font-bold text-green-900">
        BUSCAR PRODUCTOS
      </h2>

      <div className="mt-5">
        <label
          htmlFor="search"
          className="mb-2 block font-semibold text-green-900"
        >
          BUSCAR POR NOMBRE
        </label>

        <input
          id="search"
          type="text"
          value={searchText}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="EJEMPLO: ARROZ, JABÓN, TOMATE..."
          className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
        />
      </div>

      <div className="mt-6">
        <p className="mb-3 font-semibold text-green-900">
          FILTRAR POR CATEGORÍA
        </p>

        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => onCategoryChange('all')}
            className={`shrink-0 rounded-full px-5 py-3 font-bold ${
              selectedCategory === 'all'
                ? 'bg-green-800 text-white'
                : 'bg-green-100 text-green-900'
            }`}
          >
            TODAS
          </button>

          {categories.map((category) => (
            <button
              key={category.uuid}
              type="button"
              onClick={() => onCategoryChange(category.uuid)}
              className={`shrink-0 rounded-full px-5 py-3 font-bold ${
                selectedCategory === category.uuid
                  ? 'bg-green-800 text-white'
                  : 'bg-green-100 text-green-900'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductFilters