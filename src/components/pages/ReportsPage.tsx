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
  const showCalculation = (details: {
    title: string;
    definition: string;
    formula: string;
    items: { label: string; value: string }[];
  }) => setCalculationDetails(details);

  const bookingCount = monthRentals.length;
  const distanceBookingCount = monthRentals.filter(
    (r) => rentalDistance(r) > 0,
  ).length;
  const revenueBookingCount = monthRentals.filter(
    (r) => rentalRevenue(r) > 0,
  ).length;
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
          onInfo={() =>
            showCalculation({
              title: "Rental revenue",
              definition:
                "Total revenue from every booking overlapping the selected period. Turo gross income is used when recorded; Turo fee, tax, discount, and charging reimbursement fields are reference-only.",
              formula: "Sum of rentalRevenue for selected bookings",
              items: [
                { label: "Bookings included", value: `${bookingCount}` },
                { label: "Rental revenue", value: money(revenue) },
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
                "Revenue from selected bookings whose end date is today or earlier. This is the completed income used for cash-flow reporting.",
              formula: "Sum of rentalRevenue where end date ≤ today",
              items: [
                {
                  label: "Completed bookings",
                  value: `${context.completedMonthRentals?.length ?? 0}`,
                },
                { label: "Completed income", value: money(completedRevenue) },
              ],
            })
          }
        />
        <Metric
          label="Cash outflow"
          value={money(cashExpenses)}
          hint="Includes loan principal"
          icon={<Wallet />}
          tone="orange"
          onInfo={() =>
            showCalculation({
              title: "Cash outflow",
              definition:
                "The amount of cash recorded as leaving the business in the selected period. It includes finance payments and loan principal.",
              formula: "Cash expenses including principal",
              items: [{ label: "Cash outflow", value: money(cashExpenses) }],
            })
          }
        />
        <Metric
          label="Cash expenses (including principal)"
          value={money(cashExpenses)}
          hint="Recorded cash outflows, including loan principal"
          icon={<Receipt />}
          tone="orange"
          onInfo={() =>
            showCalculation({
              title: "Cash expenses",
              definition:
                "Actual cash expenses for the selected period. Depreciation is not cash and is excluded. Finance includes automatic loan payments when configured and manual finance entries when recorded.",
              formula: "Insurance + finance payments + other cash expenses",
              items: [
                { label: "Insurance", value: money(cashExpenseBreakdown.insurance) },
                { label: "Finance payments", value: money(cashExpenseBreakdown.finance) },
                { label: "Other cash expenses", value: money(cashExpenseBreakdown.other) },
                { label: "Cash expenses total", value: money(cashExpenses) },
              ],
            })
          }
        />
        <Metric
          label="Average rental revenue"
          value={money(averageRentalRevenue)}
          hint={`${monthRentals.length} bookings`}
          icon={<Wallet />}
          tone="blue"
          onInfo={() =>
            showCalculation({
              title: "Average rental revenue",
              definition:
                "Average revenue per selected booking with recorded revenue. Bookings with zero revenue are excluded from the denominator.",
              formula: "Revenue from revenue-tracked bookings ÷ revenue-tracked bookings",
              items: [
                { label: "Revenue-tracked bookings", value: `${revenueBookingCount}` },
                { label: "Revenue used", value: money(context.revenueTrackedTotal ?? 0) },
                { label: "Average", value: money(averageRentalRevenue) },
              ],
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
              definition:
                "Average distance driven per booking with valid odometer readings.",
              formula: "Distance-tracked kilometres ÷ bookings with distance",
              items: [
                { label: "Distance-tracked bookings", value: `${distanceBookingCount}` },
                { label: "Distance used", value: `${monthKm.toLocaleString()} km` },
                { label: "Average", value: `${Math.round(averageKilometres).toLocaleString()} km` },
              ],
            })
          }
        />
        <Metric
          label="Average revenue / rental day"
          value={money(averageRevenuePerRentalDay)}
          hint={`${rentalDays} rental days`}
          icon={<CircleDollarSign />}
          tone="green"
          onInfo={() =>
            showCalculation({
              title: "Average revenue per rental day",
              definition:
                "Average revenue earned for each rental day across bookings with recorded revenue.",
              formula: "Revenue-tracked revenue ÷ revenue-tracked rental days",
              items: [
                { label: "Revenue used", value: money(context.revenueTrackedTotal ?? 0) },
                { label: "Rental days", value: `${context.revenueTrackedDays ?? 0}` },
                { label: "Average per day", value: money(averageRevenuePerRentalDay) },
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
              definition:
                "Average distance driven per rental day across bookings with valid distance readings.",
              formula: "Distance-tracked kilometres ÷ distance-tracked rental days",
              items: [
                { label: "Distance used", value: `${monthKm.toLocaleString()} km` },
                { label: "Rental days", value: `${context.distanceTrackedRentalDays ?? 0}` },
                { label: "Average per day", value: `${Math.round(averageDailyKilometres).toLocaleString()} km` },
              ],
            })
          }
        />
        <Metric
          label="Average booking length"
          value={`${averageBookingLength.toFixed(1)} days`}
          hint="Per booking"
          icon={<Wallet />}
          tone="blue"
          onInfo={() =>
            showCalculation({
              title: "Average booking length",
              definition:
                "Average number of rental days for bookings with recorded revenue.",
              formula: "Revenue-tracked rental days ÷ revenue-tracked bookings",
              items: [
                { label: "Rental days", value: `${context.revenueTrackedDays ?? 0}` },
                { label: "Bookings", value: `${revenueBookingCount}` },
                { label: "Average length", value: `${averageBookingLength.toFixed(1)} days` },
              ],
            })
          }
        />
        <Metric
          label="Revenue per kilometre"
          value={money(revenuePerKilometre)}
          hint="Average earned per km"
          icon={<CircleDollarSign />}
          tone="green"
          onInfo={() =>
            showCalculation({
              title: "Revenue per kilometre",
              definition:
                "Average rental revenue generated for each kilometre recorded on bookings with valid distance readings.",
              formula: "Revenue from distance-tracked bookings ÷ distance-tracked kilometres",
              items: [
                { label: "Revenue used", value: money(context.distanceTrackedRevenue ?? 0) },
                { label: "Distance used", value: `${context.distanceTrackedKilometres ?? 0} km` },
                { label: "Revenue per km", value: money(revenuePerKilometre) },
              ],
            })
          }
        />
        <Metric
          label="Operating profit"
          value={money(operatingProfit)}
          hint="Revenue − operating costs"
          icon={<ChartNoAxesCombined />}
          tone={operatingProfit >= 0 ? "blue" : "red"}
          onInfo={() =>
            showCalculation({
              title: "Operating profit",
              definition:
                "Estimated profit before depreciation. Loan principal is excluded because it reduces the loan balance rather than representing an operating cost.",
              formula: "Rental revenue − operating costs",
              items: [
                { label: "Rental revenue", value: money(revenue) },
                { label: "Operating costs", value: money(monthExpenses) },
                { label: "Operating profit", value: money(operatingProfit) },
              ],
            })
          }
        />
        <Metric
          label="Cash profit before principal"
          value={money(cashProfitBeforePrincipal)}
          hint="Completed income − cash operating costs"
          icon={<Wallet />}
          tone={cashProfitBeforePrincipal >= 0 ? "purple" : "red"}
          onInfo={() =>
            showCalculation({
              title: "Cash profit before principal",
              definition:
                "Completed rental income remaining after cash expenses other than loan principal. This shows the result before debt-balance repayments.",
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
          label="Net income (estimated)"
          value={money(profit)}
          hint="Revenue − non-principal costs − depreciation"
          icon={<ChartNoAxesCombined />}
          tone={profit >= 0 ? "blue" : "red"}
          onInfo={() =>
            showCalculation({
              title: "Net income (estimated)",
              definition:
                "Management estimate of profit after operating costs and estimated vehicle depreciation. It is not a tax or formal accounting statement.",
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
          label="Distance recorded"
          value={`${monthKm.toLocaleString()} km`}
          hint={`Estimated depreciation ${money(estimatedDep)}`}
          icon={<Gauge />}
          tone="purple"
          onInfo={() =>
            showCalculation({
              title: "Distance recorded",
              definition:
                "Total rental distance calculated from each booking's odometer end reading minus its start reading. The depreciation estimate uses the vehicle's configured depreciation model.",
              formula: "Sum of max(odometer end − odometer start, 0)",
              items: [
                { label: "Bookings with distance", value: `${distanceBookingCount}` },
                { label: "Distance recorded", value: `${monthKm.toLocaleString()} km` },
                { label: "Estimated depreciation", value: money(estimatedDep) },
              ],
            })
          }
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
