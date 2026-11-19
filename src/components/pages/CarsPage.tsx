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
import { estimateCanadaVehicleCosts, canadaEstimatorSources } from "../../canadaVehicleEstimator";
import { VehicleEstimateChart } from "../VehicleEstimateChart";

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
    loanScheduleSummary,
    totalVehicleKilometres,
    depreciationDescription,
    vehicleCostSummary,
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
              {(() => {
                const estimate = estimateCanadaVehicleCosts(c);
                const costs = vehicleCostSummary(c);
                const loanSchedule = loanScheduleSummary(c);
                const latestValuation = valuations
                  .filter((valuation) => valuation.vehicle_identification === c.identification)
                  .sort((a, b) => b.date.localeCompare(a.date))[0];
                return (
                  <>
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
                  <span>Vehicle price (before financing)</span>
                  <strong>{money(num(c.purchase_price))}</strong>
                </div>
                <div>
                  <span>Depreciation estimate</span>
                  <strong>{depreciationDescription(c)}</strong>
                </div>
                <div>
                  <span>Canada baseline maintenance</span>
                  <strong>{money(estimate.annualMaintenance)}/yr</strong>
                </div>
                <div>
                  <span>Major repair probability</span>
                  <strong>{(estimate.majorRepairProbability * 100).toFixed(1)}%/yr</strong>
                </div>
              </div>
              <div className="vehicle-cost-summary">
                <div className="section-divider">Financing & true cost to date</div>
                <div className="cost-summary-grid">
                  <div>
                    <span>Current equity</span>
                    <strong className={costs.equity < 0 ? "negative" : "positive"}>
                      {money(costs.equity)}
                    </strong>
                  </div>
                  <div>
                    <span>Calculated loan balance</span>
                    <strong>{money(costs.loanBalance)}</strong>
                  </div>
                  <div>
                    <span>Cash paid toward vehicle</span>
                    <strong>{money(costs.cashPaidTowardVehicle)}</strong>
                  </div>
                  <div>
                    <span>Interest paid</span>
                    <strong>{money(costs.interestPaid)}</strong>
                  </div>
                  <div>
                    <span>Scheduled monthly payment</span>
                    <strong>{money(loanSchedule.monthlyPayment)}</strong>
                  </div>
                  <div>
                    <span>Total scheduled repayment</span>
                    <strong>{money(loanSchedule.totalRepayment)}</strong>
                  </div>
                  <div>
                    <span>Total scheduled interest</span>
                    <strong>{money(loanSchedule.totalInterest)}</strong>
                  </div>
                  <div>
                    <span>Other vehicle expenses</span>
                    <strong>{money(costs.otherExpenses)}</strong>
                  </div>
                  <div>
                    <span>Net cost after current equity</span>
                    <strong>{money(costs.netCost)}</strong>
                  </div>
                </div>
                <p className="cost-summary-note">
                  Cash paid includes down payment, principal and interest. Net cost also
                  accounts for what the car is worth today after the remaining loan.
                  " Loan balance is calculated from the loan schedule and recorded principal payments."
                  {latestValuation ? ` Last valuation: ${latestValuation.date}.` : " Add a valuation to start a value history."}
                </p>
              </div>
              <div className="hint-box">
                <strong>Automatic Canada estimate</strong><br />
                Depreciation: {money(estimate.annualDepreciation)}/yr · age {estimate.ageYears} years · baseline confidence.<br />
                Fuel ratings: <a href={canadaEstimatorSources.fuel} target="_blank" rel="noreferrer">NRCan public data</a> · recalls: <a href={canadaEstimatorSources.recalls} target="_blank" rel="noreferrer">Transport Canada</a>.
                <button className="text-button" onClick={() => setCalculationDetails({
                  title: "Canada vehicle estimate",
                  definition: "A transparent Canada-wide baseline using age, odometer, purchase/current value, and public federal data links. It is not a trim-level market quote.",
                  formula: "Depreciation = current value × age rate × mileage factor; maintenance = age/mileage adjusted baseline; repair risk = age + mileage risk model",
                  items: [
                    { label: "Annual depreciation", value: money(estimate.annualDepreciation) },
                    { label: "Annual maintenance", value: money(estimate.annualMaintenance) },
                    { label: "Major repair probability", value: `${(estimate.majorRepairProbability * 100).toFixed(1)}%` },
                  ],
                })}>View calculation</button>
              </div>
              <VehicleEstimateChart car={c} />
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
                  </>
                );
              })()}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
