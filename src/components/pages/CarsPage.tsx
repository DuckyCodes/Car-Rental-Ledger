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

export function CarsPage({ context }: { context: PageContext }) {
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
          <h2>Vehicle register</h2>
          <p>
            Keep purchase details, odometer and current market value for every
            car.
          </p>
        </div>
        <button className="secondary" onClick={() => openNew("car")}>
          <Plus size={16} /> Add vehicle
        </button>
      </div>
      {cars.length === 0 ? (
        <Empty
          text="No vehicles yet. Add your first rental car."
          action="Add vehicle"
          onClick={() => openNew("car")}
        />
      ) : (
        <div className="data-grid">
          {cars.map((c) => (
            <article className="vehicle-card" key={c.identification}>
              <div className="vehicle-card-top">
                <div className="car-avatar large">
                  <CarFront size={23} />
                </div>
                <button
                  className="icon-button"
                  onClick={() => openEdit("car", c)}
                  title="Edit vehicle"
                >
                  <Settings2 size={17} />
                </button>
              </div>
              <h3>{c.name}</h3>
              <p>
                {c.make_model} {c.year || ""}
              </p>
              <div className="vehicle-stats">
                <div>
                  <span>Current value</span>
                  <strong>{money(num(c.current_value))}</strong>
                </div>
                <div>
                  <span>Odometer</span>
                  <strong>{num(c.odometer_km).toLocaleString()} km</strong>
                </div>
                <div>
                  <span>Purchase price</span>
                  <strong>{money(num(c.purchase_price))}</strong>
                </div>
                <div>
                  <span>Depreciation estimate</span>
                  <strong>{depreciationDescription(c)}</strong>
                </div>
              </div>
              <div className="vehicle-actions">
                <button
                  className="secondary small"
                  onClick={() => {
                    setEditing({
                      vehicle_identification: c.identification,
                      date: today(),
                      odometer_km: c.odometer_km,
                      market_value: c.current_value,
                      notes: "",
                    });
                    setModal("valuation");
                  }}
                >
                  <Gauge size={15} /> Update valuation
                </button>
                <button
                  className="icon-button danger"
                  onClick={() => remove("cars", c.identification)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
