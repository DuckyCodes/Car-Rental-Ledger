import { useState } from "react";
import { Upload } from "lucide-react";
import { Field, FormActions } from "../Ui";
import {
  blankCar,
  blankRental,
  blankExpense,
  categories,
  num,
  today,
} from "../../model";
import type { Car, Rental, Expense, Valuation } from "../../model";

export function ValuationForm({
  initial,
  cars,
  rentals = [],
  valuations = [],
  onSave,
  onCancel,
}: {
  initial: any;
  cars: Car[];
  rentals?: Rental[];
  valuations?: Valuation[];
  onSave: (d: any) => void;
  onCancel: () => void;
}) {
  const highestKnownOdometer = (vehicleIdentification: number) => {
    const car = cars.find((x) => x.identification === vehicleIdentification);
    const valuationKm = valuations
      .filter((x) => x.vehicle_identification === vehicleIdentification)
      .map((x) => num(x.odometer_km));
    const rentalKm = rentals
      .filter((x) => x.vehicle_identification === vehicleIdentification)
      .flatMap((x) => [num(x.start_km), num(x.end_km)]);
    return Math.max(num(car?.odometer_km), ...valuationKm, ...rentalKm, 0);
  };
  const initialVehicle = num(initial.vehicle_identification) || cars[0]?.identification || 0;
  const [d, setD] = useState({
    ...initial,
    vehicle_identification: initialVehicle,
    odometer_km: initial.identification
      ? num(initial.odometer_km)
      : highestKnownOdometer(initialVehicle),
  });
  const set = (k: string, v: any) => setD((p: any) => ({ ...p, [k]: v }));
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...d,
          vehicle_identification: num(d.vehicle_identification),
          odometer_km: num(d.odometer_km),
          market_value: num(d.market_value),
        });
      }}
    >
      <Field label="Vehicle">
        <select
          value={d.vehicle_identification}
          onChange={(e) => {
            set("vehicle_identification", e.target.value);
            const c = cars.find(
              (x) => x.identification === num(e.target.value),
            );
            if (c) {
              set("odometer_km", highestKnownOdometer(c.identification));
            }
          }}
        >
          {cars.map((c) => (
            <option key={c.identification} value={c.identification}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Valuation date">
        <input
          type="date"
          required
          value={d.date}
          onChange={(e) => set("date", e.target.value)}
        />
      </Field>
      <Field label="Odometer (km)">
        <input
          type="number"
          min="0"
          value={d.odometer_km}
          readOnly
        />
      </Field>
      <Field label="Estimated market value (CAD)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={d.market_value}
          onChange={(e) => set("market_value", e.target.value)}
        />
      </Field>
      <Field label="Notes / source of estimate" wide>
        <textarea
          rows={2}
          value={d.notes || ""}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="e.g. Comparable listings, dealer quote"
        />
      </Field>
      <div className="field wide">
        <div className="hint-box">
          Odometer is automatically set to the highest known kilometre reading
          from this vehicle, valuation history, and rental records.
          Enter your estimated market value here. Saving it updates the
          vehicle's current value; the depreciation rate remains a separate
          planning estimate.
        </div>
      </div>
      <div className="wide">
        <FormActions onCancel={onCancel} submit="Save valuation" />
      </div>
    </form>
  );
}
