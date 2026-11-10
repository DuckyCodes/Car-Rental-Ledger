import { useMemo, useState } from "react";
import type { FocusEvent } from "react";
import { Calculator } from "lucide-react";
import { money, num } from "../../../model";
import type { Car, Rental } from "../../../model";
import { DailyRateTester } from "../../reports/DailyRateTester";

type Context = {
  cars: Car[]; rentals: Rental[]; expenses: any[];
  carExpenses: (id: number) => any[];
  insuranceCostForMonth: (car: Car, month: string) => number;
  automaticLoanBreakdownForMonth: (car: Car, month: string) => { payment: number; principal: number; interest: number };
  rentalGrossRevenue: (rental: Rental) => number;
  rentalRevenue: (rental: Rental) => number;
  rentalDistance: (rental: Rental) => number;
  insuranceConfigured: (vehicleId: number | null | undefined) => boolean;
  isManualFinanceEntry: (expense: any) => boolean;
  isManualInterestEntry: (expense: any) => boolean;
};

type Scenario = { label: string; days: number };

const selectOnFocus = (event: FocusEvent<HTMLInputElement>) => event.currentTarget.select();

function Inputs({ values, update, historicalDeduction }: { values: Record<string, string>; update: (key: string, value: string) => void; historicalDeduction: number }) {
  const fields = [
    ["dailyRate", "Daily rental rate (CAD)"],
    ["kmPerDay", "Expected km / day"],
    ["depreciation", "Depreciation / km"],
    ["deductions", "Platform deductions (%)"],
    ["usage", "Usage / utilization (%)"],
  ];
  return <div className="form-grid">{fields.map(([key, label]) => (
    <label className="field" key={key}>
      <span>{label}</span>
      <input type="number" onFocus={selectOnFocus} step={key === "depreciation" || key === "deductions" ? "0.01" : undefined} min={key === "usage" ? 0 : undefined} value={values[key]} placeholder={key === "deductions" ? historicalDeduction.toFixed(1) : undefined} onChange={(event) => update(key, event.target.value)} />
    </label>
  ))}</div>;
}

