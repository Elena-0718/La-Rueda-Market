import { useEffect, useMemo, useState } from 'react'
import {
  createCashClosing,
  deleteCashClosing,
  getCashClosings,
  updateCashClosing,
} from '../../../api/cashClosingsService'
import {
  createCashDeposit,
  deleteCashDeposit,
  getCashDeposits,
  updateCashDeposit,
} from '../../../api/cashDepositsService'

const today = new Date().toISOString().split('T')[0]

const initialClosingForm = {
  closingDate: today,
  responsibleName: '',
  initialCash: '',
  cashSales: '',
  cashOrderPayments: '',
  cashExpenses: '',
  cashDeposits: '',
  cashWithdrawals: '',
  countedCash: '',
  notes: '',
}

const initialDepositForm = {
  depositDate: today,
  amount: '',
  depositMethod: 'BANK_DEPOSIT',
  destinationAccount: '',
  receiptNumber: '',
  responsibleName: '',
  notes: '',
}

const depositMethods = [
  { value: 'BANK_DEPOSIT', label: 'Consignación bancaria' },
  { value: 'BANK_TRANSFER', label: 'Transferencia bancaria' },
  { value: 'NEQUI', label: 'Nequi' },
  { value: 'DAVIPLATA', label: 'Daviplata' },
  { value: 'CASH_CORRESPONDENT', label: 'Corresponsal bancario' },
  { value: 'OTHER', label: 'Otro' },
]

const getDepositMethodLabel = (value) => {
  const method = depositMethods.find((item) => item.value === value)
  return method?.label || value || '-'
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

const getDateInputValue = (value) => {
  if (!value) {
    return today
  }

  return String(value).split('T')[0]
}

const toNumber = (value) => {
  return Number(value || 0)
}

const EmptyState = ({ message }) => {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
      {message}
    </div>
  )
}

