import { dateDiff, monthKey, monthsBetween, today } from "../../../model";
import type { Expense, Rental } from "../../../model";

export function getOverviewPeriod(month: string, rentals: Rental[]) {
  const completedRentals = rentals.filter((rental) => rental.end_date <= today());
  const periodStart = month === "all" ? rentals.map((rental) => rental.start_date).sort()[0] || today() : `${month}-01`;
  const periodEnd = month === "all" ? today() : new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).toISOString().slice(0, 10);
  const completedRentalDays = completedRentals.reduce((total, rental) => {
    if (month === "all") return total + dateDiff(rental.start_date, rental.end_date);
    const end = rental.end_date < periodEnd ? rental.end_date : periodEnd;
    const start = rental.start_date > periodStart ? rental.start_date : periodStart;
    return total + Math.max(0, Math.floor((new Date(`${end}T12:00:00`).getTime() - new Date(`${start}T12:00:00`).getTime()) / 86400000));
  }, 0);
  const periodDays = Math.max(1, Math.floor((new Date(`${periodEnd}T12:00:00`).getTime() - new Date(`${periodStart}T12:00:00`).getTime()) / 86400000) + 1);
  return { completedRentals, periodStart, periodEnd, completedRentalDays, periodDays };
}

export function getAvailableExpenseMonths(expenses: Expense[], rentals: Rental[]) {
  return Array.from(new Set([
    ...expenses.map((expense) => monthKey(expense.date)),
    ...rentals.flatMap((rental) => monthsBetween(rental.start_date, rental.end_date)),
  ])).sort().reverse();
}
