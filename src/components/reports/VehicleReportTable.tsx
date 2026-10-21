import { dateDiff, money, num } from "../../model";
import type { Car, Expense, Rental } from "../../model";

type CalculationDetails = {
  title: string;
  definition: string;
  formula: string;
  items: { label: string; value: string }[];
};

type Props = {
  cars: Car[];
  rentals: Rental[];
  expenses: Expense[];
  month: string;
  calculationPeriod: string;
  rentalRevenue: (rental: Rental) => number;
  rentalDistance: (rental: Rental) => number;
  rentalDepreciation: (rental: Rental) => number;
  rentalPlatformCosts: (rental: Rental) => number;
  totalVehicleKilometres: (car: Car) => number;
  expenseAppliesToMonth: (expense: Expense, month: string) => boolean;
  expenseAmountForPeriod: (expense: Expense, period: string) => number;
  isManualFinanceEntry: (expense: Expense) => boolean;
  isManualPrincipalEntry: (expense: Expense) => boolean;
  isManualInterestEntry: (expense: Expense) => boolean;
  insuranceCostForMonth: (car: Car, month: string) => number;
  insuranceCostThroughToday: (car: Car) => number;
  insuranceConfigured: (vehicleId: number | null | undefined) => boolean;
  automaticLoanBreakdownForMonth: (
    car: Car,
    month: string,
  ) => { payment: number; principal: number; interest: number };
  automaticLoanBreakdownThroughToday: (
    car: Car,
  ) => { payment: number; principal: number; interest: number };
  showCalculation: (details: CalculationDetails) => void;
};

export function VehicleReportTable({
  cars,
  rentals,
  expenses,
  month,
  calculationPeriod,
  rentalRevenue,
  rentalDistance,
  rentalDepreciation,
  rentalPlatformCosts,
  totalVehicleKilometres,
  expenseAppliesToMonth,
  expenseAmountForPeriod,
  isManualFinanceEntry,
  isManualPrincipalEntry,
  isManualInterestEntry,
  insuranceCostForMonth,
  insuranceCostThroughToday,
  insuranceConfigured,
  automaticLoanBreakdownForMonth,
  automaticLoanBreakdownThroughToday,
  showCalculation,
}: Props) {
  return (
    <div className="panel report-panel">
      <h3>By vehicle</h3>
      <p>Rental revenue and operating expenses for the selected period.</p>
      <table>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Rental revenue</th>
            <th>Operating costs</th>
            <th>Loan principal</th>
            <th>Rental km (period)</th>
            <th>Rental days</th>
            <th>Current odometer</th>
            <th>Estimated depreciation</th>
            <th>Estimated profit</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {cars.map((car) => {
            const carRentals = rentals.filter(
              (rental) => rental.vehicle_identification === car.identification,
            );
            const revenue = carRentals.reduce(
              (sum, rental) => sum + rentalRevenue(rental),
              0,
            );
            const carExpenses = expenses.filter(
              (expense) =>
                expense.vehicle_identification === car.identification &&
                (month === "all" || expenseAppliesToMonth(expense, month)),
            );
            const loan =
              month === "all"
                ? automaticLoanBreakdownThroughToday(car)
                : automaticLoanBreakdownForMonth(car, month);
            const platformCosts = carRentals.reduce(
              (sum, rental) => sum + rentalPlatformCosts(rental),
              0,
            );
            const insurance =
              month === "all"
                ? insuranceCostThroughToday(car)
                : insuranceCostForMonth(car, month);
            const manualPrincipal = carExpenses
              .filter(isManualPrincipalEntry)
              .reduce(
                (sum, expense) =>
                  sum + expenseAmountForPeriod(expense, calculationPeriod),
                0,
              );
            const manualInterest = carExpenses
              .filter(isManualInterestEntry)
              .reduce(
                (sum, expense) =>
                  sum + expenseAmountForPeriod(expense, calculationPeriod),
                0,
              );
            const isOperatingExpense = (expense: Expense) =>
              expense.treatment !== "loan_principal" &&
              !isManualFinanceEntry(expense) &&
              !(
                expense.category.startsWith("Insurance") &&
                insuranceConfigured(expense.vehicle_identification)
              );
            const otherOperatingCosts = carExpenses
              .filter(isOperatingExpense)
              .reduce(
                (sum, expense) =>
                  sum + expenseAmountForPeriod(expense, calculationPeriod),
                0,
              );
            const operatingCosts = carExpenses
              .filter(isOperatingExpense)
              .reduce(
                (sum, expense) =>
                  sum + expenseAmountForPeriod(expense, calculationPeriod),
                loan.interest + platformCosts + insurance + manualInterest,
              );
            const principal = carExpenses
              .filter(
                (expense) =>
                  expense.treatment === "loan_principal" &&
                  !isManualFinanceEntry(expense),
              )
              .reduce(
                (sum, expense) =>
                  sum + expenseAmountForPeriod(expense, calculationPeriod),
                loan.principal + manualPrincipal,
              );
            const odometer = totalVehicleKilometres(car);
            const rentalKm = carRentals.reduce(
              (sum, rental) => sum + rentalDistance(rental),
              0,
            );
            const rentalDays = carRentals.reduce(
              (sum, rental) => sum + dateDiff(rental.start_date, rental.end_date),
              0,
            );
            const depreciation =
              month === "all" && car.depreciation_model === "mileage"
                ? odometer * num(car.depreciation_per_km)
                : carRentals.reduce(
                    (sum, rental) => sum + rentalDepreciation(rental),
                    0,
                  );
            const estimatedProfit = revenue - operatingCosts - depreciation;

            return (
              <tr key={car.identification}>
                <td><strong>{car.name}</strong></td>
                <td>{money(revenue)}</td>
                <td>{money(operatingCosts)}</td>
                <td>{money(principal)}</td>
                <td>{rentalKm.toLocaleString()}</td>
                <td>{rentalDays.toLocaleString()}</td>
                <td>{odometer.toLocaleString()}</td>
                <td>{money(depreciation)}</td>
                <td className={estimatedProfit >= 0 ? "positive" : "negative"}>
                  {money(estimatedProfit)}
                </td>
                <td>
                  <button
                    className="secondary small"
                    onClick={() =>
                      showCalculation({
                        title: `${car.name} — vehicle calculation`,
                        definition:
                          "This row separates rental earnings, operating costs, loan principal, and mileage depreciation. Loan principal affects cash flow but is excluded from estimated profit.",
                        formula:
                          "Rental revenue − operating costs − estimated depreciation = estimated profit",
                        items: [
                          { label: "Rental revenue", value: money(revenue) },
                          { label: "Insurance", value: money(insurance) },
                          { label: "Other operating costs", value: money(otherOperatingCosts) },
                          { label: "Loan interest", value: money(loan.interest + manualInterest) },
                          { label: "Operating costs total", value: money(operatingCosts) },
                          { label: "Loan principal (cash only)", value: money(principal) },
                          { label: "Rental km in period", value: `${rentalKm.toLocaleString()} km` },
                          { label: "Current odometer", value: `${odometer.toLocaleString()} km` },
                          { label: "Depreciation rate", value: `${money(num(car.depreciation_per_km))}/km` },
                          { label: "Estimated depreciation", value: money(depreciation) },
                          { label: "Estimated profit", value: money(estimatedProfit) },
                        ],
                      })
                    }
                  >
                    See details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
