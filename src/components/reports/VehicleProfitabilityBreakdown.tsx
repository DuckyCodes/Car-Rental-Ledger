import { CarFront } from "lucide-react";
import { money } from "../../model";
import type { Car, VehiclePerformance } from "../../model";

type Props = {
  cars: Car[];
  vehiclePerformanceFor: (car: Car) => VehiclePerformance;
};

function Detail({
  label,
  value,
  hint,
  tone = "",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "positive" | "negative" | "";
}) {
  return (
    <div className="vehicle-detail-metric">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function VehicleProfitabilityBreakdown({
  cars,
  vehiclePerformanceFor,
}: Props) {
  if (cars.length === 0) {
    return <div className="empty-inline">Add a vehicle to view individual profitability.</div>;
  }

  return (
    <div className="vehicle-profitability-list">
      {cars.map((car) => {
        const performance = vehiclePerformanceFor(car);
        const vehicleLabel =
          car.name || `${car.make_model} ${car.year || ""}`.trim();
        const profitTone = performance.estimatedProfit >= 0 ? "positive" : "negative";
        const completedNetIncomeTone =
          performance.completedNetIncome >= 0 ? "positive" : "negative";
        const cashFlowTone = performance.cashFlow >= 0 ? "positive" : "negative";
        return (
          <section className="vehicle-profitability-card" key={car.identification}>
            <div className="vehicle-profitability-heading">
              <div className="vehicle-performance-name">
                <span className="car-avatar large">
                  <CarFront size={20} />
                </span>
                <span>
                  <h3>{vehicleLabel}</h3>
                  <small>
                    {car.make_model} {car.year || ""} · {performance.bookings} booking{performance.bookings === 1 ? "" : "s"}
                  </small>
                </span>
              </div>
              <div className="vehicle-profitability-total">
                <span>Estimated profit</span>
                <strong className={profitTone}>{money(performance.estimatedProfit)}</strong>
                <small>{performance.operatingMargin.toFixed(1)}% booked operating margin</small>
              </div>
            </div>

            <div className="vehicle-detail-section">
              <div className="vehicle-detail-section-heading">
                <strong>Revenue and profitability</strong>
                <span>Income and operating results for this vehicle</span>
              </div>
              <div className="vehicle-detail-grid">
                <Detail label="Rental revenue" value={money(performance.revenue)} hint="Bookings overlapping selected period" />
                <Detail label="Completed rental income" value={money(performance.completedRevenue)} hint={`${performance.completedOperatingMargin.toFixed(1)}% completed operating margin`} />
                <Detail label="Operating costs" value={money(performance.operatingCosts)} hint="Excludes loan principal" />
                <Detail label="Estimated profit" value={money(performance.estimatedProfit)} hint={`After ${money(performance.depreciation)} depreciation`} tone={profitTone} />
              </div>
            </div>

            <div className="vehicle-detail-section">
              <div className="vehicle-detail-section-heading">
                <strong>Cash flow costs</strong>
                <span>Actual cash outflows and financing</span>
              </div>
              <div className="vehicle-detail-grid">
                <Detail label="Cash outflow" value={money(performance.cashExpenses)} hint="Includes loan principal" />
                <Detail label="Amount owed to bank" value={money(performance.loanBalance)} hint="Estimated principal remaining" />
                <Detail label="Loan principal paid off" value={money(performance.principalPaid)} hint="Principal repaid so far" />
                <Detail label="Remaining loan payments" value={money(performance.remainingLoanPayments)} hint="Future payments including interest" />
              </div>
            </div>

            <div className="vehicle-detail-section">
              <div className="vehicle-detail-section-heading">
                <strong>Booking performance</strong>
                <span>Revenue, distance, and rental-day averages</span>
              </div>
              <div className="vehicle-detail-grid">
                <Detail label="Average rental revenue" value={money(performance.averageRentalRevenue)} hint={`${performance.bookings} bookings`} />
                <Detail label="Total rental days" value={`${performance.rentalDays}`} hint="Days this vehicle was rented" />
                <Detail label="Booked rental days" value={`${performance.bookedDaysPercentage.toFixed(1)}%`} hint="Share of this vehicle's available days" />
                <Detail label="Average kilometres" value={`${Math.round(performance.averageKilometres).toLocaleString()} km`} hint="Per booking with recorded distance" />
                <Detail label="Average revenue / rental day" value={money(performance.averageRevenuePerRentalDay)} hint="Revenue per rental day" />
                <Detail label="Daily average kilometres" value={`${Math.round(performance.averageDailyKilometres).toLocaleString()} km`} hint="Per rental day" />
                <Detail label="Average booking length" value={`${performance.averageBookingLength.toFixed(1)} days`} hint="Per booking" />
                <Detail label="Revenue per kilometre" value={money(performance.revenuePerKilometre)} hint="Average earned per km" />
              </div>
            </div>

            <div className="vehicle-detail-section">
              <div className="vehicle-detail-section-heading">
                <strong>Operating result and cash remaining</strong>
                <span>Profit before and after depreciation, plus cash flow</span>
              </div>
              <div className="vehicle-detail-grid">
                <Detail label="Completed operating profit" value={money(performance.completedOperatingProfit)} hint={`${performance.completedOperatingMargin.toFixed(1)}% of completed income`} tone={performance.completedOperatingProfit >= 0 ? "positive" : "negative"} />
                <Detail label="Booked operating margin" value={`${performance.operatingMargin.toFixed(1)}%`} hint={`Operating profit ${money(performance.operatingProfit)}`} tone={performance.operatingMargin >= 0 ? "positive" : "negative"} />
                <Detail label="Completed cash before principal" value={money(performance.completedOperatingProfit)} hint="Completed income minus cash operating costs" tone={performance.completedOperatingProfit >= 0 ? "positive" : "negative"} />
                <Detail label="Completed net income" value={money(performance.completedNetIncome)} hint={`${performance.completedRevenue > 0 ? ((performance.completedNetIncome / performance.completedRevenue) * 100).toFixed(1) : "0.0"}% after depreciation`} tone={completedNetIncomeTone} />
                <Detail label="Completed cash flow" value={money(performance.completedCashFlow)} hint={`${performance.completedCashFlowMargin.toFixed(1)}% after loan payments`} tone={performance.completedCashFlow >= 0 ? "positive" : "negative"} />
                <Detail label="Cash flow after loan payments" value={money(performance.cashFlow)} hint={`${performance.cashFlowMargin.toFixed(1)}% of booked revenue`} tone={cashFlowTone} />
                <Detail label="Cash-flow margin" value={`${performance.cashFlowMargin.toFixed(1)}%`} hint="Cash flow as a share of booked revenue" tone={performance.cashFlowMargin >= 0 ? "positive" : "negative"} />
                <Detail label="Distance recorded" value={`${performance.rentalKm.toLocaleString()} km`} hint={`Current odometer ${performance.currentOdometer.toLocaleString()} km`} />
                <Detail label="Estimated depreciation" value={money(performance.depreciation)} hint={`${performance.completedRentalDays} completed rental days`} />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
