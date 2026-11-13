import { money } from "../model";

export function cashFlowMetricDetails(values: {
  revenue: number;
  cashExpenses: number;
  cashFlow: number;
  principal: number;
}) {
  const margin = values.revenue > 0 ? (values.cashFlow / values.revenue) * 100 : 0;
  return {
    title: "Cash flow after loan payments",
    definition: "Booked rental income remaining after cash expenses allocated to the selected period, including loan principal.",
    formula: "Booked rental income − cash expenses",
    items: [
      { label: "Booked rental income", value: money(values.revenue) },
      { label: "Cash expenses", value: money(values.cashExpenses) },
      { label: "Cash flow", value: money(values.cashFlow) },
      { label: "Loan principal included", value: money(values.principal) },
    ],
    margin,
  };
}
