import React, { useState } from "react";

const initialLeaves = [
  { id: 1, name: "Amit Patil", reason: "Sick Leave", status: "Pending" },
  { id: 2, name: "Neha Desai", reason: "Family Work", status: "Pending" },
  { id: 3, name: "Ravi More", reason: "Personal", status: "Pending" },
];

export default function LeaveApprovals() {
  const [leaves, setLeaves] = useState(initialLeaves);

  const updateStatus = (id, status) => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  };

  return (
    <div style={{ padding: "10px" }}>
      <h3>Leave Approvals</h3>

      {leaves.map((l) => (
        <div
          key={l.id}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <p><b>{l.name}</b></p>
          <p>Reason: {l.reason}</p>
          <p>Status: {l.status}</p>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => updateStatus(l.id, "Approved")}
              style={{ background: "green", color: "white", padding: "5px 10px" }}
            >
              Approve
            </button>

            <button
              onClick={() => updateStatus(l.id, "Rejected")}
              style={{ background: "red", color: "white", padding: "5px 10px" }}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}