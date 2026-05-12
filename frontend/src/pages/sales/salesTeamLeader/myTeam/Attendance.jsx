import React from "react";
import { teamExecutives } from "./teamStore";

export default function Attendance() {
  return (
    <div style={{ padding: "10px" }}>
      <h3>Team Attendance</h3>

      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Employee ID</th>
            <th>Region</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {teamExecutives.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.id}</td>
              <td>{emp.region}</td>
              <td>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    backgroundColor:
                      emp.status === "Active" ? "#d1fae5" : "#fde68a",
                    color: "#111",
                    fontWeight: "bold",
                  }}
                >
                  {emp.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}