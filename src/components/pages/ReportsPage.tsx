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

export function ReportsPage({ context }: { context: PageContext }) {
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
          <h2>Profitability & cash flow</h2>
          <p>
            Review the difference between money leaving your account and costs
            used to estimate profit.
          </p>
        </div>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="all">All time</option>
          {Array.from(
            new Set([
              ...expenses.map((e) => monthKey(e.date)),
              ...rentals.map((r) => monthKey(r.start_date)),
            ]),
          )
            .sort()
            .reverse()
            .map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
        </select>
      </div>
      <div className="metrics">
        <Metric
          label="Rental revenue"
          value={money(revenue)}
          hint="Bookings overlapping selected period"
          icon={<CircleDollarSign />}
          tone="green"
        />
        <Metric
          label="Completed rental income"
          value={money(completedRevenue)}
          hint="Completed bookings; revenue recognized"
          icon={<CircleDollarSign />}
          tone="green"
        />
        <Metric
          label="Cash outflow"
          value={money(cashExpenses)}
          hint="Includes loan principal"
          icon={<Wallet />}
          tone="orange"
        />
        <Metric
          label="Cash expenses (including principal)"
          value={money(cashExpenses)}
          hint="Recorded cash outflows, including loan principal"
          icon={<Receipt />}
          tone="orange"
        />
        <Metric
          label="Average rental revenue"
          value={money(averageRentalRevenue)}
          hint={`${monthRentals.length} bookings`}
          icon={<Wallet />}
          tone="blue"
        />
        <Metric
          label="Average kilometres"
          value={`${Math.round(averageKilometres).toLocaleString()} km`}
          hint="Per booking"
          icon={<Gauge />}
          tone="purple"
        />
        <Metric
          label="Average revenue / rental day"
          value={money(averageRevenuePerRentalDay)}
          hint={`${rentalDays} rental days`}
          icon={<CircleDollarSign />}
          tone="green"
        />
        <Metric
          label="Daily average kilometres"
          value={`${Math.round(averageDailyKilometres).toLocaleString()} km`}
          hint="Per rental day"
          icon={<Gauge />}
          tone="purple"
        />
        <Metric
          label="Average booking length"
          value={`${averageBookingLength.toFixed(1)} days`}
          hint="Per booking"
          icon={<Wallet />}
          tone="blue"
        />
        <Metric
          label="Revenue per kilometre"
          value={money(revenuePerKilometre)}
          hint="Average earned per km"
          icon={<CircleDollarSign />}
          tone="green"
        />
        <Metric
          label="Operating profit"
          value={money(operatingProfit)}
          hint="Revenue − operating costs"
          icon={<ChartNoAxesCombined />}
          tone={operatingProfit >= 0 ? "blue" : "red"}
        />
        <Metric
          label="Cash profit before principal"
          value={money(cashProfitBeforePrincipal)}
          hint="Completed income − cash operating costs"
          icon={<Wallet />}
          tone={cashProfitBeforePrincipal >= 0 ? "purple" : "red"}
        />
        <Metric
          label="Net income (estimated)"
          value={money(profit)}
          hint="Revenue − non-principal costs − depreciation"
          icon={<ChartNoAxesCombined />}
          tone={profit >= 0 ? "blue" : "red"}
        />
        <Metric
          label="Distance recorded"
          value={`${monthKm.toLocaleString()} km`}
          hint={`Estimated depreciation ${money(estimatedDep)}`}
          icon={<Gauge />}
          tone="purple"
        />
      </div>
      <div className="panel report-panel">
        <h3>By vehicle</h3>
        <p>
          Rental revenue and linked operating expenses for the selected period.
        </p>
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Rental revenue</th>
              <th>Operating costs</th>
              <th>Loan principal</th>
              <th>Total vehicle km</th>
              <th>Estimated depreciation</th>
              <th>Estimated profit</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((c) => {
              const rs = monthRentals.filter(
                (r) => r.vehicle_identification === c.identification,
              );
              const rev = rs.reduce((s, r) => s + rentalRevenue(r), 0);
              const es = expenses.filter(
                (e) =>
                  e.vehicle_identification === c.identification &&
                  (month === "all" || expenseAppliesToMonth(e, month)),
              );
              const vehicleLoan =
                month === "all"
                  ? loanBreakdownThroughMonth(c, today().slice(0, 7))
                  : loanBreakdownForMonth(c, month);
              const vehiclePlatformCosts = rs.reduce(
                (s, r) => s + rentalPlatformCosts(r),
                0,
              );
              const vehicleInsurance =
                month === "all" ? 0 : insuranceCostForMonth(c, month);
              const op = es
                .filter(
                  (e) =>
                    e.treatment !== "loan_principal" &&
                    !isManualFinanceEntry(e) &&
                    !(
                      e.category.startsWith("Insurance") &&
                      insuranceConfigured(e.vehicle_identification)
                    ),
                )
                .reduce(
                  (s, e) => s + expenseAmountForPeriod(e, month),
                  vehicleLoan.interest +
                    vehiclePlatformCosts +
                    vehicleInsurance,
                );
              const prin = es
                .filter(
                  (e) =>
                    e.treatment === "loan_principal" &&
                    !isManualFinanceEntry(e),
                )
                .reduce(
                  (s, e) => s + expenseAmountForPeriod(e, month),
                  vehicleLoan.principal,
                );
              const km = totalVehicleKilometres(c);
              const dep =
                month === "all" && c.depreciation_model === "mileage"
                  ? km * num(c.depreciation_per_km)
                  : rs.reduce((s, r) => s + rentalDepreciation(r), 0);
              return (
                <tr key={c.identification}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td>{money(rev)}</td>
                  <td>{money(op)}</td>
                  <td>{money(prin)}</td>
                  <td>{km.toLocaleString()}</td>
                  <td>{money(dep)}</td>
                  <td className={rev - op - dep >= 0 ? "positive" : "negative"}>
                    {money(rev - op - dep)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="note-box report-note">
        <Wrench size={16} />
        <span>
          Financing: record the loan principal as a cash outflow, but do not
          treat it as an operating expense in the estimated profit calculation.
          Enter loan interest as a separate operating/interest expense. This
          dashboard's profit is a management estimate, not a tax return.
        </span>
      </div>
    </>
  );
}
