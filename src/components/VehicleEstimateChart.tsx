import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Car } from "../model";
import { estimateCanadaVehicleCosts } from "../canadaVehicleEstimator";

export function VehicleEstimateChart({ car }: { car: Car }) {
  const currentYear = new Date().getFullYear();
  const estimate = estimateCanadaVehicleCosts(car, currentYear);
  const currentValue = Math.max(0, Number(car.current_value) || Number(car.purchase_price) || 0);
  const data = Array.from({ length: 7 }, (_, index) => {
    const age = estimate.ageYears + index;
    const value = currentValue * Math.pow(1 - (age <= 3 ? 0.18 : age <= 6 ? 0.12 : age <= 10 ? 0.09 : 0.07), index);
    const maintenance = Math.max(900, Number(car.purchase_price) * 0.035) *
      (1 + Math.max(0, age - 3) * 0.08);
    const repairRisk = Math.min(65, 3 + Math.max(0, age - 3) * 2.5 + Math.max(0, Number(car.odometer_km) - 80000) / 4000);
    return { year: currentYear + index, value, maintenance, repairRisk };
  });
  return (
    <div className="estimate-chart" role="img" aria-label="Projected vehicle value, annual maintenance, and major repair risk by year">
      <div className="panel-heading">
        <div>
          <strong>Estimated outlook</strong>
          <p>Value, maintenance, and repair risk</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={170}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#edf1f5" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="money" tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="percent" orientation="right" domain={[0, 70]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip formatter={(value: any, name: string) => name === "repairRisk" ? [`${Number(value).toFixed(1)}%`, "Major repair risk"] : [money(Number(value)), name === "value" ? "Estimated value" : "Annual maintenance"]} />
          <Line yAxisId="money" type="monotone" dataKey="value" stroke="#159f79" strokeWidth={2} dot={false} />
          <Line yAxisId="money" type="monotone" dataKey="maintenance" stroke="#d88b18" strokeWidth={2} dot={false} />
          <Line yAxisId="percent" type="monotone" dataKey="repairRisk" stroke="#d54b5b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="estimate-chart-legend"><span className="estimate-value-dot" /> Value <span className="estimate-maintenance-dot" /> Maintenance <span className="estimate-risk-dot" /> Repair risk</div>
    </div>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value || 0);
}
