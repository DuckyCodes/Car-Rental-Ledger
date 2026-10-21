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

export function OverviewPage({ context }: { context: PageContext }) {
  const {
    month,
    allTimeBasis,
    setAllTimeBasis,
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
    totalDepreciation,
    depreciationDescription,
  } = context;
  const showCalculation = (details: {
    title: string;
    definition: string;
    formula: string;
    items: { label: string; value: string }[];
  }) => setCalculationDetails(details);
  const completedRentals = monthRentals.filter((r) => r.end_date <= today());
  return (
    <>
      <div className="toolbar">
        <div>
          <h2>At a glance</h2>
          <p>Track revenue, spending and vehicle economics.</p>
        </div>
        <div className="period-controls">
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value={today().slice(0, 7)}>This month</option>
            <option
              value={new Date(Date.now() - 86400000 * 30)
                .toISOString()
                .slice(0, 7)}
            >
              Previous month
            </option>
            <option value="all">All time</option>
          </select>
          {month === "all" && (
            <select
              aria-label="All-time expense period"
              value={allTimeBasis}
              onChange={(event) =>
                setAllTimeBasis(
                  event.target.value as "full-month" | "through-today",
                )
              }
            >
              <option value="full-month">Include full current month</option>
              <option value="through-today">Through today (prorated)</option>
            </select>
          )}
        </div>
      </div>
      <div className="metrics">
        <div className="metric-section-heading">
          <strong>Profit & loss</strong>
          <span>Revenue and costs used to estimate profitability</span>
        </div>
        <Metric
          label="Booked rental revenue"
          value={money(revenue)}
          hint="Includes active and completed bookings"
          icon={<CircleDollarSign />}
          tone="green"
          onInfo={() =>
            showCalculation({
              title: "Booked rental revenue",
              definition:
                "Revenue from every booking overlapping the selected period, including active bookings.",
              formula: "Sum of rental revenue for selected bookings",
              items: [
                ...monthRentals.map((r) => ({
                  label: `Booking #${r.identification}${r.renter ? ` — ${r.renter}` : ""}`,
                  value: money(rentalRevenue(r)),
                })),
                { label: "Booked revenue", value: money(revenue) },
              ],
            })
          }
        />
        <Metric
          label="Completed rental income"
          value={money(completedRevenue)}
          hint="Completed bookings; revenue recognized"
          icon={<CircleDollarSign />}
          tone="green"
          onInfo={() =>
            showCalculation({
              title: "Completed rental income",
              definition:
                "Revenue from selected bookings whose end date has passed or is today.",
              formula: "Sum of rental revenue where end date ≤ today",
              items: [
                ...completedRentals.map((r) => ({
                  label: `Booking #${r.identification}${r.renter ? ` — ${r.renter}` : ""}`,
                  value: money(rentalRevenue(r)),
                })),
                { label: "Completed income", value: money(completedRevenue) },
              ],
            })
          }
        />
        <Metric
          label="Operating costs (excluding principal)"
          value={money(monthExpenses)}
          hint="Used for profit; excludes loan principal"
          icon={<Receipt />}
          tone="orange"
          onInfo={() =>
            showCalculation({
              title: "Operating costs",
              definition:
                "Costs used in the profit estimate. Loan principal is excluded because it reduces the loan balance rather than being an operating cost.",
              formula: "Insurance + interest + other operating costs",
              items: [
                { label: "Booked revenue", value: money(revenue) },
                { label: "Operating costs", value: money(monthExpenses) },
              ],
            })
          }
        />
        <div className="metric-section-heading">
          <strong>Cash flow costs</strong>
          <span>Recorded cash outflows, including loan principal</span>
        </div>
        <Metric
          label="Cash expenses (including principal)"
          value={money(cashExpenses)}
          hint={`Insurance ${money(cashExpenseBreakdown.insurance)} + finance ${money(cashExpenseBreakdown.finance)} + other ${money(cashExpenseBreakdown.other)}`}
          icon={<Receipt />}
          tone="orange"
          onInfo={() =>
            setCalculationDetails({
              title: "Cash expenses",
              definition:
                "Actual cash outflows for the selected period. This includes insurance, recorded finance payments, automatically calculated finance payments when no manual payment exists, and other expense records. It does not include depreciation.",
              formula: "Insurance + finance payments + other cash expenses",
              items: [
                {
                  label: "Insurance",
                  value: money(cashExpenseBreakdown.insurance),
                },
                {
                  label: "Finance payments",
                  value: money(cashExpenseBreakdown.finance),
                },
                {
                  label: "Other cash expenses",
                  value: money(cashExpenseBreakdown.other),
                },
                {
                  label: "Cash expenses total",
                  value: money(cashExpenses),
                },
              ],
            })
          }
        />
        <div className="metric-section-heading">
          <strong>Booking performance</strong>
          <span>Revenue, distance, and rental-day averages</span>
        </div>
        <Metric
          label="Average rental revenue"
          value={money(averageRentalRevenue)}
          hint={`${monthRentals.length} bookings`}
          icon={<Wallet />}
          tone="blue"
          onInfo={() =>
            showCalculation({
              title: "Average rental revenue",
              definition: "Average revenue per selected booking.",
              formula: "Booked revenue ÷ selected bookings with revenue",
              items: [
                {
                  label: "Revenue used",
                  value: money(context.revenueTrackedTotal ?? 0),
                },
                {
                  label: "Bookings used",
                  value: `${context.revenueTrackedRentals?.length ?? 0}`,
                },
                { label: "Average", value: money(averageRentalRevenue) },
              ],
            })
          }
        />
        <Metric
          label="Total rental days"
          value={`${rentalDays}`}
          hint="Days vehicles were rented"
          icon={<Wallet />}
          tone="blue"
          onInfo={() =>
            showCalculation({
              title: "Total rental days",
              definition: "Total calendar days covered by the selected rental bookings.",
              formula: "Sum of rental days across selected bookings",
              items: [{ label: "Rental days", value: `${rentalDays}` }],
            })
          }
        />
        <Metric
          label="Average kilometres"
          value={`${Math.round(averageKilometres).toLocaleString()} km`}
          hint="Per booking"
          icon={<Gauge />}
          tone="purple"
          onInfo={() =>
            showCalculation({
              title: "Average kilometres",
              definition: "Average distance driven per booking with recorded distance.",
              formula: "Recorded rental km ÷ bookings with recorded distance",
              items: [
                {
                  label: "Kilometres used",
                  value: `${context.distanceTrackedKilometres ?? monthKm} km`,
                },
                {
                  label: "Bookings used",
                  value: `${context.distanceTrackedRentals?.length ?? 0}`,
                },
                { label: "Average", value: `${Math.round(averageKilometres).toLocaleString()} km` },
              ],
            })
          }
        />
        <Metric
          label="Daily average kilometres"
          value={`${Math.round(averageDailyKilometres).toLocaleString()} km`}
          hint="Per rental day"
          icon={<Gauge />}
          tone="purple"
          onInfo={() =>
            showCalculation({
              title: "Daily average kilometres",
              definition: "Average distance driven per rental day.",
              formula: "Recorded rental km ÷ recorded rental days",
              items: [
                {
                  label: "Kilometres used",
                  value: `${context.distanceTrackedKilometres ?? monthKm} km`,
                },
                {
                  label: "Rental days used",
                  value: `${context.distanceTrackedRentalDays ?? rentalDays}`,
                },
                { label: "Average per day", value: `${Math.round(averageDailyKilometres).toLocaleString()} km` },
              ],
            })
          }
        />
        <div className="metric-section-heading">
          <strong>Operating result and cash remaining</strong>
          <span>Operating profit excludes loan principal; cash flow includes payments</span>
        </div>
        <Metric
          label="Operating profit (before depreciation)"
          value={money(operatingProfit)}
          hint={`${revenue > 0 ? ((operatingProfit / revenue) * 100).toFixed(1) : "0.0"}% of booked revenue; before depreciation and principal`}
          icon={<ChartNoAxesCombined />}
          tone={operatingProfit >= 0 ? "blue" : "red"}
          onInfo={() =>
            showCalculation({
              title: "Operating profit",
              definition: "Estimated profit before depreciation and loan principal.",
              formula: "Booked rental revenue − operating costs",
              items: [
                { label: "Booked revenue", value: money(revenue) },
                { label: "Operating costs", value: money(monthExpenses) },
                { label: "Operating profit", value: money(operatingProfit) },
              ],
            })
          }
        />
        <Metric
          label="Cash remaining before loan principal"
          value={money(cashProfitBeforePrincipal)}
          hint="Completed income − cash operating costs"
          icon={<Wallet />}
          tone={cashProfitBeforePrincipal >= 0 ? "purple" : "red"}
          onInfo={() =>
            showCalculation({
              title: "Cash profit before principal",
              definition: "Completed income after cash operating costs, before loan principal.",
              formula: "Completed income − (cash expenses − loan principal)",
              items: [
                { label: "Completed income", value: money(completedRevenue) },
                { label: "Cash expenses", value: money(cashExpenses) },
                { label: "Loan principal", value: money(principal) },
                { label: "Cash profit before principal", value: money(cashProfitBeforePrincipal) },
              ],
            })
          }
        />
        <Metric
          label="Estimated net income (after depreciation)"
          value={money(profit)}
          hint={`${revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0.0"}% of booked revenue after estimated depreciation`}
          icon={<ChartNoAxesCombined />}
          tone={profit >= 0 ? "blue" : "red"}
          onInfo={() =>
            showCalculation({
              title: "Net income (estimated)",
              definition: "Operating profit after estimated vehicle depreciation.",
              formula: "Operating profit − estimated depreciation",
              items: [
                { label: "Operating profit", value: money(operatingProfit) },
                { label: "Estimated depreciation", value: money(estimatedDep) },
                { label: "Estimated net income", value: money(profit) },
              ],
            })
          }
        />
        <Metric
          label="Cash flow after loan payments"
          value={money(cashFlow)}
          hint={`${completedRevenue > 0 ? ((cashFlow / completedRevenue) * 100).toFixed(1) : "0.0"}% cash margin; includes ${money(principal)} loan principal`}
          icon={<Activity />}
          tone={cashFlow >= 0 ? "purple" : "red"}
          onInfo={() =>
            showCalculation({
              title: "Cash flow",
              definition: "Completed income remaining after all recorded cash expenses, including loan principal.",
              formula: "Completed income − cash expenses",
              items: [
                { label: "Completed income", value: money(completedRevenue) },
                { label: "Cash expenses", value: money(cashExpenses) },
                { label: "Cash flow", value: money(cashFlow) },
                { label: "Loan principal included", value: money(principal) },
              ],
            })
          }
        />
      </div>
      <div className="note-box metric-explainer">
        <Activity size={16} />
        <span>
          <strong>How to read these amounts:</strong> Booked rental revenue
          includes every booking in the selected period, even if it is still
          active. Completed rental income includes completed bookings only.
          Operating costs are used to estimate profit and exclude loan
          principal. Cash expenses are actual recorded outflows and include loan
          principal.
        </span>
      </div>
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h3>Income vs costs</h3>
          <p>Daily income and costs for the selected period</p>
            </div>
            <span className="legend">
              <i className="income-dot" /> Income <i className="cost-dot" />{" "}
              Costs
            </span>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#20a879" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#20a879" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e8edf2"
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#8490a0" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#8490a0" }}
                  tickFormatter={(v) => `$${v}`}
                  width={55}
                />
                <Tooltip
                  formatter={(v: any) => money(v)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5eaf0",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#20a879"
                  strokeWidth={2.5}
                  fill="url(#incomeFill)"
                />
                <Area
                  type="monotone"
                  dataKey="costs"
                  name="Costs"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fill="url(#costFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Fleet snapshot</h3>
              <p>Current estimated values</p>
            </div>
            <button className="text-button" onClick={() => setTab("Cars")}>
              View all <ArrowUpRight size={14} />
            </button>
          </div>
          {cars.length === 0 ? (
            <Empty
              text="Add your first vehicle to start tracking."
              action="Add vehicle"
              onClick={() => openNew("car")}
            />
          ) : (
            <div className="fleet-list">
              {cars.slice(0, 5).map((c) => (
                <div className="fleet-row" key={c.identification}>
                  <div className="car-avatar">
                    <CarFront size={19} />
                  </div>
                  <div className="fleet-info">
                    <strong>{c.name}</strong>
                    <span>
                      {c.make_model} {c.year || ""} ·{" "}
                      {num(c.odometer_km).toLocaleString()} km
                    </span>
                  </div>
                  <div className="fleet-value">
                    <strong>{money(num(c.current_value))}</strong>
                    <span>market value</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="fleet-footer">
            <span>
              {cars.length} vehicle{cars.length === 1 ? "" : "s"} tracked
            </span>
            <button className="text-button" onClick={() => openNew("car")}>
              <Plus size={14} /> Add vehicle
            </button>
          </div>
        </section>
      </div>
      <div className="bottom-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Recent expenses</h3>
              <p>Latest recorded transactions</p>
            </div>
            <button className="text-button" onClick={() => setTab("Expenses")}>
              See ledger <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="mini-table">
            {expenses.slice(0, 5).length === 0 ? (
              <div className="empty-inline">No expenses recorded yet.</div>
            ) : (
              expenses.slice(0, 5).map((e) => (
                <div className="mini-row" key={e.identification}>
                  <div className="category-icon">
                    <Receipt size={16} />
                  </div>
                  <div className="mini-desc">
                    <strong>{e.description || e.category}</strong>
                    <span>
                      {e.date} · {carName(e.vehicle_identification)}
                    </span>
                  </div>
                  <strong className="negative">−{money(num(e.amount))}</strong>
                </div>
              ))
            )}
          </div>
        </section>
        <section className="panel insight-panel">
          <div className="panel-heading">
            <div>
              <h3>Vehicle value curve</h3>
              <p>Age, mileage, and market value</p>
            </div>
            {cars.length > 0 && (
              <select
                value={depreciationCar?.identification || ""}
                onChange={(e) =>
                  setDepreciationCarIdentification(num(e.target.value))
                }
              >
                {cars.map((c) => (
                  <option key={c.identification} value={c.identification}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          {depreciationCar ? (
            <>
              <div className="chart compact-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={depreciationChartData}
                    margin={{
                      top: 8,
                      right: 10,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e8edf2"
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#8490a0" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#8490a0" }}
                      tickFormatter={(v) => `$${v}`}
                      width={55}
                    />
                    <Tooltip
                      formatter={(v: any) => money(v)}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e5eaf0",
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="ageValue"
                      name="Age-based value"
                      stroke="#6875e8"
                      fill="#6875e8"
                      fillOpacity={0.12}
                    />
                    <Area
                      type="monotone"
                      dataKey="mileageValue"
                      name="Mileage-based value"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.08}
                    />
                    <Area
                      type="monotone"
                      dataKey="marketValue"
                      name="Market valuation"
                      stroke="#20a879"
                      fill="#20a879"
                      fillOpacity={0.08}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="economics-row">
                <div>
                  <strong>{depreciationCar.name}</strong>
                  <span>{depreciationDescription(depreciationCar)}</span>
                </div>
                <strong>
                  {money(
                    totalDepreciation(depreciationCar),
                  )}{" "}
                  estimated decline
                </strong>
              </div>
            </>
          ) : (
            <div className="empty-inline">
              Add a vehicle to view its depreciation curve.
            </div>
          )}
          <div className="note-box">
            <Activity size={16} />
            <span>
              Age-based curves use the selected annual decline rate.
              Mileage-based curves are estimates until historical odometer
              readings are recorded.
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
