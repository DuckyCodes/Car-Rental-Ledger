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

export function CarForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: any;
  onSave: (d: any) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState({ ...blankCar, ...initial });
  const set = (k: string, v: any) => setD((p: any) => ({ ...p, [k]: v }));
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...d,
          year: num(d.year),
          purchase_price: num(d.purchase_price),
          current_value: num(d.current_value),
          odometer_km: num(d.odometer_km),
          depreciation_per_km: num(d.depreciation_per_km),
          annual_decline_rate: num(d.annual_decline_rate),
          residual_value: num(d.residual_value),
          personal_insurance_monthly: num(d.personal_insurance_monthly),
          commercial_insurance_daily: num(d.commercial_insurance_daily),
          loan_original_amount: num(d.loan_original_amount),
          loan_annual_interest_rate: num(d.loan_annual_interest_rate),
          loan_term_months: num(d.loan_term_months),
          loan_start_date: d.loan_start_date || null,
        });
      }}
    >
      <Field label="Vehicle nickname">
        <input
          required
          value={d.name}
          placeholder="e.g. Model Y - White"
          onChange={(e) => set("name", e.target.value)}
        />
      </Field>
      <Field label="Make / model">
        <input
          value={d.make_model}
          onChange={(e) => set("make_model", e.target.value)}
        />
      </Field>
      <Field label="Model year">
        <input
          type="number"
          value={d.year || ""}
          onChange={(e) => set("year", e.target.value)}
        />
      </Field>
      <Field label="Purchase date">
        <input
          type="date"
          value={d.purchase_date || ""}
          onChange={(e) => set("purchase_date", e.target.value)}
        />
      </Field>
      <Field label="Purchase price (CAD)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={d.purchase_price}
          onChange={(e) => set("purchase_price", e.target.value)}
        />
      </Field>
      <Field label="Current market value (CAD)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={d.current_value}
          onChange={(e) => set("current_value", e.target.value)}
        />
      </Field>
      <Field label="Current odometer (km)">
        <input
          type="number"
          min="0"
          value={d.odometer_km}
          onChange={(e) => set("odometer_km", e.target.value)}
        />
      </Field>
      <Field label="Personal insurance per month (CAD)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={d.personal_insurance_monthly}
          onChange={(e) => set("personal_insurance_monthly", e.target.value)}
        />
      </Field>
      <Field label="Commercial insurance per rental day (CAD)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={d.commercial_insurance_daily}
          onChange={(e) => set("commercial_insurance_daily", e.target.value)}
        />
      </Field>
      <div className="field wide">
        <div className="section-divider">Vehicle loan details (optional)</div>
      </div>
      <Field label="Original loan amount (CAD)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={d.loan_original_amount}
          onChange={(e) => set("loan_original_amount", e.target.value)}
        />
      </Field>
      <Field label="Annual interest rate (%)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={d.loan_annual_interest_rate}
          onChange={(e) => set("loan_annual_interest_rate", e.target.value)}
        />
      </Field>
      <Field label="Loan term (months)">
        <input
          type="number"
          min="0"
          step="1"
          value={d.loan_term_months || ""}
          onChange={(e) => set("loan_term_months", e.target.value)}
        />
      </Field>
      <Field label="Loan payment start date">
        <input
          type="date"
          value={d.loan_start_date || ""}
          onChange={(e) => set("loan_start_date", e.target.value)}
        />
      </Field>
      <div className="field wide">
        <div className="hint-box">
          When all four loan fields are entered, monthly principal and interest
          are calculated automatically. Existing manual finance entries are
          replaced in reports for that vehicle to prevent double counting.
        </div>
      </div>
      <Field label="Depreciation method">
        <select
          value={d.depreciation_model}
          onChange={(e) => set("depreciation_model", e.target.value)}
        >
          <option value="declining_balance">Age-based declining balance</option>
          <option value="mileage">Mileage-based estimate</option>
        </select>
      </Field>
      {d.depreciation_model === "declining_balance" ? (
        <>
          <Field label="Annual decline rate">
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={d.annual_decline_rate}
              onChange={(e) => set("annual_decline_rate", e.target.value)}
            />
          </Field>
          <Field label="Residual value (CAD)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={d.residual_value}
              onChange={(e) => set("residual_value", e.target.value)}
            />
          </Field>
        </>
      ) : (
        <Field label="Estimated depreciation / km (CAD)">
          <input
            type="number"
            min="0"
            step="0.01"
            value={d.depreciation_per_km}
            onChange={(e) => set("depreciation_per_km", e.target.value)}
          />
        </Field>
      )}
      <Field label="Notes" wide>
        <textarea
          rows={2}
          value={d.notes || ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Field>
      <div className="wide">
        <FormActions onCancel={onCancel} submit="Save vehicle" />
      </div>
    </form>
  );
}
