import { CarFront, Info, Plus, X } from "lucide-react";
import type { ReactNode } from "react";

export type CalculationDetail = { label: string; value: string };

export function Metric({
  label,
  value,
  hint,
  icon,
  tone,
  onInfo,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  tone: string;
  onInfo?: () => void;
}) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <div className="metric-top-actions">
          <div className={`metric-icon ${tone}`}>{icon}</div>
          {onInfo && (
            <button
              className="metric-info"
              type="button"
              aria-label={`Explain ${label}`}
              title={`Explain ${label}`}
              onClick={onInfo}
            >
              <Info size={13} />
            </button>
          )}
        </div>
      </div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-hint">{hint}</span>
    </div>
  );
}

export function CalculationModal({
  title,
  definition,
  formula,
  items,
  onClose,
}: {
  title: string;
  definition: string;
  formula: string;
  items: CalculationDetail[];
  onClose: () => void;
}) {
  return (
    <Modal title={`${title} — calculation`} onClose={onClose}>
      <div className="calculation-details">
        <p>{definition}</p>
        <div className="calculation-formula">
          <span>Formula</span>
          <code>{formula}</code>
        </div>
        <div className="calculation-items">
          {items.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export function Empty({
  text,
  action,
  onClick,
}: {
  text: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-illustration">
        <CarFront size={30} />
      </div>
      <h3>Nothing here yet</h3>
      <p>{text}</p>
      <button className="primary" onClick={onClick}>
        <Plus size={16} />
        {action}
      </button>
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function FormActions({
  onCancel,
  submit = "Save record",
}: {
  onCancel: () => void;
  submit?: string;
}) {
  return (
    <div className="form-actions">
      <button type="button" className="secondary" onClick={onCancel}>
        Cancel
      </button>
      <button type="submit" className="primary">
        {submit}
      </button>
    </div>
  );
}
