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

export function RentalForm({
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
  const [d, setD] = useState({ ...blankRental, ...initial });
  const set = (k: string, v: any) => setD((p: any) => ({ ...p, [k]: v }));
  const directDepositDeductions =
    num(d.on_trip_charging_fee) +
    num(d.post_trip_charging_fee) +
    num(d.ticket_fee) +
    num(d.late_fee) +
    num(d.add_on_fee) +
    num(d.drop_off_fee) +
    num(d.damage_fee) +
    num(d.admin_fee);
  const depositToReturn = Math.max(
    0,
    num(d.deposit_collected) - directDepositDeductions,
  );
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...d,
          vehicle_identification: num(d.vehicle_identification),
          start_km: num(d.start_km),
          end_km: num(d.end_km),
          manually_entered_total_kilometres: num(
            d.manually_entered_total_kilometres,
          ),
          commercial_insurance_used: d.commercial_insurance_used ? 1 : 0,
          daily_rate: num(d.daily_rate),
          direct_total_income: num(d.direct_total_income),
          extra_km_rate: num(d.extra_km_rate),
          included_km_per_day: num(d.included_km_per_day),
          extra_km_revenue: num(d.extra_km_revenue),
          turo_gross_income: num(d.turo_gross_income),
          turo_discount: num(d.turo_discount),
          turo_fee: num(d.turo_fee),
          turo_provincial_sales_tax: num(d.turo_provincial_sales_tax),
          turo_goods_services_tax: num(d.turo_goods_services_tax),
          on_trip_charging_fee: num(d.on_trip_charging_fee),
          post_trip_charging_fee: num(d.post_trip_charging_fee),
          ticket_fee: num(d.ticket_fee),
          late_fee: num(d.late_fee),
          add_on_fee: num(d.add_on_fee),
          drop_off_fee: num(d.drop_off_fee),
          other_platform_fee: num(d.other_platform_fee),
          damage_fee: num(d.damage_fee),
          admin_fee: num(d.admin_fee),
          cleaning_fee: num(d.cleaning_fee),
          other_revenue: num(d.other_revenue),
          deposit_collected: num(d.deposit_collected),
          deposit_returned: depositToReturn,
        });
      }}
    >
      <Field label="Vehicle">
        <select
          required
          value={d.vehicle_identification}
          onChange={(e) => set("vehicle_identification", e.target.value)}
        >
          {cars.map((c) => (
            <option key={c.identification} value={c.identification}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Booking source">
        <select
          value={d.booking_source}
          onChange={(e) => set("booking_source", e.target.value)}
        >
          <option>Direct</option>
          <option>Turo</option>
          <option>Other platform</option>
        </select>
      </Field>
      {d.booking_source === "Turo" && (
        <div className="field wide">
          <div className="section-divider">Turo booking details</div>
        </div>
      )}
      {d.booking_source === "Turo" && (
        <>
          <Field label="Turo gross trip income (CAD; includes fees, taxes and charging reimbursements)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={d.turo_gross_income}
              onChange={(e) => set("turo_gross_income", e.target.value)}
            />
          </Field>
          <Field label="Turo discounts (reference only; excluded from totals)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={d.turo_discount}
              onChange={(e) => set("turo_discount", e.target.value)}
            />
          </Field>
          <Field label="Turo fees (subtracted from trip earnings)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={d.turo_fee}
              onChange={(e) => set("turo_fee", e.target.value)}
            />
          </Field>
          <Field label="Provincial sales tax (subtracted from trip earnings)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={d.turo_provincial_sales_tax}
              onChange={(e) => set("turo_provincial_sales_tax", e.target.value)}
            />
          </Field>
          <Field label="Goods and services tax (subtracted from trip earnings)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={d.turo_goods_services_tax}
              onChange={(e) => set("turo_goods_services_tax", e.target.value)}
            />
          </Field>
          <Field label="On-trip charging reimbursement (subtracted from trip earnings)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={d.on_trip_charging_fee}
              onChange={(e) => set("on_trip_charging_fee", e.target.value)}
            />
          </Field>
          <Field label="Post-trip charging reimbursement (subtracted from trip earnings)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={d.post_trip_charging_fee}
              onChange={(e) => set("post_trip_charging_fee", e.target.value)}
            />
          </Field>
          <Field label="Other Turo fees (reference only; excluded from totals)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={d.other_platform_fee}
              onChange={(e) => set("other_platform_fee", e.target.value)}
            />
          </Field>
        </>
      )}
      {d.booking_source === "Direct" && (
        <>
          <div className="field wide"><div className="section-divider">Direct rental income</div></div>
          <Field label="Total direct rental income (CAD; overrides daily income)">
            <input type="number" min="0" step="0.01" value={d.direct_total_income} onChange={(e) => set("direct_total_income", e.target.value)} />
          </Field>
          <div className="field wide"><div className="section-divider">Pass-through reimbursements (excluded from profit)</div></div>
          <Field label="On-trip charging fee (CAD; deducted from deposit)">
            <input type="number" min="0" step="0.01" value={d.on_trip_charging_fee} onChange={(e) => set("on_trip_charging_fee", e.target.value)} />
          </Field>
          <Field label="Post-trip charging fee (CAD; deducted from deposit)">
            <input type="number" min="0" step="0.01" value={d.post_trip_charging_fee} onChange={(e) => set("post_trip_charging_fee", e.target.value)} />
          </Field>
          <Field label="Tickets (CAD; deducted from deposit)">
            <input type="number" min="0" step="0.01" value={d.ticket_fee} onChange={(e) => set("ticket_fee", e.target.value)} />
          </Field>
          <div className="field wide"><div className="section-divider">Income-producing fees (deducted from deposit and included in profit)</div></div>
          <Field label="Late fee (CAD; deducted from deposit)">
            <input type="number" min="0" step="0.01" value={d.late_fee} onChange={(e) => set("late_fee", e.target.value)} />
          </Field>
          <Field label="Add-on fee (CAD; deducted from deposit)">
            <input type="number" min="0" step="0.01" value={d.add_on_fee} onChange={(e) => set("add_on_fee", e.target.value)} />
          </Field>
          <Field label="Drop-off fee (CAD; deducted from deposit)">
            <input type="number" min="0" step="0.01" value={d.drop_off_fee} onChange={(e) => set("drop_off_fee", e.target.value)} />
          </Field>
        </>
      )}
      <Field label="Renter / booking name">
        <input
          value={d.renter || ""}
          onChange={(e) => set("renter", e.target.value)}
          placeholder="Optional"
        />
      </Field>
      <Field label="Rental start date">
        <input
          type="date"
          required
          value={d.start_date}
          onChange={(e) => set("start_date", e.target.value)}
        />
      </Field>
      <Field label="Rental end date">
        <input
          type="date"
          required
          min={d.start_date}
          value={d.end_date}
          onChange={(e) => set("end_date", e.target.value)}
        />
      </Field>
      <Field label="Daily rental income (CAD)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={d.daily_rate}
          onChange={(e) => set("daily_rate", e.target.value)}
        />
      </Field>
      <Field label="Included km per rental day">
        <input
          type="number"
          min="0"
          value={d.included_km_per_day}
          onChange={(e) => set("included_km_per_day", e.target.value)}
        />
      </Field>
      <Field label="Extra km charge (CAD)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={d.extra_km_rate}
          onChange={(e) => set("extra_km_rate", e.target.value)}
        />
      </Field>
      <Field label="Additional extra-km income (CAD)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={d.extra_km_revenue}
          onChange={(e) => set("extra_km_revenue", e.target.value)}
        />
      </Field>
      <Field label="Other vehicle income (CAD)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={d.other_revenue}
          onChange={(e) => set("other_revenue", e.target.value)}
        />
      </Field>
      <div className="field wide"><div className="section-divider">Additional income-producing fees</div></div>
      <Field label="Damage / scratch fees (CAD; deducted from deposit and included in totals)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={d.damage_fee}
          onChange={(e) => set("damage_fee", e.target.value)}
        />
      </Field>
      <Field label="Admin fee (CAD; deducted from deposit and included in totals)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={d.admin_fee}
          onChange={(e) => set("admin_fee", e.target.value)}
        />
      </Field>
      <Field label="Cleaning fees (CAD)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={d.cleaning_fee}
          onChange={(e) => set("cleaning_fee", e.target.value)}
        />
      </Field>
      <Field label="Security deposit collected (CAD)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={d.deposit_collected}
          onChange={(e) => set("deposit_collected", e.target.value)}
        />
      </Field>
      <Field label="Security deposit to return (CAD)">
        <input
          type="text"
          readOnly
          value={depositToReturn.toFixed(2)}
        />
      </Field>
      <div className="field wide">
        <div className="section-divider">
          Odometer readings (used for vehicle distance and depreciation)
        </div>
      </div>
      <Field label="Starting odometer (km)">
        <input
          type="number"
          min="0"
          value={d.start_km}
          onChange={(e) => set("start_km", e.target.value)}
        />
      </Field>
      <Field label="Ending odometer (km)">
        <input
          type="number"
          min="0"
          value={d.end_km}
          onChange={(e) => set("end_km", e.target.value)}
        />
      </Field>
      <Field label="Rental km (manual override)">
        <input
          type="number"
          min="0"
          value={d.manually_entered_total_kilometres}
          onChange={(e) =>
            set("manually_entered_total_kilometres", e.target.value)
          }
        />
      </Field>
      <Field label="Commercial insurance used for this rental">
        <input
          type="checkbox"
          checked={Boolean(d.commercial_insurance_used)}
          onChange={(e) =>
            set("commercial_insurance_used", e.target.checked ? 1 : 0)
          }
        />
      </Field>
      <Field label="Notes" wide>
        <textarea
          rows={2}
          value={d.notes || ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Field>
      <div className="wide">
        <FormActions onCancel={onCancel} submit="Save rental" />
      </div>
    </form>
  );
}
