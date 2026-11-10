import { Metric, Empty } from "../../../Ui";
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
import { today, money, num, API } from "../../../../model";
import type { Car, Rental, Expense, Valuation } from "../../../../model";
import { getOverviewPeriod, getAvailableExpenseMonths } from "../overviewCalculations";
import type { PageContext } from '../OverviewTypes';

export function OverviewVisuals({ context }: { context: PageContext }) {
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
  const operatingMargin = revenue > 0 ? (operatingProfit / revenue) * 100 : 0;
  const cashFlowMargin = completedRevenue > 0 ? (cashFlow / completedRevenue) * 100 : 0;
  const { periodStart, periodEnd, completedRentalDays, periodDays } = getOverviewPeriod(month, monthRentals);
  const bookedDaysPercentage = cars.length
    ? (rentalDays / (periodDays * cars.length)) * 100
    : 0;
  return (
    <>
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
