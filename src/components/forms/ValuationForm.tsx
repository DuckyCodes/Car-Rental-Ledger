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
  onSave,
  onCancel,
}: {
  initial: any;
  cars: Car[];
  onSave: (d: any) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState({ ...initial });
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
              set("odometer_km", c.odometer_km);
              set("market_value", c.current_value);
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
          onChange={(e) => set("odometer_km", e.target.value)}
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
      <div className="wide">
        <FormActions onCancel={onCancel} submit="Save valuation" />
      </div>
    </form>
  );
}
