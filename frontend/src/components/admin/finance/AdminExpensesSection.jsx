import { useEffect, useState } from 'react'
import {
  createExpense,
  deleteExpense,
  getActiveExpenses,
  updateExpense,
} from '../../../api/expensesService'

const today = new Date().toISOString().split('T')[0]

const EXPENSE_CATEGORIES = [
  { value: 'FUEL', label: 'Combustible' },
  { value: 'DELIVERY', label: 'Domicilios' },
  { value: 'PACKAGING', label: 'Empaques' },
  { value: 'INTERNET', label: 'Internet' },
  { value: 'PHONE', label: 'Teléfono' },
  { value: 'RENT', label: 'Arriendo' },
  { value: 'UTILITIES', label: 'Servicios públicos' },
  { value: 'MAINTENANCE', label: 'Mantenimiento' },
  { value: 'ADVERTISING', label: 'Publicidad' },
  { value: 'STATIONERY', label: 'Papelería' },
  { value: 'LABOR', label: 'Mano de obra' },
  { value: 'LOSS', label: 'Pérdidas' },
  { value: 'OTHER', label: 'Otro' },
]

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'CARD', label: 'Tarjeta' },
  { value: 'OTHER', label: 'Otro' },
]

const initialForm = {
  expenseDate: today,
  category: 'OTHER',
  description: '',
  amount: '',
  paymentMethod: 'CASH',
  notes: '',
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

const formatDate = (value) => {
  if (!value) {
    return 'SIN FECHA'
  }

  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

const normalizeDateInput = (value) => {
  if (!value) {
    return today
  }

  return String(value).split('T')[0]
}

const getCategoryLabel = (value) => {
  return EXPENSE_CATEGORIES.find((category) => category.value === value)?.label || value
}

const getPaymentMethodLabel = (value) => {
  return PAYMENT_METHODS.find((method) => method.value === value)?.label || value
}

export const AdminExpensesSection = ({ startDate, endDate, onDataChange }) => {
  const [expenses, setExpenses] = useState([])
  const [formData, setFormData] = useState(initialForm)
  const [editingExpenseUuid, setEditingExpenseUuid] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const isEditing = Boolean(editingExpenseUuid)

  const loadExpenses = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const data = await getActiveExpenses({
        startDate,
        endDate,
      })

      setExpenses(Array.isArray(data) ? data : [])
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'No se pudieron cargar los gastos operativos.'

      setErrorMessage(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [startDate, endDate])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const resetMessages = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const resetForm = () => {
    setFormData(initialForm)
    setEditingExpenseUuid(null)
  }

  const validateForm = () => {
    if (!formData.description.trim()) {
      setErrorMessage('La descripción del gasto es obligatoria.')
      return false
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setErrorMessage('El valor del gasto debe ser mayor a cero.')
      return false
    }

    return true
  }

  const buildPayload = () => {
    return {
      expenseDate: formData.expenseDate,
      category: formData.category,
      description: formData.description.trim(),
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      notes: formData.notes.trim() || null,
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    resetMessages()

    if (!validateForm()) {
      return
    }

    try {
      setIsSaving(true)

      if (isEditing) {
        await updateExpense(editingExpenseUuid, buildPayload())
        setSuccessMessage('Gasto operativo actualizado correctamente.')
      } else {
        await createExpense(buildPayload())
        setSuccessMessage('Gasto operativo registrado correctamente.')
      }

      resetForm()

      await loadExpenses()

      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (isEditing
          ? 'No se pudo actualizar el gasto operativo.'
          : 'No se pudo registrar el gasto operativo.')

      setErrorMessage(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (expense) => {
    resetMessages()

    setEditingExpenseUuid(expense.uuid)

    setFormData({
      expenseDate: normalizeDateInput(expense.expenseDate),
      category: expense.category || 'OTHER',
      description: expense.description || '',
      amount: String(Number(expense.amount || 0)),
      paymentMethod: expense.paymentMethod || 'CASH',
      notes: expense.notes || '',
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleCancelEdit = () => {
    resetMessages()
    resetForm()
  }

  const handleDelete = async (uuid) => {
    const confirmed = window.confirm(
      '¿Seguro que deseas eliminar este gasto operativo?',
    )

    if (!confirmed) {
      return
    }

    try {
      resetMessages()

      await deleteExpense(uuid)

      if (editingExpenseUuid === uuid) {
        resetForm()
      }

      setSuccessMessage('Gasto operativo eliminado correctamente.')

      await loadExpenses()

      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'No se pudo eliminar el gasto operativo.'

      setErrorMessage(Array.isArray(message) ? message.join(', ') : message)
    }
  }

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0,
  )

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          Control financiero
        </p>

        <h2 className="mt-1 text-2xl font-bold text-gray-900">
          Gastos operativos
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Registra y corrige gastos como arriendo, internet, empaques, gasolina, mantenimiento o mano de obra.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
          {successMessage}
        </div>
      )}

      {isEditing && (
        <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
          Estás editando un gasto operativo. Guarda los cambios o cancela la edición.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-8 grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 md:grid-cols-2"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Fecha del gasto
          </label>

          <input
            type="date"
            name="expenseDate"
            value={formData.expenseDate}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Categoría
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Descripción
          </label>

          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ejemplo: pago de internet mensual"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Valor
          </label>

          <input
            type="number"
            name="amount"
            min="0"
            step="100"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Ejemplo: 50000"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Forma de pago
          </label>

          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Notas
          </label>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Observaciones internas opcionales"
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
          />
        </div>

        <div className="flex flex-col gap-3 md:col-span-2 md:flex-row">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-xl bg-green-700 px-5 py-3 text-sm font-bold uppercase text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400 md:w-auto"
          >
            {isSaving
              ? 'Guardando...'
              : isEditing
                ? 'Actualizar gasto'
                : 'Registrar gasto'}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold uppercase text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 md:w-auto"
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          Gastos registrados
        </h3>

        <p className="text-sm font-semibold text-gray-600">
          Total gastos: {formatCurrency(totalExpenses)}
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-xl bg-gray-50 p-6 text-center text-sm font-semibold text-gray-500">
          Cargando gastos...
        </div>
      ) : expenses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
          No hay gastos registrados en este periodo.
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <article
              key={expense.uuid}
              className={`rounded-2xl border bg-white p-4 ${
                editingExpenseUuid === expense.uuid
                  ? 'border-yellow-300 ring-2 ring-yellow-100'
                  : 'border-gray-200'
              }`}
            >
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase text-green-700">
                    {getCategoryLabel(expense.category)}
                  </p>

                  <h4 className="mt-1 text-lg font-black text-gray-900">
                    {expense.description}
                  </h4>

                  <p className="mt-1 text-sm text-gray-600">
                    Fecha: {formatDate(expense.expenseDate)} | Pago:{' '}
                    {getPaymentMethodLabel(expense.paymentMethod)}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500">
                    Valor del gasto
                  </p>

                  <p className="text-xl font-black text-gray-900">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">
                  Notas
                </p>

                <p className="mt-1">
                  {expense.notes || 'Sin notas registradas.'}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-3 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={() => handleEdit(expense)}
                  disabled={isSaving}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold uppercase text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(expense.uuid)}
                  disabled={isSaving}
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold uppercase text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}