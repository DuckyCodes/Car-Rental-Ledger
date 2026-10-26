export type DepreciationModel = "mileage" | "declining_balance";
export type Car = {
  identification: number;
  name: string;
  make_model: string;
  year: number;
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  odometer_km: number;
  depreciation_per_km: number;
  depreciation_model: DepreciationModel;
  annual_decline_rate: number;
  residual_value: number;
  personal_insurance_monthly: number;
  commercial_insurance_daily: number;
  loan_original_amount: number;
  loan_annual_interest_rate: number;
  loan_term_months: number;
  loan_start_date: string | null;
  notes: string;
};
export type Rental = {
  identification: number;
  vehicle_identification: number;
  booking_source: string;
  renter: string;
  start_date: string;
  end_date: string;
  start_km: number;
  end_km: number;
  manually_entered_total_kilometres: number;
  commercial_insurance_used: number;
  daily_rate: number;
  direct_total_income: number;
  extra_km_rate: number;
  included_km_per_day: number;
  extra_km_revenue: number;
  turo_gross_income: number;
  turo_discount: number;
  turo_fee: number;
  turo_provincial_sales_tax: number;
  turo_goods_services_tax: number;
  on_trip_charging_fee: number;
  post_trip_charging_fee: number;
  ticket_fee: number;
  late_fee: number;
  add_on_fee: number;
  drop_off_fee: number;
  other_platform_fee: number;
  damage_fee: number;
  admin_fee: number;
  cleaning_fee: number;
  other_revenue: number;
  deposit_collected: number;
  deposit_returned: number;
  notes: string;
};
export type Expense = {
  identification: number;
  vehicle_identification: number | null;
  rental_identification: number | null;
  date: string;
  category: string;
  description: string;
  amount: number;
  treatment: string;
  recurring_monthly: number;
  receipt_path: string;
  notes: string;
};
export type Valuation = {
  identification: number;
  vehicle_identification: number;
  date: string;
  odometer_km: number;
  market_value: number;
  notes: string;
};
export type Tab =
  | "Overview"
  | "Cars"
  | "Rentals"
  | "Expenses"
  | "Valuations"
  | "Reports"
  | "Hypotheticals";
export const API = "/api";
export const today = () => new Date().toISOString().slice(0, 10);
export const money = (n: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(n || 0);
export const num = (v: any) => Number(v) || 0;
export const dateDiff = (a: string, b: string) =>
  Math.max(
    1,
    Math.floor(
      (new Date(b + "T12:00:00").getTime() -
        new Date(a + "T12:00:00").getTime()) /
        86400000,
    ),
  );
export const monthKey = (s: string) => String(s || "").slice(0, 7);
export const monthsBetween = (start: string, end: string) => {
  const months: string[] = [];
  const cursor = new Date(`${monthKey(start)}-01T12:00:00`);
  const last = new Date(`${monthKey(end)}-01T12:00:00`);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime())) return months;
  while (cursor <= last) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
};
export const blankCar = {
  name: "",
  make_model: "Tesla Model Y",
  year: new Date().getFullYear(),
  purchase_date: today(),
  purchase_price: 0,
  current_value: 0,
  odometer_km: 0,
  depreciation_model: "declining_balance" as DepreciationModel,
  depreciation_per_km: 0.15,
  annual_decline_rate: 0.2,
  residual_value: 0,
  personal_insurance_monthly: 0,
  commercial_insurance_daily: 0,
  loan_original_amount: 0,
  loan_annual_interest_rate: 0,
  loan_term_months: 0,
  loan_start_date: "",
  notes: "",
};
export const blankRental = {
  vehicle_identification: 0,
  booking_source: "Direct",
  renter: "",
  start_date: today(),
  end_date: today(),
  start_km: 0,
  end_km: 0,
  manually_entered_total_kilometres: 0,
  commercial_insurance_used: 0,
  daily_rate: 0,
  direct_total_income: 0,
  extra_km_rate: 0.5,
  included_km_per_day: 200,
  extra_km_revenue: 0,
  turo_gross_income: 0,
  turo_discount: 0,
  turo_fee: 0,
  turo_provincial_sales_tax: 0,
  turo_goods_services_tax: 0,
  on_trip_charging_fee: 0,
  post_trip_charging_fee: 0,
  ticket_fee: 0,
  late_fee: 0,
  add_on_fee: 0,
  drop_off_fee: 0,
  other_platform_fee: 0,
  damage_fee: 0,
  admin_fee: 0,
  cleaning_fee: 0,
  other_revenue: 0,
  deposit_collected: 0,
  deposit_returned: 0,
  notes: "",
};
export const blankExpense = {
  vehicle_identification: "",
  rental_identification: "",
  date: today(),
  category: "Insurance — fixed",
  description: "",
  amount: 0,
  treatment: "operating",
  recurring_monthly: 0,
  receipt_path: "",
  notes: "",
};
export const categories = [
  "Insurance — fixed",
  "Finance payment — principal",
  "Finance payment — interest",
  "Registration & licensing — fixed",
  "Parking / storage — fixed",
  "Charging / fuel",
  "Maintenance & repairs",
  "Tires",
  "Cleaning / detailing",
  "Parking & tolls",
  "Payment processing",
  "Supplies",
  "Damage / scratch repair",
  "Admin / service costs",
  "Other monthly expense",
];
