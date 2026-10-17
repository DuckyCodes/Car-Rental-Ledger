import { Metric, Empty } from "../Ui";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  CarFront,
  ChartNoAxesCombined,
  CircleDollarSign,
  FileText,
  Gauge,
  Plus,
  Receipt,
  Settings2,
  Trash2,
  Upload,
  Wallet,
  Wrench,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { today, money, num, dateDiff, monthKey, API } from "../../model";
import type { Car, Rental, Expense, Valuation } from "../../model";

type PageContext = {
  cars: Car[];
  rentals: Rental[];
  expenses: Expense[];
  valuations: Valuation[];
  monthRentals: Rental[];
  visibleExpenses: Expense[];
  expensesFor: (identification: number) => Expense[];
  [key: string]: any;
};

export function ExpensesPage({ context }: { context: PageContext }) {
  const {
    month,
    monthRentals,
    chartData,
    setCalculationDetails,
    setMonth,
    cars,
    rentals,
    expenses,
    valuations,
    setTab,
    openNew,
    openEdit,
    remove,
    carName,
    depreciationCar,
    depreciationChartData,
    setDepreciationCarIdentification,
    money,
    num,
    today,
    rentalRevenue,
    rentalDistance,
    rentalDepreciation,
    expensesFor,
    rentalPlatformCosts,
    search,
    setSearch,
    carFilter,
    setCarFilter,
    visibleExpenses,
    exportCsv,
    backup,
    restore,
    editing,
    setEditing,
    setModal,
    save,
    refresh,
    API,
    revenue,
    completedRevenue,
    monthExpenses,
    cashExpenses,
    cashExpenseBreakdown,
    averageRentalRevenue,
    averageKilometres,
    averageDailyKilometres,
    operatingProfit,
    cashProfitBeforePrincipal,
    profit,
    cashFlow,
    principal,
    monthKm,
    estimatedDep,
    averageRevenuePerRentalDay,
    averageBookingLength,
    revenuePerKilometre,
    rentalDays,
    loanBreakdownForMonth,
    loanBreakdownThroughMonth,
    expenseAppliesToMonth,
    expenseAmountForPeriod,
    isManualFinanceEntry,
    insuranceCostForMonth,
    insuranceConfigured,
    totalVehicleKilometres,
    depreciationDescription,
  } = context;
  return (
    <>
      <div className="toolbar">
        <div>
          <h2>Expense ledger</h2>
          <p>Separate cash outflow from accounting-style operating costs.</p>
        </div>
        <button className="secondary" onClick={() => openNew("expense")}>
          <Plus size={16} /> Add expense
        </button>
      </div>
      <div className="filterbar">
        <div className="searchbox">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses, categories, vehicles…"
          />
        </div>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="all">All dates</option>
          <option value={today().slice(0, 7)}>This month</option>
          {Array.from(new Set(expenses.map((e) => monthKey(e.date))))
            .sort()
            .reverse()
            .map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
        </select>
        <select
          value={carFilter}
          onChange={(e) => setCarFilter(e.target.value)}
        >
          <option value="all">All vehicles</option>
          {cars.map((c) => (
            <option key={c.identification} value={c.identification}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="secondary" onClick={exportCsv}>
          <ArrowDownToLine size={15} /> Export CSV
        </button>
      </div>
      <div className="expense-totals">
        <div>
          <span>Visible transactions</span>
          <strong>{visibleExpenses.length}</strong>
        </div>
        <div>
          <span>Cash outflow</span>
          <strong>
            {money(visibleExpenses.reduce((s, e) => s + num(e.amount), 0))}
          </strong>
        </div>
        <div>
          <span>Operating / accounting costs</span>
          <strong>
            {money(
              visibleExpenses
                .filter((e) => e.treatment !== "loan_principal")
                .reduce((s, e) => s + num(e.amount), 0),
            )}
          </strong>
        </div>
      </div>
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Expense</th>
              <th>Vehicle / rental</th>
              <th>Treatment</th>
              <th>Receipt</th>
              <th>Amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visibleExpenses.map((e) => (
              <tr key={e.identification}>
                <td>{e.date}</td>
                <td>
                  <strong>{e.description || e.category}</strong>
                  <span className="cell-sub">{e.category}</span>
                </td>
                <td>
                  {carName(e.vehicle_identification)}
                  {e.rental_identification && (
                    <span className="cell-sub">
                      Rental #{e.rental_identification}
                    </span>
                  )}
                </td>
                <td>
                  <span
                    className={`tag ${e.treatment === "loan_principal" ? "tag-orange" : "tag-blue"}`}
                  >
                    {e.treatment === "loan_principal"
                      ? "Loan principal"
                      : e.treatment === "capital"
                        ? "Capital asset"
                        : "Operating cost"}
                  </span>
                </td>
                <td>
                  {e.receipt_path ? (
                    <a
                      className="receipt-link"
                      href={`${API}/receipt/${encodeURIComponent(e.receipt_path.split("/").pop() || "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FileText size={15} /> View
                    </a>
                  ) : (
                    <span className="cell-sub">—</span>
                  )}
                </td>
                <td className="amount-cell">{money(num(e.amount))}</td>
                <td>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      onClick={() => openEdit("expense", e)}
                    >
                      <Settings2 size={16} />
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={() => remove("expenses", e.identification)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleExpenses.length === 0 && (
          <div className="empty-inline">No expenses match these filters.</div>
        )}
      </div>
    </>
  );
}
