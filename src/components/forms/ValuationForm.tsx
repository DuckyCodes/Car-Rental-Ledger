import { useState } from "react";
import { Upload } from "lucide-react";
import { Field, FormActions } from "../Ui";
import {
  blankCar,
  blankRental,
  blankExpense,
  categories,
  money,
  num,
  today,
} from "../../model";
import type { Car, Rental, Expense, Valuation } from "../../model";
import type { PublicMarketEstimate } from "../../model";

export function ValuationForm({
  initial,
  cars,
  rentals = [],
  valuations = [],
  publicEstimates = {},
  onSave,
  onCancel,
}: {
  initial: any;
  cars: Car[];
  rentals?: Rental[];
  valuations?: Valuation[];
  publicEstimates?: Record<number, PublicMarketEstimate | null>;
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
  const publicEstimate = publicEstimates[num(d.vehicle_identification)];
  const marketValue = publicEstimate?.marketValue || num(d.market_value);
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...d,
          vehicle_identification: num(d.vehicle_identification),
          odometer_km: num(d.odometer_km),
          market_value: marketValue,
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
        <output className="calculated-field">
          {publicEstimate ? money(marketValue) : "Public estimate unavailable"}
        </output>
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
          The value is pulled from public comparable listings for this trim and
          province. Saving it updates the vehicle's current-value snapshot.
        </div>
      </div>
      <div className="wide">
        <FormActions onCancel={onCancel} submit="Save valuation" />
      </div>
    </form>
  );
}
