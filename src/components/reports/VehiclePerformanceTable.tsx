import { CarFront } from "lucide-react";
import { money } from "../../model";
import type { Car, VehiclePerformance } from "../../model";

type CalculationDetails = {
  title: string;
  definition: string;
  formula: string;
  items: { label: string; value: string }[];
};

type Props = {
  cars: Car[];
  vehiclePerformanceFor: (car: Car) => VehiclePerformance;
  showCalculation?: (details: CalculationDetails) => void;
};

export function VehiclePerformanceTable({
  cars,
  vehiclePerformanceFor,
  showCalculation,
}: Props) {
  const rows = cars
    .map(vehiclePerformanceFor)
    .sort((first, second) => second.estimatedProfit - first.estimatedProfit);

  if (rows.length === 0) {
    return <div className="empty-inline">Add a vehicle to compare performance.</div>;
  }

  return (
    <div className="vehicle-performance-table-wrap">
      <table className="vehicle-performance-table">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Bookings</th>
            <th>Revenue</th>
            <th>Utilization</th>
            <th>Rental days</th>
            <th>Revenue / day</th>
            <th>Operating costs</th>
            <th>Estimated profit</th>
            <th>Margin</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((performance) => {
            const vehicleLabel =
              performance.car.name ||
              `${performance.car.make_model} ${performance.car.year || ""}`.trim();
            return (
              <tr key={performance.car.identification}>
                <td>
                  <div className="vehicle-performance-name">
                    <span className="car-avatar">
                      <CarFront size={16} />
                    </span>
                    <span>
                      <strong>{vehicleLabel}</strong>
                      <small>{performance.rentalKm.toLocaleString()} km rented</small>
                    </span>
                  </div>
                </td>
                <td>{performance.bookings}</td>
                <td className="amount-cell">{money(performance.revenue)}</td>
                <td>{performance.utilization.toFixed(1)}%</td>
                <td>{performance.rentalDays}</td>
                <td>{money(performance.averageRevenuePerDay)}</td>
                <td>{money(performance.operatingCosts)}</td>
                <td className={performance.estimatedProfit >= 0 ? "positive" : "negative"}>
                  {money(performance.estimatedProfit)}
                </td>
                <td className={performance.profitMargin >= 0 ? "positive" : "negative"}>
                  {performance.profitMargin.toFixed(1)}%
                </td>
                <td>
                  {showCalculation && (
                    <button
                      className="secondary small"
                      onClick={() =>
                        showCalculation({
                          title: `${vehicleLabel} — performance`,
                          definition:
                            "Performance for this vehicle in the selected period. Loan principal is shown as a cash outflow but is excluded from estimated profit.",
                          formula:
                            "Revenue − operating costs − estimated depreciation = estimated profit",
                          items: [
                            { label: "Bookings", value: `${performance.bookings}` },
                            { label: "Rental revenue", value: money(performance.revenue) },
                            { label: "Operating costs", value: money(performance.operatingCosts) },
                            { label: "Loan principal (cash only)", value: money(performance.principal) },
                            { label: "Cash flow after loan payments", value: money(performance.cashFlow) },
                            { label: "Rental days", value: `${performance.rentalDays}` },
                            { label: "Utilization", value: `${performance.utilization.toFixed(1)}%` },
                            { label: "Estimated depreciation", value: money(performance.depreciation) },
                            { label: "Estimated profit", value: money(performance.estimatedProfit) },
                            { label: "Profit margin", value: `${performance.profitMargin.toFixed(1)}%` },
                          ],
                        })
                      }
                    >
                      Details
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
