// src/components/StepLayout.jsx
import React from "react";
import "../css/StepLayout.css";

export default function StepLayout({ title = "", onBack, footerLabel = "TIẾP THEO", footerDisabled = false, onFooterClick, children }) {
  return (
    <div className="step-layout">
      <header className="step-layout-header">
        <button type="button" className="step-layout-back" onClick={onBack} aria-label="Quay lại">
          ←
        </button>

        <p className="step-layout-title">{title}</p>
      </header>

      <main className="step-layout-content">{children}</main>

      <footer className="step-layout-footer">
        <button type="button" className="step-layout-next" onClick={onFooterClick} disabled={footerDisabled}>
          {footerLabel}
        </button>
      </footer>
    </div>
  );
}
