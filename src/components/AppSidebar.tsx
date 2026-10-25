import {
  CarFront,
  ChartNoAxesCombined,
  Gauge,
  LayoutDashboard,
  Receipt,
  Settings2,
  Wallet,
  FlaskConical,
} from "lucide-react";
import type { Tab } from "../model";

type Props = {
  tab: Tab;
  setTab: (tab: Tab) => void;
  expensesCount: number;
  openData: () => void;
};

const navigation = [
  ["Overview", LayoutDashboard, "Dashboard"],
  ["Cars", CarFront, "Vehicles"],
  ["Rentals", Wallet, "Bookings"],
  ["Expenses", Receipt, "Transactions"],
  ["Valuations", Gauge, "Depreciation"],
  ["Hypotheticals", FlaskConical, "Hypotheticals"],
  ["Reports", ChartNoAxesCombined, "Reports"],
] as const;

export function AppSidebar({ tab, setTab, expensesCount, openData }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><CarFront size={23} /></div>
        <div>
          <strong>Rental Ledger</strong>
          <span>LOCAL FINANCE TRACKER</span>
        </div>
      </div>
      <div className="nav-label">WORKSPACE</div>
      <nav>
        {navigation.map(([key, Icon, label]) => (
          <button
            key={key}
            className={`nav-item ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            <Icon size={18} />
            <span>{label}</span>
            {key === "Expenses" && <small>{expensesCount}</small>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="local-badge">
          <span className="status-dot" />
          <div>
            <strong>Local database</strong>
            <span>Your data stays on this computer</span>
          </div>
        </div>
        <button className="nav-item" onClick={openData}>
          <Settings2 size={18} /> Data & backups
        </button>
      </div>
    </aside>
  );
}
