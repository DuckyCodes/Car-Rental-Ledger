import { useMemo } from "react";
import { useDepreciationChartData } from "./useDepreciationChartData";
import { today, money, num, dateDiff, monthKey } from "../model";
import type { Car, Rental, Expense, Valuation } from "../model";

type Inputs = {
  cars: Car[];
  rentals: Rental[];
  expenses: Expense[];
  valuations: Valuation[];
  month: string;
  search: string;
  carFilter: string;
  depreciationCarIdentification: number;
};

export function useLedgerCalculations({
  cars,
  rentals,
  expenses,
  valuations,
  month,
  search,
  carFilter,
  depreciationCarIdentification,
}: Inputs) {
  const carName = (identification: number | null | undefined) =>
    cars.find((c) => c.identification === identification)?.name || "Unassigned";
  const rentalRevenue = (r: Rental) => {
    const directIncome =
      num(r.daily_rate) * dateDiff(r.start_date, r.end_date) +
      num(r.extra_km_revenue);
    const turoIncome =
      num(r.turo_gross_income) > 0 ? num(r.turo_gross_income) : directIncome;
    return (
      turoIncome +
      num(r.damage_fee) +
      num(r.admin_fee) +
      num(r.cleaning_fee) +
      num(r.other_revenue) +
      Math.max(
        0,
        num(r.end_km) -
          num(r.start_km) -
          num(r.included_km_per_day) * dateDiff(r.start_date, r.end_date),
      ) *
        num(r.extra_km_rate)
    );
  };
  const rentalPlatformCosts = (_r: Rental) => 0;
  const expenseAppliesToMonth = (expense: Expense, monthKeyValue: string) =>
    monthKey(expense.date) === monthKeyValue ||
    (Boolean(expense.recurring_monthly) &&
      expense.date <= monthKeyValue + "-31");
  const recurringMonthsThroughToday = (expense: Expense) => {
    const start = monthKey(expense.date),
      end = today().slice(0, 7);
    if (start > end) return 0;
    return (
      (Number(end.slice(0, 4)) - Number(start.slice(0, 4))) * 12 +
      Number(end.slice(5, 7)) -
      Number(start.slice(5, 7)) +
      1
    );
  };
  const expenseAmountForPeriod = (expense: Expense, period: string) =>
    period === "all" && expense.recurring_monthly
      ? num(expense.amount) * recurringMonthsThroughToday(expense)
      : num(expense.amount);
  const rentalDistance = (r: Rental) =>
    num(r.manually_entered_total_kilometres) > 0
      ? num(r.manually_entered_total_kilometres)
      : Math.max(0, num(r.end_km) - num(r.start_km));
  const totalVehicleKilometres = (c: Car) =>
    num(c.odometer_km) +
    rentals
      .filter((r) => r.vehicle_identification === c.identification)
      .reduce((sum, r) => sum + rentalDistance(r), 0);
  const decliningBalanceValue = (c: Car, days: number) => {
    const purchase = num(c.purchase_price),
      residual = Math.min(purchase, num(c.residual_value)),
      rate = Math.min(1, Math.max(0, num(c.annual_decline_rate)));
    return Math.max(
      residual,
      purchase * Math.pow(1 - rate, Math.max(0, days) / 365),
    );
  };
  const rentalDepreciation = (r: Rental) => {
    const c = cars.find((x) => x.identification === r.vehicle_identification);
    if (!c) return 0;
    if (c.depreciation_model !== "declining_balance")
      return rentalDistance(r) * num(c.depreciation_per_km);
    const purchaseDate = c.purchase_date || r.start_date;
    const ageDays = Math.max(
      0,
      Math.floor(
        (new Date(r.start_date + "T12:00:00").getTime() -
          new Date(purchaseDate + "T12:00:00").getTime()) /
          86400000,
      ),
    );
    const rentalDays = dateDiff(r.start_date, r.end_date);
    return Math.max(
      0,
      decliningBalanceValue(c, ageDays) -
        decliningBalanceValue(c, ageDays + rentalDays),
    );
  };
  const daysInMonth = (monthKeyValue: string) => {
    const [year, monthNumber] = monthKeyValue.split("-").map(Number);
    return new Date(year, monthNumber, 0).getDate();
  };
  const rentalDaysInMonth = (r: Rental, monthKeyValue: string) => {
    const [year, monthNumber] = monthKeyValue.split("-").map(Number);
    const monthStart = monthKeyValue + "-01";
    const nextMonthStart = new Date(year, monthNumber, 1)
      .toISOString()
      .slice(0, 10);
    if (r.end_date < monthStart || r.start_date >= nextMonthStart) return 0;
    const overlapStart = r.start_date > monthStart ? r.start_date : monthStart;
    const overlapEnd =
      r.end_date < nextMonthStart ? r.end_date : nextMonthStart;
    const days = Math.floor(
      (new Date(overlapEnd + "T12:00:00").getTime() -
        new Date(overlapStart + "T12:00:00").getTime()) /
        86400000,
    );
    return days > 0
      ? days
      : r.start_date === r.end_date &&
          r.start_date >= monthStart &&
          r.start_date < nextMonthStart
        ? 1
        : 0;
  };
  const insuranceConfigured = (
    vehicleIdentification: number | null | undefined,
  ) => {
    const c = cars.find(
      (vehicle) => vehicle.identification === vehicleIdentification,
    );
    return Boolean(
      c &&
        (num(c.personal_insurance_monthly) > 0 ||
          num(c.commercial_insurance_daily) > 0),
    );
  };
  const insuranceCostForMonth = (c: Car, monthKeyValue: string) => {
    const personalMonthly = num(c.personal_insurance_monthly),
      personalDaily = personalMonthly / daysInMonth(monthKeyValue),
      commercialDaily = num(c.commercial_insurance_daily);
    const commercialRentalDays = rentals
      .filter(
        (r) =>
          r.vehicle_identification === c.identification &&
          Boolean(r.commercial_insurance_used),
      )
      .reduce((sum, r) => sum + rentalDaysInMonth(r, monthKeyValue), 0);
    return Math.max(
      0,
      personalMonthly +
        commercialRentalDays * (commercialDaily - personalDaily),
    );
  };
  const loanConfigured = (c: Car) =>
    num(c.loan_original_amount) > 0 &&
    num(c.loan_term_months) > 0 &&
    Boolean(c.loan_start_date);
  const loanBreakdownForMonth = (c: Car, monthKeyValue: string) => {
    if (!loanConfigured(c)) return { payment: 0, principal: 0, interest: 0 };
    const startMonth = monthKey(c.loan_start_date || "");
    if (monthKeyValue < startMonth)
      return { payment: 0, principal: 0, interest: 0 };
    const monthlyRate =
      Math.max(0, num(c.loan_annual_interest_rate)) / 100 / 12;
    const term = Math.max(1, Math.floor(num(c.loan_term_months)));
    const original = num(c.loan_original_amount);
    const payment =
      monthlyRate === 0
        ? original / term
        : (original * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
    let balance = original;
    const elapsed = Math.max(
      0,
      (Number(monthKeyValue.slice(0, 4)) - Number(startMonth.slice(0, 4))) *
        12 +
        Number(monthKeyValue.slice(5, 7)) -
        Number(startMonth.slice(5, 7)),
    );
    for (let index = 0; index < Math.min(elapsed, term); index++) {
      const interest = balance * monthlyRate;
      balance = Math.max(0, balance - (payment - interest));
    }
    if (elapsed >= term || balance <= 0)
      return { payment: 0, principal: 0, interest: 0 };
    const interest = balance * monthlyRate;
    const principal = Math.min(balance, Math.max(0, payment - interest));
    return { payment: principal + interest, principal, interest };
  };
  const loanBreakdownThroughMonth = (c: Car, endMonth: string) => {
    let total = { payment: 0, principal: 0, interest: 0 };
    if (!loanConfigured(c)) return total;
    const startMonth = monthKey(c.loan_start_date || "");
    for (let index = 0; index <= 1200; index++) {
      const year =
        Number(startMonth.slice(0, 4)) +
        Math.floor((Number(startMonth.slice(5, 7)) - 1 + index) / 12);
      const month = String(
        ((Number(startMonth.slice(5, 7)) - 1 + index) % 12) + 1,
      ).padStart(2, "0");
      const key = `${year}-${month}`;
      if (key > endMonth) break;
      const part = loanBreakdownForMonth(c, key);
      total = {
        payment: total.payment + part.payment,
        principal: total.principal + part.principal,
        interest: total.interest + part.interest,
      };
    }
    return total;
  };
  const isManualFinanceRecord = (expense: Expense) => {
    const c = cars.find(
      (vehicle) => vehicle.identification === expense.vehicle_identification,
    );
    return Boolean(
      c &&
        loanConfigured(c) &&
        expense.date >= String(c.loan_start_date) &&
        (expense.category.startsWith("Finance payment") ||
          expense.treatment === "loan_principal"),
    );
  };
  const hasManualFinanceForCarMonth = (c: Car, monthKeyValue: string) =>
    expenses.some(
      (expense) =>
        isManualFinanceRecord(expense) &&
        expense.vehicle_identification === c.identification &&
        expenseAppliesToMonth(expense, monthKeyValue),
    );
  const automaticFinanceForMonth = (monthKeyValue: string) =>
    cars.reduce(
      (sum, c) =>
        sum +
        (hasManualFinanceForCarMonth(c, monthKeyValue)
          ? 0
          : loanBreakdownForMonth(c, monthKeyValue).payment),
      0,
    );
  const automaticPrincipalForMonth = (monthKeyValue: string) =>
    cars.reduce(
      (sum, c) =>
        sum +
        (hasManualFinanceForCarMonth(c, monthKeyValue)
          ? 0
          : loanBreakdownForMonth(c, monthKeyValue).principal),
      0,
    );
  const automaticInterestForMonth = (monthKeyValue: string) =>
    cars.reduce(
      (sum, c) =>
        sum +
        (hasManualFinanceForCarMonth(c, monthKeyValue)
          ? 0
          : loanBreakdownForMonth(c, monthKeyValue).interest),
      0,
    );
  const isManualFinanceEntry = isManualFinanceRecord;
  const depreciationDescription = (c: Car) =>
    c.depreciation_model === "declining_balance"
      ? `${Math.round(num(c.annual_decline_rate) * 100)}% annual declining balance`
      : `${money(num(c.depreciation_per_km))}/km mileage estimate`;
  const expensesFor = (identification: number) =>
    expenses.filter((e) => e.rental_identification === identification);
  const carExpenses = (identification: number, monthFilter?: string) =>
    expenses.filter(
      (e) =>
        e.vehicle_identification === identification &&
        (!monthFilter || monthKey(e.date) === monthFilter),
    );
  const allocatedMonthly = (carId: number, monthFilter: string) => {
    const c = cars.find((x) => x.identification === carId);
    if (!c) return 0;
    const all = expenses.filter(
      (e) =>
        e.vehicle_identification === carId &&
        monthKey(e.date) === monthFilter &&
        e.treatment !== "loan_principal",
    );
    return all.reduce((s, e) => s + num(e.amount), 0);
  };
  const visibleExpenses = useMemo(
    () =>
      expenses
        .filter(
          (e) =>
            (month === "all" || expenseAppliesToMonth(e, month)) &&
            (carFilter === "all" ||
              String(e.vehicle_identification || "") === carFilter) &&
            `${e.description} ${e.category} ${carName(e.vehicle_identification)}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .sort((first, second) => second.date.localeCompare(first.date)),
    [expenses, month, carFilter, search, cars],
  );
  const monthRentals = rentals.filter(
    (r) =>
      month === "all" ||
      (r.start_date <= month + "-31" && r.end_date >= month + "-01"),
  );
  const completedMonthRentals = monthRentals.filter(
    (r) => r.end_date <= today(),
  );
  const revenue = monthRentals.reduce((s, r) => s + rentalRevenue(r), 0);
  const platformCosts = monthRentals.reduce(
    (s, r) => s + rentalPlatformCosts(r),
    0,
  );
  const completedPlatformCosts = completedMonthRentals.reduce(
    (s, r) => s + rentalPlatformCosts(r),
    0,
  );
  const completedRevenue = completedMonthRentals.reduce(
    (s, r) => s + rentalRevenue(r),
    0,
  );
  const automaticInsurance =
    month === "all"
      ? 0
      : cars.reduce((sum, c) => sum + insuranceCostForMonth(c, month), 0);
  const automaticFinance =
    month === "all"
      ? cars.reduce(
          (sum, c) =>
            sum + loanBreakdownThroughMonth(c, today().slice(0, 7)).payment,
          0,
        )
      : automaticFinanceForMonth(month);
  const automaticPrincipal =
    month === "all"
      ? cars.reduce(
          (sum, c) =>
            sum + loanBreakdownThroughMonth(c, today().slice(0, 7)).principal,
          0,
        )
      : automaticPrincipalForMonth(month);
  const automaticInterest =
    month === "all"
      ? cars.reduce(
          (sum, c) =>
            sum + loanBreakdownThroughMonth(c, today().slice(0, 7)).interest,
          0,
        )
      : automaticInterestForMonth(month);
  const monthExpenses = expenses
    .filter(
      (e) =>
        (month === "all" || expenseAppliesToMonth(e, month)) &&
        e.treatment !== "loan_principal" &&
        !isManualFinanceEntry(e) &&
        !(
          e.category.startsWith("Insurance") &&
          insuranceConfigured(e.vehicle_identification)
        ),
    )
    .reduce(
      (s, e) => s + expenseAmountForPeriod(e, month),
      automaticInsurance + platformCosts + automaticInterest,
    );
  const otherCashExpenses = expenses
    .filter(
      (e) =>
        (month === "all" || expenseAppliesToMonth(e, month)) &&
        !isManualFinanceEntry(e) &&
        !(
          e.category.startsWith("Insurance") &&
          insuranceConfigured(e.vehicle_identification)
        ),
    )
    .reduce((s, e) => s + expenseAmountForPeriod(e, month), 0);
  const manualFinance = expenses
    .filter(
      (e) =>
        isManualFinanceEntry(e) &&
        (month === "all" || expenseAppliesToMonth(e, month)),
    )
    .reduce((s, e) => s + expenseAmountForPeriod(e, month), 0);
  const cashExpenses =
    automaticInsurance +
    automaticFinance +
    manualFinance +
    completedPlatformCosts +
    otherCashExpenses;
  const cashExpenseBreakdown = {
    insurance: automaticInsurance,
    finance: automaticFinance + manualFinance,
    other: otherCashExpenses + completedPlatformCosts,
  };
  const principal = expenses
    .filter(
      (e) =>
        (month === "all" || expenseAppliesToMonth(e, month)) &&
        e.treatment === "loan_principal" &&
        !isManualFinanceEntry(e),
    )
    .reduce((s, e) => s + expenseAmountForPeriod(e, month), automaticPrincipal);
  const monthKm = monthRentals.reduce((s, r) => s + rentalDistance(r), 0);
  const rentalDays = monthRentals.reduce(
    (s, r) => s + dateDiff(r.start_date, r.end_date),
    0,
  );
  const distanceTrackedRentals = monthRentals.filter(
    (r) => rentalDistance(r) > 0,
  );
  const distanceTrackedKilometres = distanceTrackedRentals.reduce(
    (s, r) => s + rentalDistance(r),
    0,
  );
  const distanceTrackedRevenue = distanceTrackedRentals.reduce(
    (s, r) => s + rentalRevenue(r),
    0,
  );
  const distanceTrackedRentalDays = distanceTrackedRentals.reduce(
    (s, r) => s + dateDiff(r.start_date, r.end_date),
    0,
  );
  const revenueTrackedRentals = monthRentals.filter(
    (r) => rentalRevenue(r) > 0,
  );
  const revenueTrackedTotal = revenueTrackedRentals.reduce(
    (s, r) => s + rentalRevenue(r),
    0,
  );
  const revenueTrackedDays = revenueTrackedRentals.reduce(
    (s, r) => s + dateDiff(r.start_date, r.end_date),
    0,
  );
  const averageRentalRevenue = revenueTrackedRentals.length
    ? revenueTrackedTotal / revenueTrackedRentals.length
    : 0;
  const averageKilometres = distanceTrackedRentals.length
    ? distanceTrackedKilometres / distanceTrackedRentals.length
    : 0;
  const averageRevenuePerRentalDay = revenueTrackedDays
    ? revenueTrackedTotal / revenueTrackedDays
    : 0;
  const averageDailyKilometres = distanceTrackedRentalDays
    ? distanceTrackedKilometres / distanceTrackedRentalDays
    : 0;
  const averageBookingLength = revenueTrackedRentals.length
    ? revenueTrackedDays / revenueTrackedRentals.length
    : 0;
  const revenuePerKilometre = distanceTrackedKilometres
    ? distanceTrackedRevenue / distanceTrackedKilometres
    : 0;
  const estimatedDep = monthRentals.reduce(
    (s, r) => s + rentalDepreciation(r),
    0,
  );
  const operatingProfit = revenue - monthExpenses;
  const cashProfitBeforePrincipal =
    completedRevenue - (cashExpenses - principal);
  const profit = operatingProfit - estimatedDep;
  const cashFlow = completedRevenue - cashExpenses;
  const chartData = useMemo(() => {
    const availableMonths = Array.from(
      new Set([
        ...rentals.map((r) => monthKey(r.end_date)),
        ...expenses.map((e) => monthKey(e.date)),
        today().slice(0, 7),
      ]),
    )
      .filter(Boolean)
      .sort();
    const chartMonths = month === "all" ? availableMonths : [month];
    return chartMonths.map((key) => {
      const rs = rentals.filter(
        (r) => monthKey(r.end_date) === key && r.end_date <= today(),
      );
      const inc = rs.reduce((s, r) => s + rentalRevenue(r), 0);
      const cost =
        expenses
          .filter(
            (e) => expenseAppliesToMonth(e, key) && !isManualFinanceEntry(e),
          )
          .reduce((s, e) => s + num(e.amount), automaticInterestForMonth(key)) +
        rs.reduce(
          (s, r) => s + rentalDepreciation(r) + rentalPlatformCosts(r),
          0,
        );
      return {
        month: new Date(key + "-01T12:00:00").toLocaleDateString("en-CA", {
          month: "short",
          year: chartMonths.length > 12 ? "numeric" : undefined,
        }),
        income: Math.round(inc),
        costs: Math.round(cost),
      };
    });
  }, [rentals, expenses, cars, month]);
  const depreciationCar =
    cars.find((c) => c.identification === depreciationCarIdentification) ||
    cars[0];
  const depreciationChartData = useDepreciationChartData(
    depreciationCar,
    valuations,
    decliningBalanceValue,
  );
  return {
    carName,
    rentalRevenue,
    rentalPlatformCosts,
    expenseAppliesToMonth,
    recurringMonthsThroughToday,
    expenseAmountForPeriod,
    rentalDistance,
    totalVehicleKilometres,
    decliningBalanceValue,
    rentalDepreciation,
    daysInMonth,
    rentalDaysInMonth,
    insuranceConfigured,
    insuranceCostForMonth,
    loanConfigured,
    loanBreakdownForMonth,
    loanBreakdownThroughMonth,
    automaticFinanceForMonth,
    automaticPrincipalForMonth,
    automaticInterestForMonth,
    isManualFinanceEntry,
    depreciationDescription,
    expensesFor,
    carExpenses,
    allocatedMonthly,
    visibleExpenses,
    monthRentals,
    completedMonthRentals,
    revenue,
    platformCosts,
    completedPlatformCosts,
    completedRevenue,
    automaticInsurance,
    automaticFinance,
    automaticPrincipal,
    automaticInterest,
    monthExpenses,
    cashExpenses,
    cashExpenseBreakdown,
    principal,
    monthKm,
    rentalDays,
    distanceTrackedRentals,
    distanceTrackedKilometres,
    distanceTrackedRevenue,
    distanceTrackedRentalDays,
    revenueTrackedRentals,
    revenueTrackedTotal,
    revenueTrackedDays,
    averageRentalRevenue,
    averageKilometres,
    averageRevenuePerRentalDay,
    averageDailyKilometres,
    averageBookingLength,
    revenuePerKilometre,
    estimatedDep,
    operatingProfit,
    cashProfitBeforePrincipal,
    profit,
    cashFlow,
    chartData,
    depreciationCar,
    depreciationChartData,
  };
}
