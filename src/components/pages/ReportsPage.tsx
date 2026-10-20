import { Metric, Empty } from "../Ui";
import { DailyRateTester } from "../reports/DailyRateTester";
import { VehicleReportTable } from "../reports/VehicleReportTable";
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
import { money, monthKey } from "../../model";
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
    rentalRevenue,
    rentalDistance,
    rentalDepreciation,
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
    automaticLoanBreakdownForMonth,
    automaticLoanBreakdownThroughToday,
    expenseAppliesToMonth,
    expenseAmountForPeriod,
    isManualFinanceEntry,
    isManualPrincipalEntry,
    isManualInterestEntry,
    insuranceCostForMonth,
    insuranceCostThroughToday,
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
  const calculationPeriod =
    month === "all" && allTimeBasis === "through-today"
      ? "all-through-today"
      : month;
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
        <div className="period-controls">
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
          <strong>Revenue and profitability</strong>
          <span>Income and operating results for the selected period</span>
        </div>
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
        <div className="metric-section-heading">
          <strong>Cash flow costs</strong>
          <span>Actual cash expenses, including loan principal</span>
        </div>
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
          label="Cash remaining before loan principal"
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
          label="Estimated net income (after depreciation)"
          value={money(profit)}
          hint={`${revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0.0"}% of booked revenue after estimated depreciation`}
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
          label="Cash flow after loan payments"
          value={money(cashFlow)}
          hint={`${completedRevenue > 0 ? ((cashFlow / completedRevenue) * 100).toFixed(1) : "0.0"}% of completed rental income; includes principal`}
          icon={<Activity />}
          tone={cashFlow >= 0 ? "purple" : "red"}
          onInfo={() =>
            showCalculation({
              title: "Cash flow after loan payments",
              definition:
                "Completed rental income remaining after recorded cash expenses, including loan principal. This is the closest report figure to cash left before owner withdrawals and unrecorded costs.",
              formula: "Completed rental income − cash expenses",
              items: [
                { label: "Completed rental income", value: money(completedRevenue) },
                { label: "Cash expenses, including principal", value: money(cashExpenses) },
                { label: "Cash flow", value: money(cashFlow) },
                { label: "Cash margin on completed income", value: `${completedRevenue > 0 ? ((cashFlow / completedRevenue) * 100).toFixed(1) : "0.0"}%` },
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
      <VehicleReportTable
        cars={cars}
        rentals={monthRentals}
        expenses={expenses}
        month={month}
        calculationPeriod={calculationPeriod}
        rentalRevenue={rentalRevenue}
        rentalDistance={context.rentalDistance}
        rentalDepreciation={rentalDepreciation}
        rentalPlatformCosts={rentalPlatformCosts}
        totalVehicleKilometres={totalVehicleKilometres}
        expenseAppliesToMonth={expenseAppliesToMonth}
        expenseAmountForPeriod={expenseAmountForPeriod}
        isManualFinanceEntry={isManualFinanceEntry}
        isManualPrincipalEntry={isManualPrincipalEntry}
        isManualInterestEntry={isManualInterestEntry}
        insuranceCostForMonth={insuranceCostForMonth}
        insuranceCostThroughToday={insuranceCostThroughToday}
        insuranceConfigured={insuranceConfigured}
        automaticLoanBreakdownForMonth={automaticLoanBreakdownForMonth}
        automaticLoanBreakdownThroughToday={automaticLoanBreakdownThroughToday}
        showCalculation={showCalculation}
      />
      <DailyRateTester
        cars={cars}
        rentals={rentals}
        expenses={expenses}
        rentalGrossRevenue={context.rentalGrossRevenue}
        rentalRevenue={rentalRevenue}
        rentalDistance={context.rentalDistance}
        insuranceCostForMonth={insuranceCostForMonth}
        insuranceConfigured={insuranceConfigured}
        isManualFinanceEntry={isManualFinanceEntry}
        isManualInterestEntry={isManualInterestEntry}
        automaticFinanceForMonth={(car, monthKeyValue) =>
          automaticLoanBreakdownForMonth(car, monthKeyValue)
        }
      />
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
