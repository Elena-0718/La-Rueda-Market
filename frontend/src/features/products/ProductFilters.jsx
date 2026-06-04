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

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
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

        <div>
          <label
            htmlFor="category"
            className="mb-2 block font-semibold text-green-900"
          >
            FILTRAR POR CATEGORÍA
          </label>

          <select
            id="category"
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full rounded-2xl border border-green-200 px-4 py-4 text-lg outline-none focus:border-green-700"
          >
            <option value="all">TODAS LAS CATEGORÍAS</option>

            {categories.map((category) => (
              <option key={category.uuid} value={category.uuid}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}

export default ProductFilters