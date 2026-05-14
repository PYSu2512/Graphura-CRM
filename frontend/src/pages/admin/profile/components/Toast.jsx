import React, { useEffect } from "react";

const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const styles = {
    success: {
      background: "var(--color-background-success, #ecfdf3)",
      color: "var(--color-text-success, #166534)",
      border: "0.5px solid var(--color-border-success, #86efac)",
    },
    error: {
      background: "var(--color-background-danger, #fff1f2)",
      color: "var(--color-text-danger, #be123c)",
      border: "0.5px solid var(--color-border-danger, #fda4af)",
    },
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
        padding: "10px 16px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 500,
        boxShadow: "0 4px 20px rgba(0,0,0,.08)",
        ...styles[type],
      }}
    >
      {message}
    </div>
  );
};

export default Toast;
