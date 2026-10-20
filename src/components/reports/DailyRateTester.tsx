import { useEffect, useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { dateDiff, money, num, today } from "../../model";
import type { Car, Expense, Rental } from "../../model";

type Props = {
  cars: Car[];
  rentals: Rental[];
  expenses: Expense[];
  rentalGrossRevenue: (rental: Rental) => number;
  rentalRevenue: (rental: Rental) => number;
  rentalDistance: (rental: Rental) => number;
  insuranceCostForMonth: (car: Car, month: string) => number;
  insuranceConfigured: (vehicleId: number | null | undefined) => boolean;
  isManualFinanceEntry: (expense: Expense) => boolean;
  isManualInterestEntry: (expense: Expense) => boolean;
  automaticFinanceForMonth: (
    car: Car,
    month: string,
  ) => { payment: number; principal: number; interest: number };
};

const monthlyDays = 30;

export function DailyRateTester({
  cars,
  rentals,
  expenses,
  rentalGrossRevenue,
  rentalRevenue,
  rentalDistance,
  insuranceCostForMonth,
  insuranceConfigured,
  isManualFinanceEntry,
  isManualInterestEntry,
  automaticFinanceForMonth,
}: Props) {
  const [vehicleId, setVehicleId] = useState(cars[0]?.identification ?? 0);
  const car = cars.find((vehicle) => vehicle.identification === vehicleId) ?? cars[0];
  const currentMonth = today().slice(0, 7);
  const vehicleExpenses = expenses.filter(
    (expense) => expense.vehicle_identification === car?.identification,
  );
  const recurringVehicleExpenses = vehicleExpenses.filter(
    (expense) => expense.recurring_monthly && expense.date <= today(),
  );
  const manualMonthlyFinance = recurringVehicleExpenses
    .filter(isManualFinanceEntry)
    .reduce((total, expense) => total + num(expense.amount), 0);
  const manualMonthlyInterest = recurringVehicleExpenses
    .filter(isManualInterestEntry)
    .reduce((total, expense) => total + num(expense.amount), 0);
  const automaticFinance = car
    ? automaticFinanceForMonth(car, currentMonth)
    : { payment: 0, principal: 0, interest: 0 };
  const monthlyOperatingCost =
    (car ? insuranceCostForMonth(car, currentMonth) : 0) +
    vehicleExpenses
      .filter(
        (expense) =>
          expense.recurring_monthly &&
          expense.date <= today() &&
          !isManualFinanceEntry(expense) &&
          !(
            expense.category.startsWith("Insurance") &&
            insuranceConfigured(expense.vehicle_identification)
          ),
      )
      .reduce((total, expense) => total + num(expense.amount), 0);
  const monthlyFinancePayment = automaticFinance.payment + manualMonthlyFinance;
  const monthlyFinanceInterest = automaticFinance.interest + manualMonthlyInterest;
  const relevantCompletedRentals = rentals.filter(
    (rental) =>
      rental.vehicle_identification === car?.identification &&
      rental.end_date <= today(),
  );
  const turoCompleted = relevantCompletedRentals.filter(
    (rental) => rental.booking_source === "Turo" && num(rental.turo_gross_income) > 0,
  );
  const turoGross = turoCompleted.reduce(
    (total, rental) => total + rentalGrossRevenue(rental),
    0,
  );
  const turoNet = turoCompleted.reduce(
    (total, rental) => total + rentalRevenue(rental),
    0,
  );
  const averageDailyKm = useMemo(() => {
    const withDistance = relevantCompletedRentals.filter(
      (rental) => rentalDistance(rental) > 0,
    );
    const kilometres = withDistance.reduce(
      (total, rental) => total + rentalDistance(rental),
      0,
    );
    const days = withDistance.reduce(
      (total, rental) => total + dateDiff(rental.start_date, rental.end_date),
      0,
    );
    return days > 0 ? kilometres / days : 100;
  }, [relevantCompletedRentals, rentalDistance]);

  const [targetMargin, setTargetMargin] = useState(30);
  const [deductionPercent, setDeductionPercent] = useState(0);
  const [operatingMonthly, setOperatingMonthly] = useState(0);
  const [financeMonthly, setFinanceMonthly] = useState(0);
  const [rentalDaysPerMonth, setRentalDaysPerMonth] = useState(15);
  const [kmPerRentalDay, setKmPerRentalDay] = useState(100);
  const [depreciationPerKm, setDepreciationPerKm] = useState(0.15);
  const [testDailyRate, setTestDailyRate] = useState(125);

  useEffect(() => {
    if (cars.length && !cars.some((vehicle) => vehicle.identification === vehicleId))
      setVehicleId(cars[0].identification);
  }, [cars, vehicleId]);

  useEffect(() => {
    setDeductionPercent(turoGross > 0 ? ((turoGross - turoNet) / turoGross) * 100 : 30);
    setOperatingMonthly(monthlyOperatingCost);
    setFinanceMonthly(monthlyFinancePayment);
    setKmPerRentalDay(averageDailyKm);
    setDepreciationPerKm(num(car?.depreciation_per_km) || 0.15);
    const rates = turoCompleted
      .map((rental) => num(rental.daily_rate))
      .filter((rate) => rate > 0);
    setTestDailyRate(
      rates.length ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length : 125,
    );
  }, [vehicleId]);

  const rentalDays = Math.max(1, rentalDaysPerMonth);
  const operatingCostPerRentalDay =
    (operatingMonthly + monthlyFinanceInterest) / rentalDays +
    Math.max(0, kmPerRentalDay) * Math.max(0, depreciationPerKm);
  const cashCostPerRentalDay =
    (operatingMonthly + financeMonthly) / rentalDays;
  const margin = Math.min(99, Math.max(0, targetMargin)) / 100;
  const deductions = Math.min(99, Math.max(0, deductionPercent)) / 100;
  const marginDenominator = (1 - margin) * (1 - deductions);
  const minimumOperatingRate = marginDenominator > 0
    ? operatingCostPerRentalDay / marginDenominator
    : 0;
  const minimumCashRate = marginDenominator > 0
    ? cashCostPerRentalDay / marginDenominator
    : 0;
  const testedNetRevenue = testDailyRate * (1 - deductions);
  const testedOperatingMargin = testedNetRevenue > 0
    ? ((testedNetRevenue - operatingCostPerRentalDay) / testedNetRevenue) * 100
    : 0;
  const testedCashMargin = testedNetRevenue > 0
    ? ((testedNetRevenue - cashCostPerRentalDay) / testedNetRevenue) * 100
    : 0;

  if (!cars.length || !car) return null;

  return (
    <section className="panel rate-tester">
      <div className="panel-heading">
        <div>
          <h3>Daily rate tester</h3>
          <p>
          Compare the minimum rate for your target operating margin and cash margin, then test
          any daily price.
          </p>
        </div>
        <Calculator className="muted-icon" size={18} />
      </div>
      {cars.length > 1 && (
        <label className="field rate-tester-vehicle">
          <span>Vehicle</span>
          <select
            value={car.identification}
            onChange={(event) => setVehicleId(Number(event.target.value))}
          >
            {cars.map((vehicle) => (
              <option key={vehicle.identification} value={vehicle.identification}>
                {vehicle.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="rate-tester-fields">
        <label className="field">
          <span>Target margin (%)</span>
          <input
            type="number"
            min="0"
            max="99"
            step="1"
            value={targetMargin}
            onChange={(event) => setTargetMargin(num(event.target.value))}
          />
        </label>
        <label className="field">
          <span>Turo deductions (% of gross)</span>
          <input
            type="number"
            min="0"
            max="99"
            step="0.5"
            value={deductionPercent.toFixed(1)}
            onChange={(event) => setDeductionPercent(num(event.target.value))}
          />
        </label>
        <label className="field">
          <span>Operating costs per month (excl. finance)</span>
          <input
            type="number"
            min="0"
            step="10"
            value={operatingMonthly.toFixed(2)}
            onChange={(event) => setOperatingMonthly(num(event.target.value))}
          />
        </label>
        <label className="field">
          <span>Finance payments per month</span>
          <input
            type="number"
            min="0"
            step="10"
            value={financeMonthly.toFixed(2)}
            onChange={(event) => setFinanceMonthly(num(event.target.value))}
          />
        </label>
        <label className="field">
          <span>Rental days per month</span>
          <input
            type="number"
            min="1"
            max="30"
            step="1"
            value={rentalDaysPerMonth}
            onChange={(event) => setRentalDaysPerMonth(num(event.target.value))}
          />
        </label>
        <label className="field">
          <span>Expected km per rental day</span>
          <input
            type="number"
            min="0"
            step="10"
            value={kmPerRentalDay.toFixed(0)}
            onChange={(event) => setKmPerRentalDay(num(event.target.value))}
          />
        </label>
        <label className="field">
          <span>Depreciation per km</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={depreciationPerKm.toFixed(2)}
            onChange={(event) => setDepreciationPerKm(num(event.target.value))}
          />
        </label>
        <label className="field">
          <span>Daily rate to test</span>
          <input
            type="number"
            min="0"
            step="1"
            value={testDailyRate.toFixed(2)}
            onChange={(event) => setTestDailyRate(num(event.target.value))}
          />
        </label>
      </div>
      <div className="rate-tester-results">
        <div className="rate-tester-result">
          <span>Minimum rate for {targetMargin}% operating margin</span>
          <strong>{money(minimumOperatingRate)}</strong>
          <small>
            Daily cost {money(operatingCostPerRentalDay)}: operating costs and interest spread
            over rental days, plus depreciation. Excludes loan principal.
          </small>
        </div>
        <div className="rate-tester-result cash">
          <span>Minimum rate for {targetMargin}% cash margin</span>
          <strong>{money(minimumCashRate)}</strong>
          <small>
            Daily cash cost {money(cashCostPerRentalDay)}: operating costs plus full finance
            payments spread over rental days. Excludes noncash depreciation.
          </small>
        </div>
      </div>
      <div className="rate-tester-tested">
        <strong>At {money(testDailyRate)}/day</strong>
        <span>Estimated operating margin: <b>{testedOperatingMargin.toFixed(1)}%</b></span>
        <span>Estimated cash margin: <b>{testedCashMargin.toFixed(1)}%</b></span>
        <small>Estimated net rental revenue after Turo deductions: {money(testedNetRevenue)}/day</small>
      </div>
      <div className="rate-tester-math">
        <strong>Calculation</strong>
        <span>
          Minimum rate = daily costs ÷ (1 − target margin) ÷ (1 − Turo deduction rate)
        </span>
        <small>
          Turo deduction default uses completed Turo bookings and includes the recorded
          platform fees, sales taxes, and charging adjustments. Adjust it to test different
          assumptions. Operating margin includes depreciation and interest but excludes
          principal. Cash margin includes the full finance payment and excludes depreciation.
          Taxes on profit, maintenance, and unentered costs are not included.
        </small>
      </div>
    </section>
  );
}
