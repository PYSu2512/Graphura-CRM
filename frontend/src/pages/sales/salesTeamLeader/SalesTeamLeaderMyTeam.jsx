import React, { useState } from "react";
import TeamMembers from "./myTeam/TeamMembers";
import Attendance from "./myTeam/Attendance";
import LeaveApprovals from "./myTeam/LeaveApprovals";

export default function SalesTeamLeaderMyTeam() {
  const [tab, setTab] = useState("members");

  return (
    <div style={{ padding: "15px" }}>
      <h2>My Team Workspace</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", margin: "15px 0" }}>
        <button onClick={() => setTab("members")}>Team Members</button>
        <button onClick={() => setTab("attendance")}>Attendance</button>
        <button onClick={() => setTab("leaves")}>Leave Approvals</button>
      </div>

      {/* Content */}
      {tab === "members" && <TeamMembers />}
      {tab === "attendance" && <Attendance />}
      {tab === "leaves" && <LeaveApprovals />}
    </div>
  );
}