function ScenarioCard({ scenario }: { scenario: any }) {
  const metrics = [["Operating margin", `${scenario.operatingMargin.toFixed(1)}%`], ["Cash margin", `${scenario.cashMargin.toFixed(1)}%`], ["Revenue / km", money(scenario.revenuePerKm)], ["Cash / km", money(scenario.cashPerKm)]];
  return <section className="panel hypothetical-card">
    <h3>{scenario.label}</h3>
    <div className="hypothetical-revenue">{money(scenario.revenue)}<small>estimated net revenue</small></div>
    <div className="economics-row"><span>Operating cost incl. depreciation</span><strong>{money(scenario.operatingCost)}</strong></div>
    <div className="economics-row"><span>Cash cost incl. finance</span><strong>{money(scenario.cashCost)}</strong></div>
    <div className="hypothetical-metrics">{metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
  </section>;
}

function calculateScenario(scenario: Scenario, dailyRate: number, kmPerDay: number, depreciation: number, deductionRate: number, costs: { operating: number; finance: number }) {
  const gross = dailyRate * scenario.days;
  const revenue = gross * (1 - deductionRate / 100);
  const kilometres = kmPerDay * scenario.days;
  const sharedCosts = (costs.operating + costs.finance) * scenario.days / 30;
  const operatingCost = sharedCosts + kilometres * depreciation;
  const cashCost = sharedCosts;
  return { ...scenario, revenue, operatingCost, cashCost, operatingMargin: revenue ? ((revenue - operatingCost) / revenue) * 100 : 0, cashMargin: revenue ? ((revenue - cashCost) / revenue) * 100 : 0, revenuePerKm: kilometres ? revenue / kilometres : 0, cashPerKm: kilometres ? (revenue - cashCost) / kilometres : 0 };
}

export function HypotheticalsPage({ context }: { context: Context }) {
  const { cars, rentals, expenses, carExpenses, insuranceCostForMonth, automaticLoanBreakdownForMonth, rentalGrossRevenue, rentalRevenue, rentalDistance, insuranceConfigured, isManualFinanceEntry, isManualInterestEntry } = context;
  const [carId, setCarId] = useState(cars[0]?.identification ?? 0);
  const [values, setValues] = useState({ dailyRate: "125", kmPerDay: "100", depreciation: "0.15", deductions: "", usage: "50" });
  const month = new Date().toISOString().slice(0, 7);
  const car = cars.find((candidate) => candidate.identification === carId) ?? cars[0];
  const update = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));

  const costs = useMemo(() => {
    if (!car) return { operating: 0, finance: 0 };
    const recurring = carExpenses(car.identification).filter((expense) => expense.recurring_monthly);
    const operatingExpenses = recurring.filter((expense) => !expense.category.startsWith("Finance") && expense.treatment !== "loan_principal").reduce((total, expense) => total + num(expense.amount), 0);
    return { operating: insuranceCostForMonth(car, month) + operatingExpenses, finance: automaticLoanBreakdownForMonth(car, month).payment };
  }, [car, month, carExpenses, insuranceCostForMonth, automaticLoanBreakdownForMonth]);

  const historicalDeduction = useMemo(() => {
    const completed = rentals.filter((rental) => rental.vehicle_identification === car?.identification && rental.end_date <= new Date().toISOString().slice(0, 10));
    const gross = completed.reduce((total, rental) => total + rentalGrossRevenue(rental), 0);
    const net = completed.reduce((total, rental) => total + rentalRevenue(rental), 0);
    return gross ? ((gross - net) / gross) * 100 : 0;
  }, [rentals, car, rentalGrossRevenue, rentalRevenue]);

  if (!car) return <div className="empty-state"><h3>Add a vehicle first</h3><p>Hypotheticals use your vehicle costs and depreciation settings.</p></div>;

  const usage = Math.min(100, Math.max(0, num(values.usage)));
  const deductionRate = values.deductions === "" ? historicalDeduction : num(values.deductions);
  const scenarios = [{ label: "3 days", days: 3 }, { label: "1 week", days: 7 }, { label: `1 month · ${((30 * usage) / 100).toFixed(1)} rental days`, days: (30 * usage) / 100 }];
  const results = scenarios.map((scenario) => calculateScenario(scenario, num(values.dailyRate), num(values.kmPerDay), num(values.depreciation), deductionRate, costs));

  return <>
    <div className="toolbar"><div><h2>Profitability hypotheticals</h2><p>Test 3-day, weekly, and monthly rental scenarios.</p></div><select value={car.identification} onChange={(event) => setCarId(Number(event.target.value))}>{cars.map((candidate) => <option key={candidate.identification} value={candidate.identification}>{candidate.name}</option>)}</select></div>
    <div className="panel hypothetical-controls"><Inputs values={values} update={update} historicalDeduction={historicalDeduction} /><div className="note-box"><Calculator size={16} /><span>{usage}% utilization equals about {((30 * usage) / 100).toFixed(1)} rental days per month. Monthly operating costs {money(costs.operating)} · Finance {money(costs.finance)} · Historical deduction default {historicalDeduction.toFixed(1)}%</span></div></div>
    <div className="hypothetical-grid">{results.map((scenario) => <ScenarioCard key={scenario.label} scenario={scenario} />)}</div>
    <DailyRateTester cars={cars} rentals={rentals} expenses={expenses} rentalGrossRevenue={rentalGrossRevenue} rentalRevenue={rentalRevenue} rentalDistance={rentalDistance} insuranceCostForMonth={insuranceCostForMonth} insuranceConfigured={insuranceConfigured} isManualFinanceEntry={isManualFinanceEntry} isManualInterestEntry={isManualInterestEntry} automaticFinanceForMonth={automaticLoanBreakdownForMonth} />
  </>;
}
