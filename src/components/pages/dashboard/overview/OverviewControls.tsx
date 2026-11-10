import { today } from "../../../../model";
import type { PageContext } from "../OverviewTypes";

export function OverviewControls({ context }: { context: PageContext }) {
  const { month, allTimeBasis, setAllTimeBasis, setMonth, expenses, rentals } = context;
  const availableMonths = Array.from(new Set([
    ...expenses.map((expense: any) => String(expense.date || "").slice(0, 7)),
    ...rentals.flatMap((rental: any) => {
      const result: string[] = [];
      const start = new Date(`${rental.start_date}T12:00:00`);
      const end = new Date(`${rental.end_date}T12:00:00`);
      while (start <= end) { result.push(start.toISOString().slice(0, 7)); start.setMonth(start.getMonth() + 1); }
      return result;
    }),
  ])).sort().reverse();
  return <div className="toolbar">
    <div><h2>At a glance</h2><p>Track revenue, spending and vehicle economics.</p></div>
    <div className="period-controls">
      <select value={month} onChange={(event) => setMonth(event.target.value)}>
        <option value={today().slice(0, 7)}>This month</option>
        <option value={new Date(Date.now() - 86400000 * 30).toISOString().slice(0, 7)}>Previous month</option>
        {availableMonths.map((availableMonth) => <option key={availableMonth} value={availableMonth}>{availableMonth}</option>)}
        <option value="all">All time</option>
      </select>
      {month === "all" && <select aria-label="All-time expense period" value={allTimeBasis} onChange={(event) => setAllTimeBasis(event.target.value)}>
        <option value="full-month">Include full current month</option>
        <option value="through-today">Through today (prorated)</option>
      </select>}
    </div>
  </div>;
}
