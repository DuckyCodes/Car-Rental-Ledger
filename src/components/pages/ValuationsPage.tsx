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

export function ValuationsPage({ context }: { context: PageContext }) {
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
          <h2>Depreciation & market valuations</h2>
          <p>
            Log periodic market values and odometer readings to compare
            real-world value loss with your mileage estimate.
          </p>
        </div>
        <button className="secondary" onClick={() => openNew("valuation")}>
          <Plus size={16} /> Add valuation
        </button>
      </div>
      <div className="callout">
        <Gauge size={20} />
        <div>
          <strong>Two views of depreciation</strong>
          <p>
            Mileage-based estimate = kilometres driven × your estimated cost per
            km. Market-value change compares the vehicle's purchase price or
            prior valuation to a later valuation. These are management
            estimates, not CRA CCA calculations.
          </p>
        </div>
      </div>
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Vehicle</th>
              <th>Odometer</th>
              <th>Market value</th>
              <th>Change since prior entry</th>
              <th>Notes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {valuations.map((v) => {
              const prior = valuations
                .filter(
                  (x) =>
                    x.vehicle_identification === v.vehicle_identification &&
                    x.date < v.date,
                )
                .sort((a, b) => b.date.localeCompare(a.date))[0];
              const c = cars.find(
                (x) => x.identification === v.vehicle_identification,
              );
              const change = prior
                ? num(v.market_value) - num(prior.market_value)
                : num(v.market_value) - num(c?.purchase_price);
              return (
                <tr key={v.identification}>
                  <td>{v.date}</td>
                  <td>{carName(v.vehicle_identification)}</td>
                  <td>{num(v.odometer_km).toLocaleString()} km</td>
                  <td>{money(num(v.market_value))}</td>
                  <td className={change < 0 ? "negative" : "positive"}>
                    {change > 0 ? "+" : ""}
                    {money(change)}
                  </td>
                  <td>{v.notes || "—"}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        onClick={() => openEdit("valuation", v)}
                      >
                        <Settings2 size={16} />
                      </button>
                      <button
                        className="icon-button danger"
                        onClick={() => remove("valuations", v.identification)}
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
        {valuations.length === 0 && (
          <div className="empty-inline">No valuation history yet.</div>
        )}
      </div>
      <div className="data-grid valuation-cards">
        {cars.map((c) => {
          const sorted = valuations
            .filter((v) => v.vehicle_identification === c.identification)
            .sort((a, b) => b.date.localeCompare(a.date));
          const first = sorted[sorted.length - 1];
          const last = sorted[0];
          const delta =
            first && last && first.identification !== last.identification
              ? num(last.market_value) - num(first.market_value)
              : num(c.current_value) - num(c.purchase_price);
          return (
            <div className="panel valuation-card" key={c.identification}>
              <span>{c.name}</span>
              <strong>{money(c.current_value)}</strong>
              <p>Current estimated value</p>
              <div className="valuation-bottom">
                <span>Change since purchase</span>
                <b className={delta < 0 ? "negative" : "positive"}>
                  {delta > 0 ? "+" : ""}
                  {money(delta)}
                </b>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
