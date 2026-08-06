import { useEffect, useState } from 'react'
import { getCashClosings } from '../../../api/cashClosingsService'
import { getCashDeposits } from '../../../api/cashDepositsService'

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

const getCustomerName = (record) => {
  return (
    record?.customerUser?.name ||
    record?.customerUser?.fullName ||
    record?.user?.name ||
    record?.user?.fullName ||
    record?.customerName ||
    'CLIENTE'
  )
}

const getCustomerPhone = (record) => {
  return (
    record?.customerUser?.phone ||
    record?.customerUser?.cellphone ||
    record?.user?.phone ||
    record?.user?.cellphone ||
    '-'
  )
}

const getNotes = (record) => {
  return record?.notes || record?.observation || record?.observations || '-'
}

const EmptyState = ({ message }) => {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
      {message}
    </div>
  )
}

const ReportTable = ({ title, headers, children, emptyMessage }) => {
  const hasRows = Boolean(children)

  return (
    <section className="mb-8">
      <h3 className="mb-4 text-lg font-bold text-gray-900">
        {title}
      </h3>

      {!hasRows ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-4 py-3">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {children}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export const AdminAccountantReportSection = ({
  startDate,
  endDate,
  report,
  isLoading,
}) => {
  const [cashClosings, setCashClosings] = useState([])
  const [cashDeposits, setCashDeposits] = useState([])
  const [isCashLoading, setIsCashLoading] = useState(false)
  const [cashErrorMessage, setCashErrorMessage] = useState('')

  const summary = report?.summary || null
  const details = report?.details || null

  const loadCashData = async () => {
    try {
      setIsCashLoading(true)
      setCashErrorMessage('')

      const [closingsData, depositsData] = await Promise.all([
        getCashClosings({ startDate, endDate }),
        getCashDeposits({ startDate, endDate }),
      ])

      setCashClosings(closingsData)
      setCashDeposits(depositsData)
    } catch (error) {
      const responseMessage =
        error?.response?.data?.message ||
        'No se pudo cargar la información de caja para el informe.'

      setCashErrorMessage(
        Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage,
      )
    } finally {
      setIsCashLoading(false)
    }
  }

  useEffect(() => {
    loadCashData()
  }, [startDate, endDate])

  if (isLoading || isCashLoading) {
    return (
      <section className="print-section rounded-2xl bg-white p-5 shadow-sm">
        <div className="rounded-xl bg-gray-50 p-6 text-center text-sm font-semibold text-gray-500">
          Cargando informe para contador...
        </div>
      </section>
    )
  }

  if (!summary) {
    return (
      <section className="print-section rounded-2xl bg-white p-5 shadow-sm">
        <EmptyState message="Consulta un periodo para generar el informe para contador." />
      </section>
    )
  }

  return (
    <section className="print-section rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-6 border-b border-gray-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
          La Rueda Market
        </p>

        <h2 className="mt-1 text-2xl font-bold text-gray-900">
          Informe financiero para contador
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Periodo consultado: {startDate || 'SIN FECHA'} hasta{' '}
          {endDate || 'SIN FECHA'}
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Este informe consolida ingresos, compras, gastos, ventas físicas,
          pedidos entregados, cierres de caja, consignaciones y notas con
          enlaces de soporte registrados en el sistema.
        </p>
      </div>

      {cashErrorMessage && (
        <div className="no-print mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-700">
          {cashErrorMessage}
        </div>
      )}

      <section className="mb-8">
        <h3 className="mb-4 text-lg font-bold text-gray-900">
          1. Resumen del periodo
        </h3>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="bg-gray-100 text-left text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Concepto</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3">Detalle</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t border-gray-200">
                <td className="px-4 py-3">Ingresos por pedidos entregados</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrency(summary.incomes?.scheduledOrderIncome)}
                </td>
                <td className="px-4 py-3">
                  {summary.incomes?.deliveredOrdersCount || 0} pedidos
                  entregados
                </td>
              </tr>

              <tr className="border-t border-gray-200">
                <td className="px-4 py-3">Ingresos por ventas físicas</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrency(summary.incomes?.physicalSalesIncome)}
                </td>
                <td className="px-4 py-3">
                  {summary.incomes?.physicalSalesCount || 0} ventas físicas
                </td>
              </tr>

              <tr className="border-t border-gray-200">
                <td className="px-4 py-3">Ingreso bruto total</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrency(summary.incomes?.grossIncome)}
                </td>
                <td className="px-4 py-3">
                  Pedidos entregados más ventas físicas
                </td>
              </tr>

              <tr className="border-t border-gray-200">
                <td className="px-4 py-3">Compras / costos de productos</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrency(summary.costs?.productCosts)}
                </td>
                <td className="px-4 py-3">
                  {summary.costs?.purchasesCount || 0} compras registradas
                </td>
              </tr>

              <tr className="border-t border-gray-200">
                <td className="px-4 py-3">Gastos operativos</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrency(summary.expenses?.operatingExpenses)}
                </td>
                <td className="px-4 py-3">
                  {summary.expenses?.expensesCount || 0} gastos registrados
                </td>
              </tr>

              <tr className="border-t border-gray-200 bg-gray-50">
                <td className="px-4 py-3 font-bold">
                  Utilidad neta estimada
                </td>
                <td className="px-4 py-3 text-right font-bold">
                  {formatCurrency(summary.result?.estimatedNetProfit)}
                </td>
                <td className="px-4 py-3">
                  Margen estimado:{' '}
                  {Number(summary.result?.profitMarginPercentage || 0).toFixed(2)}
                  %
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <ReportTable
        title="2. Pedidos programados entregados"
        headers={[
          'Fecha',
          'Cliente',
          'Celular',
          'Estado',
          'Entrega',
          'Total',
          'Observaciones',
        ]}
        emptyMessage="No hay pedidos entregados en este periodo."
      >
        {details?.deliveredOrders?.length
          ? details.deliveredOrders.map((order) => (
              <tr key={order.uuid} className="border-t border-gray-200">
                <td className="px-4 py-3">
                  {formatDate(order.createdAt)}
                </td>

                <td className="px-4 py-3">
                  {getCustomerName(order)}
                </td>

                <td className="px-4 py-3">
                  {getCustomerPhone(order)}
                </td>

                <td className="px-4 py-3">
                  {order.status || '-'}
                </td>

                <td className="px-4 py-3">
                  {order.fulfillmentType || '-'}
                </td>

                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrency(order.total)}
                </td>

                <td className="px-4 py-3 whitespace-pre-wrap">
                  {getNotes(order)}
                </td>
              </tr>
            ))
          : null}
      </ReportTable>

      <ReportTable
        title="3. Ventas físicas"
        headers={[
          'Fecha',
          'Cliente',
          'Forma de pago',
          'Subtotal',
          'Total recibido',
          'Notas / soporte',
        ]}
        emptyMessage="No hay ventas físicas en este periodo."
      >
        {details?.physicalSales?.length
          ? details.physicalSales.map((sale) => (
              <tr key={sale.uuid} className="border-t border-gray-200">
                <td className="px-4 py-3">
                  {formatDate(sale.saleDate)}
                </td>

                <td className="px-4 py-3">
                  {getCustomerName(sale)}
                </td>

                <td className="px-4 py-3">
                  {sale.paymentMethod || '-'}
                </td>

                <td className="px-4 py-3 text-right">
                  {formatCurrency(sale.subtotal)}
                </td>

                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrency(sale.total)}
                </td>

                <td className="px-4 py-3 whitespace-pre-wrap">
                  {getNotes(sale)}
                </td>
              </tr>
            ))
          : null}
      </ReportTable>

      <ReportTable
        title="4. Compras a proveedores"
        headers={[
          'Fecha',
          'Proveedor',
          'Tipo de compra',
          'Productos',
          'Total',
          'Notas / soporte',
        ]}
        emptyMessage="No hay compras registradas en este periodo."
      >
        {details?.purchases?.length
          ? details.purchases.map((purchase) => (
              <tr key={purchase.uuid} className="border-t border-gray-200">
                <td className="px-4 py-3">
                  {formatDate(purchase.purchaseDate)}
                </td>

                <td className="px-4 py-3">
                  {purchase.supplierName || 'SIN PROVEEDOR'}
                </td>

                <td className="px-4 py-3">
                  {purchase.purchaseType || '-'}
                </td>

                <td className="px-4 py-3">
                  {purchase.details?.length || 0}
                </td>

                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrency(purchase.total)}
                </td>

                <td className="px-4 py-3 whitespace-pre-wrap">
                  {getNotes(purchase)}
                </td>
              </tr>
            ))
          : null}
      </ReportTable>

      <ReportTable
        title="5. Gastos operativos"
        headers={[
          'Fecha',
          'Categoría',
          'Descripción',
          'Forma de pago',
          'Valor',
          'Notas / soporte',
        ]}
        emptyMessage="No hay gastos registrados en este periodo."
      >
        {details?.expenses?.length
          ? details.expenses.map((expense) => (
              <tr key={expense.uuid} className="border-t border-gray-200">
                <td className="px-4 py-3">
                  {formatDate(expense.expenseDate)}
                </td>

                <td className="px-4 py-3">
                  {expense.category || '-'}
                </td>

                <td className="px-4 py-3">
                  {expense.description || '-'}
                </td>

                <td className="px-4 py-3">
                  {expense.paymentMethod || '-'}
                </td>

                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrency(expense.amount)}
                </td>

                <td className="px-4 py-3 whitespace-pre-wrap">
                  {getNotes(expense)}
                </td>
              </tr>
            ))
          : null}
      </ReportTable>

      <ReportTable
        title="6. Cierres diarios de caja"
        headers={[
          'Fecha',
          'Responsable',
          'Saldo inicial',
          'Ventas efectivo',
          'Gastos efectivo',
          'Consignaciones',
          'Retiros',
          'Saldo esperado',
          'Saldo contado',
          'Diferencia',
          'Notas',
        ]}
        emptyMessage="No hay cierres de caja en este periodo."
      >
        {cashClosings?.length
          ? cashClosings.map((closing) => (
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

                <td className="px-4 py-3 text-right font-bold">
                  {formatCurrency(closing.difference)}
                </td>

                <td className="px-4 py-3 whitespace-pre-wrap">
                  {closing.notes || '-'}
                </td>
              </tr>
            ))
          : null}
      </ReportTable>

      <ReportTable
        title="7. Consignaciones y traslados a banco"
        headers={[
          'Fecha',
          'Valor',
          'Medio',
          'Cuenta destino',
          'Comprobante',
          'Responsable',
          'Notas / soporte',
        ]}
        emptyMessage="No hay consignaciones registradas en este periodo."
      >
        {cashDeposits?.length
          ? cashDeposits.map((deposit) => (
              <tr key={deposit.uuid} className="border-t border-gray-200">
                <td className="px-4 py-3">
                  {formatDate(deposit.depositDate)}
                </td>

                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrency(deposit.amount)}
                </td>

                <td className="px-4 py-3">
                  {deposit.depositMethod || '-'}
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

                <td className="px-4 py-3 whitespace-pre-wrap">
                  {deposit.notes || '-'}
                </td>
              </tr>
            ))
          : null}
      </ReportTable>

      <section className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
        <h3 className="mb-2 font-bold uppercase text-gray-900">
          Observaciones para el contador
        </h3>

        <p>
          Este informe corresponde a un control financiero interno de La Rueda
          Market. La clasificación contable, fiscal y tributaria será revisada
          y registrada por el contador con base en los soportes suministrados.
        </p>

        <p className="mt-2">
          Los enlaces de soporte se registran en el campo de notas de compras,
          gastos, ventas físicas y consignaciones cuando aplique.
        </p>
      </section>
    </section>
  )
}