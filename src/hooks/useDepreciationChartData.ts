import { today, num } from "../model";
import type { Car, Valuation } from "../model";

export function useDepreciationChartData(
  depreciationCar: Car | undefined,
  valuations: Valuation[],
  decliningBalanceValue: (car: Car, days: number) => number,
) {
  const chartData = depreciationCar
    ? (() => {
        const purchaseDate = new Date(
          (depreciationCar.purchase_date || today()) + "T12:00:00",
        );
        const currentDate = new Date(today() + "T12:00:00");
        const totalMonths = Math.max(
          1,
          (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12 +
            currentDate.getMonth() -
            purchaseDate.getMonth(),
        );
        const pointCount = Math.min(61, totalMonths + 1);
        const purchaseAgeDays = Math.max(
          1,
          Math.floor(
            (currentDate.getTime() - purchaseDate.getTime()) / 86400000,
          ),
        );
        return Array.from({ length: pointCount }, (_, index) => {
          const progress = pointCount === 1 ? 1 : index / (pointCount - 1);
          const date = new Date(purchaseDate);
          date.setDate(1);
          date.setMonth(date.getMonth() + Math.round(totalMonths * progress));
          const ageDays = Math.max(
            0,
            Math.floor((date.getTime() - purchaseDate.getTime()) / 86400000),
          );
          const mileageProgress = Math.min(1, ageDays / purchaseAgeDays);
          const ageValue =
            depreciationCar.depreciation_model === "declining_balance"
              ? decliningBalanceValue(depreciationCar, ageDays)
              : Math.max(
                  0,
                  num(depreciationCar.purchase_price) -
                    Math.min(
                      num(depreciationCar.purchase_price),
                      num(depreciationCar.odometer_km) *
                        mileageProgress *
                        num(depreciationCar.depreciation_per_km),
                    ),
                );
          const mileageValue = Math.max(
            0,
            num(depreciationCar.purchase_price) -
              Math.min(
                num(depreciationCar.purchase_price),
                num(depreciationCar.odometer_km) *
                  mileageProgress *
                  num(depreciationCar.depreciation_per_km),
              ),
          );
          const marketValuation = valuations
            .filter(
              (v) =>
                v.vehicle_identification === depreciationCar.identification &&
                v.date <= date.toISOString().slice(0, 10),
            )
            .sort((first, second) => second.date.localeCompare(first.date))[0];
          return {
            month: date.toLocaleDateString("en-CA", {
              month: "short",
              year: "numeric",
            }),
            value: Math.round(ageValue),
            ageValue: Math.round(ageValue),
            mileageValue: Math.round(mileageValue),
            marketValue: marketValuation
              ? Math.round(num(marketValuation.market_value))
              : undefined,
          };
        });
      })()
    : [];
  return chartData;
}
