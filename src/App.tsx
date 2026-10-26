import { useEffect, useMemo, useState } from "react";
import { CalculationModal, Metric, Empty, Modal } from "./components/Ui";
import {
  Activity,
  ArrowDownToLine,
  Plus,
  Upload,
  Wrench,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  blankCar,
  blankRental,
  blankExpense,
  today,
  money,
  num,
  dateDiff,
  monthKey,
  API,
} from "./model";
import type { Car, Rental, Expense, Valuation, Tab } from "./model";
import { useLedgerCalculations } from "./hooks/useLedgerCalculations";
import { download } from "./utils/download";
import { api } from "./api";
import { OverviewPage } from "./components/pages/OverviewPage";
import { CarsPage } from "./components/pages/CarsPage";
import { RentalsPage } from "./components/pages/RentalsPage";
import { ExpensesPage } from "./components/pages/ExpensesPage";
import { ValuationsPage } from "./components/pages/ValuationsPage";
import { ReportsPage } from "./components/pages/ReportsPage";
import { HypotheticalsPage } from "./components/pages/HypotheticalsPage";
import { AppSidebar } from "./components/AppSidebar";
import {
  CarForm,
  RentalForm,
  ExpenseForm,
  ValuationForm,
} from "./components/forms";
function App() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [depreciationCarIdentification, setDepreciationCarIdentification] =
    useState(0);
  const [cars, setCars] = useState<Car[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(today().slice(0, 7));
  const [allTimeBasis, setAllTimeBasis] = useState<"full-month" | "through-today">("full-month");
  const [carFilter, setCarFilter] = useState("all");
  const [calculationDetails, setCalculationDetails] = useState<{
    title: string;
    definition: string;
    formula: string;
    items: { label: string; value: string }[];
  } | null>(null);
  const {
    carName,
    rentalGrossRevenue,
    rentalRevenue,
    rentalTuroAdjustments,
    rentalEarnings,
    rentalPlatformCosts,
    expenseAppliesToMonth,
    recurringMonthsThroughToday,
    expenseAmountForPeriod,
    rentalDistance,
    totalDepreciation,
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
    automaticLoanBreakdownForMonth,
    automaticLoanBreakdownThroughToday,
    insuranceCostThroughToday,
    isManualFinanceEntry,
    isManualPrincipalEntry,
    isManualInterestEntry,
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
  } = useLedgerCalculations({
    cars,
    rentals,
    expenses,
    valuations,
    month,
    allTimeBasis,
    search,
    carFilter,
    depreciationCarIdentification,
  });
  const refresh = async () => {
    setLoading(true);
    try {
      const [c, r, e, v] = await Promise.all([
        api<Car[]>("/cars"),
        api<Rental[]>("/rentals"),
        api<Expense[]>("/expenses"),
        api<Valuation[]>("/valuations"),
      ]);
      setCars(c);
      setRentals(r);
      setExpenses(e);
      setValuations(v);
      setError("");
    } catch (e: any) {
      setError(e.message + " — make sure the local server is running.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
  }, []);
  const openNew = (which: string) => {
    setEditing(null);
    setModal(which);
  };
  const openEdit = (which: string, row: any) => {
    setEditing(row);
    setModal(which);
  };
  async function save(table: string, data: any) {
    try {
      if (editing?.identification)
        await api(`/${table}/${editing.identification}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      else
        await api(`/${table}`, { method: "POST", body: JSON.stringify(data) });
      setModal("");
      setEditing(null);
      await refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }
  async function remove(table: string, identification: number) {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    try {
      await api(`/${table}/${identification}`, { method: "DELETE" });
      await refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }
  async function uploadReceipt(file: File) {
    if (file.size > 10 * 1024 * 1024)
      throw new Error("Receipt must be under 10 MB");
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    return api<{ path: string }>("/receipt", {
      method: "POST",
      body: JSON.stringify({ name: file.name, data }),
    });
  }
  const exportCsv = () => {
    const rows = [
      [
        "Date",
        "Car",
        "Rental ID",
        "Category",
        "Description",
        "Amount CAD",
        "Treatment",
        "Receipt path",
      ],
      ...visibleExpenses.map((e) => [
        e.date,
        carName(e.vehicle_identification),
        e.rental_identification || "",
        e.category,
        e.description,
        e.amount,
        e.treatment,
        e.receipt_path,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");
    download("rental-expenses.csv", csv, "text/csv");
  };
  const backup = async () => {
    try {
      const r = await fetch(API + "/backup");
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rental-ledger-backup.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message);
    }
  };
  const restore = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      await api("/restore", { method: "POST", body: JSON.stringify(data) });
      await refresh();
      alert("Backup restored.");
    } catch (e: any) {
      setError("Could not restore backup: " + e.message);
    }
  };
  const pageContext = {
    month,
    allTimeBasis,
    setAllTimeBasis,
    setMonth,
    monthRentals,
    chartData,
    setCalculationDetails,
    cars,
    rentals,
    expenses,
    valuations,
    setTab,
    openNew,
    openEdit,
    remove,
    carName,
    depreciationCar,
    depreciationChartData,
    setDepreciationCarIdentification,
    money,
    num,
    today,
    rentalGrossRevenue,
    rentalRevenue,
    rentalTuroAdjustments,
    rentalEarnings,
    rentalDistance,
    totalDepreciation,
    rentalDepreciation,
    expensesFor,
    carExpenses,
    rentalPlatformCosts,
    search,
    setSearch,
    carFilter,
    setCarFilter,
    visibleExpenses,
    exportCsv,
    backup,
    restore,
    editing,
    setEditing,
    setModal,
    save,
    refresh,
    API,
    revenue,
    completedRevenue,
    monthExpenses,
    cashExpenses,
    cashExpenseBreakdown,
    averageRentalRevenue,
    averageKilometres,
    averageDailyKilometres,
    operatingProfit,
    cashProfitBeforePrincipal,
    profit,
    cashFlow,
    principal,
    monthKm,
    estimatedDep,
    averageRevenuePerRentalDay,
    averageBookingLength,
    revenuePerKilometre,
    rentalDays,
    distanceTrackedRentals,
    distanceTrackedKilometres,
    distanceTrackedRevenue,
    distanceTrackedRentalDays,
    revenueTrackedRentals,
    revenueTrackedTotal,
    revenueTrackedDays,
    loanBreakdownForMonth,
    loanBreakdownThroughMonth,
    automaticLoanBreakdownForMonth,
    automaticLoanBreakdownThroughToday,
    expenseAppliesToMonth,
    expenseAmountForPeriod,
    isManualFinanceEntry,
    isManualPrincipalEntry,
    isManualInterestEntry,
    insuranceCostForMonth,
    insuranceCostThroughToday,
    insuranceConfigured,
    totalVehicleKilometres,
    depreciationDescription,
  };

  return (
    <div className="app-shell">
      <AppSidebar
        tab={tab}
        setTab={setTab}
        expensesCount={expenses.length}
        openData={() => setModal("data")}
      />
      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">FLEET MANAGEMENT / FINANCES</div>
            <h1>
              {tab === "Overview"
                ? "Financial overview"
                : tab === "Cars"
                  ? "Your vehicles"
                  : tab === "Rentals"
                    ? "Rental bookings"
                    : tab === "Expenses"
                      ? "Expense ledger"
                      : tab === "Valuations"
                        ? "Vehicle valuations"
                        : tab === "Hypotheticals"
                          ? "Rental hypotheticals"
                          : "Reports & analysis"}
            </h1>
          </div>
          <div className="top-actions">
            <span className="today-pill">
              {new Date().toLocaleDateString("en-CA", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <button
              className="primary"
              onClick={() =>
                openNew(
                  tab === "Cars"
                    ? "car"
                    : tab === "Rentals"
                      ? "rental"
                      : tab === "Valuations"
                        ? "valuation"
                        : "expense",
                )
              }
            >
              <Plus size={17} /> Add{" "}
              {tab === "Cars"
                ? "vehicle"
                : tab === "Rentals"
                  ? "rental"
                  : tab === "Valuations"
                    ? "valuation"
                    : "expense"}
            </button>
          </div>
        </header>
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}
        <div className="content">
          {loading ? (
            <div className="loading">Loading your local ledger…</div>
          ) : (
            <>
              {tab === "Overview" && <OverviewPage context={pageContext} />}
              {tab === "Cars" && <CarsPage context={pageContext} />}
              {tab === "Rentals" && <RentalsPage context={pageContext} />}
              {tab === "Expenses" && <ExpensesPage context={pageContext} />}
              {tab === "Valuations" && <ValuationsPage context={pageContext} />}
              {tab === "Reports" && <ReportsPage context={pageContext} />}
              {tab === "Hypotheticals" && <HypotheticalsPage context={pageContext} />}
            </>
          )}
        </div>
        <footer className="footer">
          <span>
            <span className="status-dot" /> Running locally · data stored in
            SQLite
          </span>
          <span>Car Rental Ledger v1.0 · CAD</span>
        </footer>
      </main>
      {modal && (
        <Modal
          title={
            modal === "car"
              ? editing
                ? "Edit vehicle"
                : "Add vehicle"
              : modal === "rental"
                ? editing
                  ? "Edit rental"
                  : "Add rental"
                : modal === "expense"
                  ? editing
                    ? "Edit expense"
                    : "Add expense"
                  : modal === "valuation"
                    ? editing
                      ? "Edit valuation"
                      : "Add market valuation"
                    : "Data & backups"
          }
          onClose={() => {
            setModal("");
            setEditing(null);
          }}
        >
          {modal === "car" ? (
            <CarForm
              initial={editing || blankCar}
              onSave={(d) => save("cars", d)}
              onCancel={() => setModal("")}
            />
          ) : modal === "rental" ? (
            <RentalForm
              initial={
                editing || {
                  ...blankRental,
                  vehicle_identification: cars[0]?.identification || 0,
                }
              }
              cars={cars}
              onSave={(d) => save("rentals", d)}
              onCancel={() => setModal("")}
            />
          ) : modal === "expense" ? (
            <ExpenseForm
              initial={editing || blankExpense}
              cars={cars}
              rentals={rentals}
              uploadReceipt={uploadReceipt}
              onSave={(d) => save("expenses", d)}
              onCancel={() => setModal("")}
            />
          ) : modal === "valuation" ? (
            <ValuationForm
              initial={
                editing || {
                  vehicle_identification: cars[0]?.identification || 0,
                  date: today(),
                  odometer_km: cars[0]?.odometer_km || 0,
                  market_value: cars[0]?.current_value || 0,
                  notes: "",
                }
              }
              cars={cars}
              onSave={async (d) => {
                await save("valuations", d);
                const c = cars.find(
                  (x) => x.identification === Number(d.vehicle_identification),
                );
                if (c)
                  await api(`/cars/${c.identification}`, {
                    method: "PUT",
                    body: JSON.stringify({
                      ...c,
                      current_value: Number(d.market_value),
                      odometer_km: Number(d.odometer_km),
                    }),
                  });
                await refresh();
              }}
              onCancel={() => setModal("")}
            />
          ) : (
            <div className="form-stack">
              <p>
                Keep a separate backup of your SQLite database and receipts. A
                JSON export backs up ledger records; receipt files should also
                be copied from the <code>data/receipts</code> folder.
              </p>
              <button className="primary full" onClick={backup}>
                <ArrowDownToLine size={16} /> Export full data backup (JSON)
              </button>
              <label className="secondary upload-button">
                <Upload size={16} /> Restore from JSON backup
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(e) =>
                    e.target.files?.[0] && restore(e.target.files[0])
                  }
                />
              </label>
              <div className="note-box">
                <Activity size={16} />
                <span>
                  Store backups somewhere safe. Restoring replaces current
                  records. This app has no cloud sync, login, or remote access.
                </span>
              </div>
            </div>
          )}
        </Modal>
      )}
      {calculationDetails && (
        <CalculationModal
          {...calculationDetails}
          onClose={() => setCalculationDetails(null)}
        />
      )}
    </div>
  );
}
export default App;
