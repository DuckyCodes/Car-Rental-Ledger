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

export function ExpenseForm({
  initial,
  cars,
  rentals,
  uploadReceipt,
  onSave,
  onCancel,
}: {
  initial: any;
  cars: Car[];
  rentals: Rental[];
  uploadReceipt: (f: File) => Promise<{ path: string }>;
  onSave: (d: any) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState({
    ...blankExpense,
    ...initial,
    vehicle_identification: initial.vehicle_identification ?? "",
    rental_identification: initial.rental_identification ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: any) => setD((p: any) => ({ ...p, [k]: v }));
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...d,
          vehicle_identification:
            d.vehicle_identification === ""
              ? null
              : num(d.vehicle_identification),
          rental_identification:
            d.rental_identification === ""
              ? null
              : num(d.rental_identification),
          amount: num(d.amount),
          recurring_monthly: d.recurring_monthly ? 1 : 0,
        });
      }}
    >
      <Field label="Date">
        <input
          type="date"
          required
          value={d.date}
          onChange={(e) => set("date", e.target.value)}
        />
      </Field>
      <Field label="Amount (CAD)">
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={d.amount}
          onChange={(e) => set("amount", e.target.value)}
        />
      </Field>
      <Field label="Category">
        <select
          value={d.category}
          onChange={(e) => set("category", e.target.value)}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label="Accounting treatment">
        <select
          value={d.treatment}
          onChange={(e) => set("treatment", e.target.value)}
        >
          <option value="operating">Operating expense / interest</option>
          <option value="loan_principal">Loan principal (cash only)</option>
          <option value="capital">Capital asset / improvement</option>
        </select>
      </Field>
      <Field label="Repeats every month">
        <input
          type="checkbox"
          checked={Boolean(d.recurring_monthly)}
          onChange={(e) => set("recurring_monthly", e.target.checked ? 1 : 0)}
        />
      </Field>
      <Field label="Vehicle">
        <select
          value={d.vehicle_identification}
          onChange={(e) => set("vehicle_identification", e.target.value)}
        >
          <option value="">Unassigned / general</option>
          {cars.map((c) => (
            <option key={c.identification} value={c.identification}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Link to rental (optional)">
        <select
          value={d.rental_identification}
          onChange={(e) => {
            set("rental_identification", e.target.value);
            const r = rentals.find(
              (x) => x.identification === num(e.target.value),
            );
            if (r)
              set("vehicle_identification", String(r.vehicle_identification));
          }}
        >
          <option value="">Not linked to a specific rental</option>
          {rentals.map((r) => (
            <option key={r.identification} value={r.identification}>
              #{r.identification} · {r.renter || "Rental"} · {r.start_date}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Description" wide>
        <input
          value={d.description || ""}
          onChange={(e) => set("description", e.target.value)}
          placeholder="e.g. Monthly insurance premium"
        />
      </Field>
      <Field label="Receipt (PDF / JPG / PNG / WEBP)" wide>
        <div className="receipt-upload">
          <label className="upload-button secondary">
            <Upload size={16} />
            {busy
              ? "Uploading…"
              : d.receipt_path
                ? "Replace receipt"
                : "Choose receipt"}
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setBusy(true);
                setErr("");
                try {
                  const out = await uploadReceipt(f);
                  set("receipt_path", out.path);
                } catch (ex: any) {
                  setErr(ex.message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          <span>
            {d.receipt_path
              ? d.receipt_path.split("/").pop()
              : "No file selected"}
          </span>
        </div>
        {err && <small className="form-error">{err}</small>}
      </Field>
      <Field label="Notes" wide>
        <textarea
          rows={2}
          value={d.notes || ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Field>
      <div className="wide">
        <div className="hint-box">
          Loan principal is included in cash flow but excluded from the profit
          estimate. Record interest separately as an operating expense. Capital
          items are stored separately but currently excluded from the
          operating-profit estimate.
        </div>
        <FormActions onCancel={onCancel} submit="Save expense" />
      </div>
    </form>
  );
}
