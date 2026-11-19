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
    publicEstimates,
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
                const publicEstimate = publicEstimates[c.identification];
                const marketValue = publicEstimate?.marketValue ?? num(c.current_value);
                const costs = vehicleCostSummary(c, marketValue);
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
                  <span>{publicEstimate ? "Public market estimate" : "Current value"}</span>
                  <strong>{money(marketValue)}</strong>
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
                  <strong>
                    {publicEstimate
                      ? `${(publicEstimate.annualDepreciationRate * 100).toFixed(1)}% annual public-market trend`
                      : depreciationDescription(c)}
                  </strong>
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
                  {" Loan balance is calculated from the loan schedule and recorded principal payments."}
                  {latestValuation ? ` Last valuation: ${latestValuation.date}.` : " Add a valuation to start a value history."}
                </p>
              </div>
              {publicEstimate && (
                <div className="hint-box">
                  <strong>Public market estimate</strong><br />
                  {money(publicEstimate.marketValue)} from {publicEstimate.comparableCount} <a href={publicEstimate.sourceUrl} target="_blank" rel="noreferrer">AutoTrader Canada comparable{publicEstimate.comparableCount === 1 ? "" : "s"}</a> in {publicEstimate.province}, fetched {new Date(publicEstimate.asOf).toLocaleDateString("en-CA")}. {publicEstimate.comparableCount < 3 ? "This is a limited benchmark because there are fewer than three exact public matches." : "This uses multiple exact public matches."}
                  Future depreciation uses the annualized Canadian Black Book truck/SUV market trend ({(publicEstimate.annualDepreciationRate * 100).toFixed(1)}%/yr), not your purchase price or manual current value.
                  <a href={publicEstimate.trendSourceUrl} target="_blank" rel="noreferrer">View market trend source</a>
                  <span className="source-links"> Other references: {publicEstimate.referenceSources.filter((source: { name: string }) => source.name !== "AutoTrader Canada").map((source: { name: string; url: string }) => <a key={source.name} href={source.url} target="_blank" rel="noreferrer">{source.name}</a>)}</span>
                  <button className="text-button" onClick={() => setCalculationDetails({
                    title: "Public market estimate",
                    definition: "A market-based estimate from public AutoTrader Canada asking-price comparables matched to the vehicle's model year, trim, and province. Asking prices are not completed sale prices.",
                    formula: "Current value = median matching public asking prices; future value = current value × (1 − annualized public market trend)^years",
                    items: [
                      { label: "Market estimate", value: money(publicEstimate.marketValue) },
                      { label: "Comparable listings", value: String(publicEstimate.comparableCount) },
                      { label: "Annual public trend", value: `${(publicEstimate.annualDepreciationRate * 100).toFixed(1)}%` },
                    ],
                  })}>View source calculation</button>
                </div>
              )}
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
              <VehicleEstimateChart
                car={c}
                marketValue={marketValue}
                annualDepreciationRate={publicEstimate?.annualDepreciationRate}
              />
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
