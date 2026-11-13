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
import { cashFlowMetricDetails } from '../../../financialMetricDefinitions';

export function OverviewMetrics({ context }: { context: PageContext }) {
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
  const cashFlowMargin = revenue > 0 ? (cashFlow / revenue) * 100 : 0;
  const cashFlowDetails = cashFlowMetricDetails({ revenue, cashExpenses, cashFlow, principal });
  const { periodStart, periodEnd, completedRentalDays, periodDays } = getOverviewPeriod(month, monthRentals);
  const bookedDaysPercentage = cars.length
    ? (rentalDays / (periodDays * cars.length)) * 100
    : 0;
  return (
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
                { label: "Completed rental days", value: `${completedRentalDays}` },
                { label: "Booked rental days", value: `${bookedDaysPercentage.toFixed(1)}% of fleet capacity` },
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
                ...cashExpenseBreakdown.otherItems.map((item: { label: string; value: number }) => ({
                  label: item.label,
                  value: money(item.value),
                })),
                {
                  label: "Other cash expenses total",
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
          label="Booked rental days"
          value={`${bookedDaysPercentage.toFixed(1)}%`}
          hint={`${rentalDays} of ${periodDays * cars.length} available fleet days`}
          icon={<Gauge />}
          tone="purple"
          onInfo={() =>
            showCalculation({
              title: "Booked rental days",
              definition: "The share of available vehicle-days covered by bookings in the selected period.",
              formula: "Booked rental days ÷ (period days × vehicles) × 100",
              items: [
                { label: "Booked rental days", value: `${rentalDays}` },
                { label: "Available fleet days", value: `${periodDays * cars.length}` },
                { label: "Booked rental days", value: `${bookedDaysPercentage.toFixed(1)}%` },
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
          label="Operating margin"
          value={`${operatingMargin.toFixed(1)}%`}
          hint="Operating profit as a share of booked revenue"
          icon={<ChartNoAxesCombined />}
          tone={operatingMargin >= 0 ? "blue" : "red"}
          onInfo={() =>
            showCalculation({
              title: "Operating margin",
              definition: "Estimated operating profit as a percentage of booked rental revenue, before depreciation and loan principal.",
              formula: "Operating profit ÷ booked rental revenue × 100",
              items: [
                { label: "Operating profit", value: money(operatingProfit) },
                { label: "Booked revenue", value: money(revenue) },
                { label: "Operating margin", value: `${operatingMargin.toFixed(1)}%` },
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
          hint={`${revenue > 0 ? ((cashFlow / revenue) * 100).toFixed(1) : "0.0"}% cash margin; includes ${money(principal)} loan principal`}
          icon={<Activity />}
          tone={cashFlow >= 0 ? "purple" : "red"}
          onInfo={() =>
            showCalculation({
              ...cashFlowDetails,
            })
          }
        />
        <Metric
          label="Cash-flow margin"
          value={`${cashFlowMargin.toFixed(1)}%`}
          hint="Cash flow as a share of booked rental income"
          icon={<Activity />}
          tone={cashFlowMargin >= 0 ? "purple" : "red"}
          onInfo={() =>
            showCalculation({
              title: "Cash-flow margin",
              definition: "Cash remaining after cash expenses, including loan principal, as a percentage of booked rental income.",
              formula: "Cash flow ÷ booked rental income × 100",
              items: [
                { label: "Cash flow", value: money(cashFlow) },
                { label: "Booked rental income", value: money(revenue) },
                { label: "Cash-flow margin", value: `${cashFlowMargin.toFixed(1)}%` },
              ],
            })
          }
        />
      </div>
  );
}
