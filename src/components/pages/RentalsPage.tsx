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
          <h2>Bookings & rental profitability</h2>
          <p>Each booking estimates revenue, kilometres and depreciation.</p>
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
                <th>Total km</th>
                <th>Revenue</th>
                <th>Est. depreciation</th>
                <th>Net before other costs</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rentals.map((r) => {
                const rev = rentalRevenue(r),
                  km = rentalDistance(r),
                  dep = rentalDepreciation(r),
                  vehicle = cars.find(
                    (c) => c.identification === r.vehicle_identification,
                  ),
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
                    <td>
                      {(vehicle
                        ? totalVehicleKilometres(vehicle)
                        : 0
                      ).toLocaleString()}{" "}
                      km
                    </td>
                    <td className="positive">{money(rev)}</td>
                    <td>{money(dep)}</td>
                    <td
                      className={
                        rev - dep - linked - rentalPlatformCosts(r) >= 0
                          ? "positive"
                          : "negative"
                      }
                    >
                      {money(rev - dep - linked - dep - rentalPlatformCosts(r))}
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
