import React from "react";

const FieldMeta = ({ note, error }) => {
  if (!note && !error) return null;
  return (
    <p
      className={`mt-1.5 text-xs ${error ? "text-rose-500" : "text-slate-400"}`}
    >
      {error || note}
    </p>
  );
};

export default FieldMeta;