export const AdminCashSection = ({ startDate, endDate, onDataChange }) => {
  const [activeCashTab, setActiveCashTab] = useState('CLOSINGS')
  const [cashClosings, setCashClosings] = useState([])
  const [cashDeposits, setCashDeposits] = useState([])
  const [closingForm, setClosingForm] = useState(initialClosingForm)
  const [depositForm, setDepositForm] = useState(initialDepositForm)
  const [editingClosingUuid, setEditingClosingUuid] = useState(null)
  const [editingDepositUuid, setEditingDepositUuid] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const expectedCash = useMemo(() => {
    return (
      toNumber(closingForm.initialCash) +
      toNumber(closingForm.cashSales) +
      toNumber(closingForm.cashOrderPayments) -
      toNumber(closingForm.cashExpenses) -
      toNumber(closingForm.cashDeposits) -
      toNumber(closingForm.cashWithdrawals)
    )
  }, [closingForm])

  const difference = useMemo(() => {
    return toNumber(closingForm.countedCash) - expectedCash
  }, [closingForm.countedCash, expectedCash])

  const loadCashData = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const [closingsData, depositsData] = await Promise.all([
        getCashClosings({ startDate, endDate }),
        getCashDeposits({ startDate, endDate }),
      ])

      setCashClosings(Array.isArray(closingsData) ? closingsData : [])
      setCashDeposits(Array.isArray(depositsData) ? depositsData : [])
    } catch (error) {
      const responseMessage =
        error?.response?.data?.message ||
        'No se pudo cargar la información de caja.'

      setErrorMessage(
        Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage,
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCashData()
  }, [startDate, endDate])

  const handleClosingChange = (event) => {
    const { name, value } = event.target

    setClosingForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleDepositChange = (event) => {
    const { name, value } = event.target

    setDepositForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const resetClosingForm = () => {
    setClosingForm(initialClosingForm)
    setEditingClosingUuid(null)
  }

  const resetDepositForm = () => {
    setDepositForm(initialDepositForm)
    setEditingDepositUuid(null)
  }

  const handleSubmitClosing = async (event) => {
    event.preventDefault()

    try {
      setIsSaving(true)
      setMessage('')
      setErrorMessage('')

      const payload = {
        closingDate: closingForm.closingDate,
        responsibleName: closingForm.responsibleName || undefined,
        initialCash: toNumber(closingForm.initialCash),
        cashSales: toNumber(closingForm.cashSales),
        cashOrderPayments: toNumber(closingForm.cashOrderPayments),
        cashExpenses: toNumber(closingForm.cashExpenses),
        cashDeposits: toNumber(closingForm.cashDeposits),
        cashWithdrawals: toNumber(closingForm.cashWithdrawals),
        countedCash: toNumber(closingForm.countedCash),
        notes: closingForm.notes || undefined,
      }

      if (editingClosingUuid) {
        await updateCashClosing(editingClosingUuid, payload)
        setMessage('Cierre de caja actualizado correctamente.')
      } else {
        await createCashClosing(payload)
        setMessage('Cierre de caja registrado correctamente.')
      }

      resetClosingForm()
      await loadCashData()

      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      const responseMessage =
        error?.response?.data?.message ||
        'No se pudo guardar el cierre de caja.'

      setErrorMessage(
        Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage,
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmitDeposit = async (event) => {
    event.preventDefault()

    try {
      setIsSaving(true)
      setMessage('')
      setErrorMessage('')

      const payload = {
        depositDate: depositForm.depositDate,
        amount: toNumber(depositForm.amount),
        depositMethod: depositForm.depositMethod,
        destinationAccount: depositForm.destinationAccount || undefined,
        receiptNumber: depositForm.receiptNumber || undefined,
        responsibleName: depositForm.responsibleName || undefined,
        notes: depositForm.notes || undefined,
      }

      if (editingDepositUuid) {
        await updateCashDeposit(editingDepositUuid, payload)
        setMessage('Consignación actualizada correctamente.')
      } else {
        await createCashDeposit(payload)
        setMessage('Consignación registrada correctamente.')
      }

      resetDepositForm()
      await loadCashData()

      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      const responseMessage =
        error?.response?.data?.message ||
        'No se pudo guardar la consignación.'

      setErrorMessage(
        Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage,
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditClosing = (closing) => {
    setActiveCashTab('CLOSINGS')
    setEditingClosingUuid(closing.uuid)

    setClosingForm({
      closingDate: getDateInputValue(closing.closingDate),
      responsibleName: closing.responsibleName || '',
      initialCash: String(closing.initialCash || ''),
      cashSales: String(closing.cashSales || ''),
      cashOrderPayments: String(closing.cashOrderPayments || ''),
      cashExpenses: String(closing.cashExpenses || ''),
      cashDeposits: String(closing.cashDeposits || ''),
      cashWithdrawals: String(closing.cashWithdrawals || ''),
      countedCash: String(closing.countedCash || ''),
      notes: closing.notes || '',
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleEditDeposit = (deposit) => {
    setActiveCashTab('DEPOSITS')
    setEditingDepositUuid(deposit.uuid)

    setDepositForm({
      depositDate: getDateInputValue(deposit.depositDate),
      amount: String(deposit.amount || ''),
      depositMethod: deposit.depositMethod || 'BANK_DEPOSIT',
      destinationAccount: deposit.destinationAccount || '',
      receiptNumber: deposit.receiptNumber || '',
      responsibleName: deposit.responsibleName || '',
      notes: deposit.notes || '',
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleDeleteClosing = async (uuid) => {
    const confirmed = window.confirm(
      '¿Seguro que deseas anular este cierre de caja?',
    )

    if (!confirmed) {
      return
    }

    try {
      setIsSaving(true)
      setMessage('')
      setErrorMessage('')

      await deleteCashClosing(uuid)

      if (editingClosingUuid === uuid) {
        resetClosingForm()
      }

      setMessage('Cierre de caja anulado correctamente.')
      await loadCashData()

      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      const responseMessage =
        error?.response?.data?.message ||
        'No se pudo anular el cierre de caja.'

      setErrorMessage(
        Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage,
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteDeposit = async (uuid) => {
    const confirmed = window.confirm(
      '¿Seguro que deseas anular esta consignación o traslado?',
    )

    if (!confirmed) {
      return
    }

    try {
      setIsSaving(true)
      setMessage('')
      setErrorMessage('')

      await deleteCashDeposit(uuid)

      if (editingDepositUuid === uuid) {
        resetDepositForm()
      }

      setMessage('Consignación o traslado anulado correctamente.')
      await loadCashData()

      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      const responseMessage =
        error?.response?.data?.message ||
        'No se pudo anular la consignación o traslado.'

      setErrorMessage(
        Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage,
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-5 border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Caja diaria y traslados
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Registra cierres diarios de caja, pagos en efectivo recibidos por
          ventas físicas y pedidos programados, gastos en efectivo y traslados
          desde caja hacia banco, Nequi o Daviplata. Estos datos se usarán en el
          informe para contador.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActiveCashTab('CLOSINGS')}
          className={`rounded-xl px-4 py-3 text-sm font-bold uppercase ${
            activeCashTab === 'CLOSINGS'
              ? 'bg-green-700 text-white'
              : 'bg-green-50 text-green-800 hover:bg-green-100'
          }`}
        >
          Cierres de caja
        </button>

        <button
          type="button"
          onClick={() => setActiveCashTab('DEPOSITS')}
          className={`rounded-xl px-4 py-3 text-sm font-bold uppercase ${
            activeCashTab === 'DEPOSITS'
              ? 'bg-green-700 text-white'
              : 'bg-green-50 text-green-800 hover:bg-green-100'
          }`}
        >
          Traslados a banco
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {editingClosingUuid && activeCashTab === 'CLOSINGS' && (
        <div className="mb-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
          Estás editando un cierre de caja. Puedes corregir fecha, responsable,
          valores del cuadre, saldo contado y notas. Si este cierre ya fue
          revisado por el contador, deja una aclaración en notas.
        </div>
      )}

      {editingDepositUuid && activeCashTab === 'DEPOSITS' && (
        <div className="mb-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
          Estás editando un traslado a banco o billetera. Puedes actualizar
          fecha, valor, medio, cuenta destino, comprobante, responsable y
          soporte en notas.
        </div>
      )}

      {activeCashTab === 'CLOSINGS' && (
        <>
          <form
            onSubmit={handleSubmitClosing}
            className="mb-6 grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 md:grid-cols-3"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Fecha cierre
              </label>
              <input
                type="date"
                name="closingDate"
                value={closingForm.closingDate}
                onChange={handleClosingChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Responsable
              </label>
              <input
                type="text"
                name="responsibleName"
                value={closingForm.responsibleName}
                onChange={handleClosingChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                placeholder="Ej: Administrador"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Saldo inicial
              </label>
              <input
                type="number"
                name="initialCash"
                value={closingForm.initialCash}
                onChange={handleClosingChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                min="0"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Ventas físicas en efectivo
              </label>
              <input
                type="number"
                name="cashSales"
                value={closingForm.cashSales}
                onChange={handleClosingChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500">
                Dinero recibido en efectivo por ventas realizadas directamente
                en el local o punto físico.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Pedidos pagados en efectivo
              </label>
              <input
                type="number"
                name="cashOrderPayments"
                value={closingForm.cashOrderPayments}
                onChange={handleClosingChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500">
                Dinero recibido en efectivo por pedidos programados entregados.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Gastos pagados en efectivo
              </label>
              <input
                type="number"
                name="cashExpenses"
                value={closingForm.cashExpenses}
                onChange={handleClosingChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500">
                Dinero que salió de caja para pagar gastos del día.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Consignaciones realizadas / traslados a banco
              </label>
              <input
                type="number"
                name="cashDeposits"
                value={closingForm.cashDeposits}
                onChange={handleClosingChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500">
                Dinero que sale de la caja física hacia banco, Nequi, Daviplata
                u otra cuenta. No son pagos recibidos de clientes.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Retiros de caja
              </label>
              <input
                type="number"
                name="cashWithdrawals"
                value={closingForm.cashWithdrawals}
                onChange={handleClosingChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500">
                Otros retiros de efectivo que no corresponden a gastos ni
                consignaciones.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Saldo contado
              </label>
              <input
                type="number"
                name="countedCash"
                value={closingForm.countedCash}
                onChange={handleClosingChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                min="0"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Dinero físico contado al finalizar el día.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-bold uppercase text-gray-500">
                Fórmula de caja
              </p>

              <p className="mt-2 text-xs text-gray-600">
                Saldo inicial + ventas físicas + pedidos en efectivo - gastos -
                traslados - retiros.
              </p>

              <p className="mt-4 text-xs font-bold uppercase text-gray-500">
                Saldo esperado
              </p>
              <p className="mt-2 text-lg font-bold text-gray-900">
                {formatCurrency(expectedCash)}
              </p>

              <p className="mt-3 text-xs font-bold uppercase text-gray-500">
                Diferencia
              </p>
              <p
                className={`mt-2 text-lg font-bold ${
                  difference < 0
                    ? 'text-red-700'
                    : difference > 0
                      ? 'text-green-700'
                      : 'text-gray-900'
                }`}
              >
                {formatCurrency(difference)}
              </p>
            </div>

            <div className="md:col-span-3">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Notas
              </label>
              <textarea
                name="notes"
                value={closingForm.notes}
                onChange={handleClosingChange}
                className="min-h-[90px] w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                placeholder="Ej: faltante de $2.000 pendiente por revisar."
              />
            </div>

            <div className="flex flex-col gap-3 md:col-span-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-green-700 px-5 py-3 text-sm font-bold uppercase text-white transition hover:bg-green-800 disabled:bg-gray-400"
              >
                {isSaving
                  ? 'Guardando...'
                  : editingClosingUuid
                    ? 'Actualizar cierre'
                    : 'Registrar cierre'}
              </button>

              {editingClosingUuid && (
                <button
                  type="button"
                  onClick={resetClosingForm}
                  disabled={isSaving}
                  className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-bold uppercase text-gray-700 transition hover:bg-gray-100 disabled:bg-gray-100"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>

          {isLoading ? (
            <div className="rounded-xl bg-gray-50 p-6 text-center text-sm font-semibold text-gray-500">
              Cargando cierres de caja...
            </div>
          ) : !cashClosings.length ? (
            <EmptyState message="No hay cierres de caja en este periodo." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[1280px] border-collapse text-sm">
                <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Responsable</th>
                    <th className="px-4 py-3 text-right">Inicial</th>
                    <th className="px-4 py-3 text-right">Ventas físicas</th>
                    <th className="px-4 py-3 text-right">Pedidos efectivo</th>
                    <th className="px-4 py-3 text-right">Gastos</th>
                    <th className="px-4 py-3 text-right">Traslados</th>
                    <th className="px-4 py-3 text-right">Retiros</th>
                    <th className="px-4 py-3 text-right">Esperado</th>
                    <th className="px-4 py-3 text-right">Contado</th>
                    <th className="px-4 py-3 text-right">Diferencia</th>
                    <th className="px-4 py-3">Notas</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {cashClosings.map((closing) => (
                    <tr key={closing.uuid} className="border-t border-gray-200">
                      <td className="px-4 py-3">
                        {formatDate(closing.closingDate)}
                      </td>

                      <td className="px-4 py-3">
                        {closing.responsibleName || '-'}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatCurrency(closing.initialCash)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatCurrency(closing.cashSales)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatCurrency(closing.cashOrderPayments)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatCurrency(closing.cashExpenses)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatCurrency(closing.cashDeposits)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatCurrency(closing.cashWithdrawals)}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(closing.expectedCash)}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(closing.countedCash)}
                      </td>

                      <td
                        className={`px-4 py-3 text-right font-bold ${
                          Number(closing.difference || 0) < 0
                            ? 'text-red-700'
                            : Number(closing.difference || 0) > 0
                              ? 'text-green-700'
                              : 'text-gray-900'
                        }`}
                      >
                        {formatCurrency(closing.difference)}
                      </td>

                      <td className="px-4 py-3">
                        {closing.notes || '-'}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditClosing(closing)}
                            disabled={isSaving}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold uppercase text-blue-700 hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteClosing(closing.uuid)}
                            disabled={isSaving}
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold uppercase text-red-700 hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            Anular
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeCashTab === 'DEPOSITS' && (
        <>
          <form
            onSubmit={handleSubmitDeposit}
            className="mb-6 grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 md:grid-cols-3"
          >
            <div className="md:col-span-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              Este formulario registra dinero que La Rueda Market traslada desde
              la caja hacia banco, Nequi, Daviplata u otra cuenta. No uses este
              espacio para registrar pagos de clientes; esos pagos deben quedar
              en ventas, pedidos o en el cierre de caja según corresponda.
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Fecha
              </label>
              <input
                type="date"
                name="depositDate"
                value={depositForm.depositDate}
                onChange={handleDepositChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Valor trasladado
              </label>
              <input
                type="number"
                name="amount"
                value={depositForm.amount}
                onChange={handleDepositChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                min="1"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Medio de traslado
              </label>
              <select
                name="depositMethod"
                value={depositForm.depositMethod}
                onChange={handleDepositChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
              >
                {depositMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Cuenta destino
              </label>
              <input
                type="text"
                name="destinationAccount"
                value={depositForm.destinationAccount}
                onChange={handleDepositChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                placeholder="Ej: Bancolombia ahorros, Nequi, Daviplata"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Comprobante
              </label>
              <input
                type="text"
                name="receiptNumber"
                value={depositForm.receiptNumber}
                onChange={handleDepositChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                placeholder="Ej: 458921 o enlace de soporte"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Responsable
              </label>
              <input
                type="text"
                name="responsibleName"
                value={depositForm.responsibleName}
                onChange={handleDepositChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                placeholder="Ej: Administrador"
              />
            </div>

            <div className="md:col-span-3">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Notas / enlace soporte
              </label>
              <textarea
                name="notes"
                value={depositForm.notes}
                onChange={handleDepositChange}
                className="min-h-[90px] w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
                placeholder="Ej: Soporte: https://drive.google.com/..."
              />
            </div>

            <div className="flex flex-col gap-3 md:col-span-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-green-700 px-5 py-3 text-sm font-bold uppercase text-white transition hover:bg-green-800 disabled:bg-gray-400"
              >
                {isSaving
                  ? 'Guardando...'
                  : editingDepositUuid
                    ? 'Actualizar traslado'
                    : 'Registrar traslado'}
              </button>

              {editingDepositUuid && (
                <button
                  type="button"
                  onClick={resetDepositForm}
                  disabled={isSaving}
                  className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-bold uppercase text-gray-700 transition hover:bg-gray-100 disabled:bg-gray-100"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>

          {isLoading ? (
            <div className="rounded-xl bg-gray-50 p-6 text-center text-sm font-semibold text-gray-500">
              Cargando traslados...
            </div>
          ) : !cashDeposits.length ? (
            <EmptyState message="No hay traslados registrados en este periodo." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[980px] border-collapse text-sm">
                <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3">Medio</th>
                    <th className="px-4 py-3">Cuenta destino</th>
                    <th className="px-4 py-3">Comprobante</th>
                    <th className="px-4 py-3">Responsable</th>
                    <th className="px-4 py-3">Notas</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {cashDeposits.map((deposit) => (
                    <tr key={deposit.uuid} className="border-t border-gray-200">
                      <td className="px-4 py-3">
                        {formatDate(deposit.depositDate)}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(deposit.amount)}
                      </td>

                      <td className="px-4 py-3">
                        {getDepositMethodLabel(deposit.depositMethod)}
                      </td>

                      <td className="px-4 py-3">
                        {deposit.destinationAccount || '-'}
                      </td>

                      <td className="px-4 py-3">
                        {deposit.receiptNumber || '-'}
                      </td>

                      <td className="px-4 py-3">
                        {deposit.responsibleName || '-'}
                      </td>

                      <td className="px-4 py-3">
                        {deposit.notes || '-'}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditDeposit(deposit)}
                            disabled={isSaving}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold uppercase text-blue-700 hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteDeposit(deposit.uuid)}
                            disabled={isSaving}
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold uppercase text-red-700 hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            Anular
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  )
}