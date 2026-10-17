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

export function RentalsPage({ context }: { context: PageContext }) {
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
    rentalTuroAdjustments,
    rentalEarnings,
    rentalDistance,
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
  } = context;
  return (
    <>
      <div className="toolbar">
        <div>
          <h2>Bookings & rental profitability</h2>
          <p>
            Each row shows gross revenue, Turo reimbursements/fees, and the
            amount left after booking-linked costs. Vehicle lifetime mileage
            and depreciation are kept in vehicle reports.
          </p>
        </div>
        <button className="secondary" onClick={() => openNew("rental")}>
          <Plus size={16} /> Add rental
        </button>
      </div>
      {rentals.length === 0 ? (
        <Empty
          text="Add a completed or active rental to see its profitability."
          action="Add rental"
          onClick={() => openNew("rental")}
        />
      ) : (
        <div className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>Renter / booking</th>
                <th>Vehicle</th>
                <th>Dates</th>
                <th>Rental km</th>
                <th>Gross revenue</th>
                <th>Turo adjustments</th>
                <th>Trip net after costs</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rentals.map((r) => {
                const gross = rentalRevenue(r),
                  adjustments = rentalTuroAdjustments(r),
                  earnings = rentalEarnings(r),
                  km = rentalDistance(r),
                  linked = expensesFor(r.identification)
                    .filter((e) => e.treatment !== "loan_principal")
                    .reduce((s, e) => s + num(e.amount), 0);
                return (
                  <tr key={r.identification}>
                    <td>
                      <strong>{r.renter || "Rental booking"}</strong>
                      <span className="cell-sub">#{r.identification}</span>
                    </td>
                    <td>{carName(r.vehicle_identification)}</td>
                    <td>
                      {r.start_date}
                      <span className="cell-sub">to {r.end_date}</span>
                    </td>
                    <td>{km.toLocaleString()} km</td>
                    <td className="positive">{money(gross)}</td>
                    <td>{adjustments ? `−${money(adjustments)}` : money(0)}</td>
                    <td
                      className={
                        earnings - linked - rentalPlatformCosts(r) >= 0
                          ? "positive"
                          : "negative"
                      }
                    >
                      {money(earnings - linked - rentalPlatformCosts(r))}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          onClick={() => openEdit("rental", r)}
                        >
                          <Settings2 size={16} />
                        </button>
                        <button
                          className="icon-button danger"
                          onClick={() => remove("rentals", r.identification)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
