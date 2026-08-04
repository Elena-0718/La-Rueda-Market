import { useEffect, useMemo, useState } from 'react'
import { getFinancialDetail } from '../../api/financialReportService'
import { AdminExpensesSection } from '../../components/admin/finance/AdminExpensesSection'
import { AdminPurchasesSection } from '../../components/admin/finance/AdminPurchasesSection'
import { AdminPhysicalSalesSection } from '../../components/admin/finance/AdminPhysicalSalesSection'

const today = new Date().toISOString().split('T')[0]

const getFirstDayOfMonth = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}-01`
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

const getProfitStatus = (value) => {
  const profit = Number(value || 0)

  if (profit > 0) {
    return {
      label: 'UTILIDAD POSITIVA',
      className: 'bg-green-100 text-green-700 border-green-200',
    }
  }

  if (profit < 0) {
    return {
      label: 'PÉRDIDA',
      className: 'bg-red-100 text-red-700 border-red-200',
    }
  }

  return {
    label: 'SIN UTILIDAD',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  }
}

const SummaryCard = ({ title, value, description }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold text-gray-900">
        {formatCurrency(value)}
      </p>

      {description && (
        <p className="mt-2 text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
  )
}

const EmptyState = ({ message }) => {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
      {message}
    </div>
  )
}

export const AdminFinancialPage = () => {
  const [startDate, setStartDate] = useState(getFirstDayOfMonth())
  const [endDate, setEndDate] = useState(today)
  const [activeTab, setActiveTab] = useState('REPORT')
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const summary = report?.summary || null
  const details = report?.details || null

  const profitStatus = useMemo(() => {
    return getProfitStatus(summary?.result?.estimatedNetProfit)
  }, [summary])

  const loadReport = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const data = await getFinancialDetail({
        startDate,
        endDate,
      })

      setReport(data)
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'No se pudo cargar el informe financiero.'

      setErrorMessage(Array.isArray(message) ? message.join(', ') : message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    loadReport()
  }

  const handlePrint = () => {
    setActiveTab('REPORT')

    setTimeout(() => {
      window.print()
    }, 100)
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="no-print mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Administración
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Control financiero
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Consulta ingresos, compras, gastos y utilidad estimada de La Rueda Market.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold uppercase text-white transition hover:bg-gray-700"
          >
            Imprimir o guardar PDF
          </button>
        </div>

        <div className="no-print mb-6 flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('REPORT')}
            className={`rounded-xl px-4 py-3 text-sm font-bold uppercase ${
              activeTab === 'REPORT'
                ? 'bg-green-700 text-white'
                : 'bg-green-50 text-green-800 hover:bg-green-100'
            }`}
          >
            Informe
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('EXPENSES')}
            className={`rounded-xl px-4 py-3 text-sm font-bold uppercase ${
              activeTab === 'EXPENSES'
                ? 'bg-green-700 text-white'
                : 'bg-green-50 text-green-800 hover:bg-green-100'
            }`}
          >
            Gastos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PURCHASES')}
            className={`rounded-xl px-4 py-3 text-sm font-bold uppercase ${
              activeTab === 'PURCHASES'
                ? 'bg-green-700 text-white'
                : 'bg-green-50 text-green-800 hover:bg-green-100'
            }`}
          >
            Compras
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PHYSICAL_SALES')}
            className={`rounded-xl px-4 py-3 text-sm font-bold uppercase ${
              activeTab === 'PHYSICAL_SALES'
                ? 'bg-green-700 text-white'
                : 'bg-green-50 text-green-800 hover:bg-green-100'
            }`}
          >
            Ventas físicas
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="no-print mb-6 grid gap-4 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-[1fr_1fr_auto]"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Fecha inicial
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Fecha final
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-600"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-green-700 px-5 py-3 text-sm font-bold uppercase text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400 md:w-auto"
            >
              {isLoading ? 'Cargando...' : 'Consultar'}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="no-print mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {activeTab === 'EXPENSES' && (
          <AdminExpensesSection
            startDate={startDate}
            endDate={endDate}
            onDataChange={loadReport}
          />
        )}

        {activeTab === 'PURCHASES' && (
          <AdminPurchasesSection
            startDate={startDate}
            endDate={endDate}
            onDataChange={loadReport}
          />
        )}

        {activeTab === 'PHYSICAL_SALES' && (
          <AdminPhysicalSalesSection
            startDate={startDate}
            endDate={endDate}
            onDataChange={loadReport}
          />
        )}

        {activeTab === 'REPORT' && (
          <section className="print-section rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-6 border-b border-gray-200 pb-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                La Rueda Market
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Informe financiero general
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Periodo consultado: {startDate || 'SIN FECHA'} hasta {endDate || 'SIN FECHA'}
              </p>
            </div>

            {isLoading && (
              <div className="rounded-xl bg-gray-50 p-6 text-center text-sm font-semibold text-gray-500">
                Cargando informe financiero...
              </div>
            )}

            {!isLoading && summary && (
              <>
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                  <SummaryCard
                    title="Ingresos pedidos"
                    value={summary.incomes?.scheduledOrderIncome}
                    description={`${summary.incomes?.deliveredOrdersCount || 0} pedidos entregados`}
                  />

                  <SummaryCard
                    title="Ventas físicas"
                    value={summary.incomes?.physicalSalesIncome}
                    description={`${summary.incomes?.physicalSalesCount || 0} ventas registradas`}
                  />

                  <SummaryCard
                    title="Costos productos"
                    value={summary.costs?.productCosts}
                    description={`${summary.costs?.purchasesCount || 0} compras registradas`}
                  />

                  <SummaryCard
                    title="Gastos operativos"
                    value={summary.expenses?.operatingExpenses}
                    description={`${summary.expenses?.expensesCount || 0} gastos registrados`}
                  />
                </div>

                <div className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm font-semibold uppercase text-gray-500">
                        Ingreso bruto
                      </p>
                      <p className="mt-2 text-xl font-bold text-gray-900">
                        {formatCurrency(summary.incomes?.grossIncome)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold uppercase text-gray-500">
                        Costos
                      </p>
                      <p className="mt-2 text-xl font-bold text-gray-900">
                        {formatCurrency(summary.costs?.productCosts)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold uppercase text-gray-500">
                        Gastos
                      </p>
                      <p className="mt-2 text-xl font-bold text-gray-900">
                        {formatCurrency(summary.expenses?.operatingExpenses)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold uppercase text-gray-500">
                        Utilidad neta estimada
                      </p>
                      <p className="mt-2 text-xl font-bold text-gray-900">
                        {formatCurrency(summary.result?.estimatedNetProfit)}
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase ${profitStatus.className}`}
                      >
                        {profitStatus.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-white p-4 text-sm text-gray-600">
                    Margen estimado:{' '}
                    <strong className="text-gray-900">
                      {Number(summary.result?.profitMarginPercentage || 0).toFixed(2)}%
                    </strong>
                  </div>
                </div>

                <section className="mb-8">
                  <h3 className="mb-4 text-lg font-bold text-gray-900">
                    Pedidos programados entregados
                  </h3>

                  {!details?.deliveredOrders?.length ? (
                    <EmptyState message="No hay pedidos entregados en este periodo." />
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full min-w-[760px] border-collapse text-sm">
                        <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                          <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Cliente</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3">Entrega</th>
                            <th className="px-4 py-3 text-right">Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          {details.deliveredOrders.map((order) => (
                            <tr key={order.uuid} className="border-t border-gray-200">
                              <td className="px-4 py-3">
                                {formatDate(order.createdAt)}
                              </td>

                              <td className="px-4 py-3">
                                {order.user?.name || order.user?.fullName || 'CLIENTE'}
                              </td>

                              <td className="px-4 py-3">
                                {order.status}
                              </td>

                              <td className="px-4 py-3">
                                {order.fulfillmentType}
                              </td>

                              <td className="px-4 py-3 text-right font-semibold">
                                {formatCurrency(order.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="mb-8">
                  <h3 className="mb-4 text-lg font-bold text-gray-900">
                    Ventas físicas del local
                  </h3>

                  {!details?.physicalSales?.length ? (
                    <EmptyState message="No hay ventas físicas en este periodo." />
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full min-w-[760px] border-collapse text-sm">
                        <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                          <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Método de pago</th>
                            <th className="px-4 py-3">Productos</th>
                            <th className="px-4 py-3 text-right">Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          {details.physicalSales.map((sale) => (
                            <tr key={sale.uuid} className="border-t border-gray-200">
                              <td className="px-4 py-3">
                                {formatDate(sale.saleDate)}
                              </td>

                              <td className="px-4 py-3">
                                {sale.paymentMethod}
                              </td>

                              <td className="px-4 py-3">
                                {sale.details?.length || 0}
                              </td>

                              <td className="px-4 py-3 text-right font-semibold">
                                {formatCurrency(sale.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="mb-8">
                  <h3 className="mb-4 text-lg font-bold text-gray-900">
                    Compras y costos de productos
                  </h3>

                  {!details?.purchases?.length ? (
                    <EmptyState message="No hay compras registradas en este periodo." />
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full min-w-[760px] border-collapse text-sm">
                        <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                          <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Proveedor</th>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Productos</th>
                            <th className="px-4 py-3 text-right">Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          {details.purchases.map((purchase) => (
                            <tr key={purchase.uuid} className="border-t border-gray-200">
                              <td className="px-4 py-3">
                                {formatDate(purchase.purchaseDate)}
                              </td>

                              <td className="px-4 py-3">
                                {purchase.supplierName || 'SIN PROVEEDOR'}
                              </td>

                              <td className="px-4 py-3">
                                {purchase.purchaseType}
                              </td>

                              <td className="px-4 py-3">
                                {purchase.details?.length || 0}
                              </td>

                              <td className="px-4 py-3 text-right font-semibold">
                                {formatCurrency(purchase.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="mb-4 text-lg font-bold text-gray-900">
                    Gastos operativos
                  </h3>

                  {!details?.expenses?.length ? (
                    <EmptyState message="No hay gastos registrados en este periodo." />
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full min-w-[760px] border-collapse text-sm">
                        <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
                          <tr>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Categoría</th>
                            <th className="px-4 py-3">Descripción</th>
                            <th className="px-4 py-3">Pago</th>
                            <th className="px-4 py-3 text-right">Valor</th>
                          </tr>
                        </thead>

                        <tbody>
                          {details.expenses.map((expense) => (
                            <tr key={expense.uuid} className="border-t border-gray-200">
                              <td className="px-4 py-3">
                                {formatDate(expense.expenseDate)}
                              </td>

                              <td className="px-4 py-3">
                                {expense.category}
                              </td>

                              <td className="px-4 py-3">
                                {expense.description}
                              </td>

                              <td className="px-4 py-3">
                                {expense.paymentMethod}
                              </td>

                              <td className="px-4 py-3 text-right font-semibold">
                                {formatCurrency(expense.amount)}
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

            {!isLoading && !summary && !errorMessage && (
              <EmptyState message="Consulta un periodo para ver el informe financiero." />
            )}
          </section>
        )}
      </section>
    </main>
  )
}