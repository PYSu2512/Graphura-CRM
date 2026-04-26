import React from "react";

const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    aria-checked={checked}
    role="switch"
    style={{
      width: 36,
      height: 20,
      borderRadius: 10,
      flexShrink: 0,
      background: checked ? "#1D9E75" : "var(--color-background-secondary)",
      border: `0.5px solid ${checked ? "#0F6E56" : "var(--color-border-secondary)"}`,
      position: "relative",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background 0.15s, border-color 0.15s",
      opacity: disabled ? 0.5 : 1,
    }}
  >
    <span
      style={{
        position: "absolute",
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: "white",
        top: 2,
        left: checked ? 18 : 2,
        transition: "left 0.15s",
      }}
    />
  </button>
);

export default Toggle;
