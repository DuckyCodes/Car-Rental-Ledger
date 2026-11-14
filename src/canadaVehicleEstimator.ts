import type { Car } from "./model";

export type CanadaVehicleEstimate = {
  ageYears: number;
  depreciationRate: number;
  annualDepreciation: number;
  annualMaintenance: number;
  majorRepairProbability: number;
  fuelCostPer100Km: number;
  confidence: "baseline";
};

// Transparent Canada-wide baseline. Vehicle-specific market transaction data
// is not available as a free national API, so these estimates are deliberately
// labeled as baselines until the ledger has enough of the owner's own history.
export function estimateCanadaVehicleCosts(car: Car, currentYear = new Date().getFullYear()): CanadaVehicleEstimate {
  const ageYears = Math.max(0, currentYear - Number(car.year || currentYear));
  const purchasePrice = Math.max(0, Number(car.purchase_price) || 0);
  const currentValue = Math.max(0, Number(car.current_value) || purchasePrice);
  const kilometres = Math.max(0, Number(car.odometer_km) || 0);
  const depreciationRate = ageYears <= 3 ? 0.18 : ageYears <= 6 ? 0.12 : ageYears <= 10 ? 0.09 : 0.07;
  const expectedKm = Math.max(1, ageYears * 20000);
  const mileageFactor = Math.min(1.35, Math.max(0.8, kilometres / expectedKm));
  const annualDepreciation = currentValue * depreciationRate * mileageFactor;
  const annualMaintenance = Math.max(900, purchasePrice * 0.035) * (1 + Math.max(0, ageYears - 3) * 0.08) * mileageFactor;
  const majorRepairProbability = Math.min(0.65, 0.03 + Math.max(0, ageYears - 3) * 0.025 + Math.max(0, kilometres - 80000) / 400000);
  const fuelCostPer100Km = 0;

  return { ageYears, depreciationRate, annualDepreciation, annualMaintenance, majorRepairProbability, fuelCostPer100Km, confidence: "baseline" };
}

export const canadaEstimatorSources = {
  fuel: "https://open.canada.ca/data/en/dataset/98f1a129-f628-4ce4-b24d-6f16bf24dd64",
  recalls: "https://tc.canada.ca/en/road-transportation/defects-recalls-vehicles-tires-child-car-seats",
};
