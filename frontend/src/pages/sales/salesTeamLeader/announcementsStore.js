// announcementsStore.js — TL announcement messages (warning / appreciation)
// Audience is restricted to executives in the TL's team.

import { teamExecutives, currentTL } from "./teamLeaderStore";

const today = new Date().toISOString().slice(0, 10);
const computeStatus = (expiry) => (!expiry || expiry >= today ? "Active" : "Expired");

export const initialAnnouncements = [
  {
    id: "ANN-001",
    title: "Appreciation: Top Performer of the Month",
    type: "Appreciation",
    audience: "Executive",
    audienceDetail: "Rahul Sharma",
    sentDate: "2026-05-01",
    expiryDate: "2026-05-31",
    body: "Outstanding work this month — you closed 42 sales and led the leaderboard. Keep it up!",
    status: computeStatus("2026-05-31"),
  },
  {
    id: "ANN-002",
    title: "Warning: Low Call Activity",
    type: "Warning",
    audience: "Executive",
    audienceDetail: "Vikram Tiwari",
    sentDate: "2026-05-02",
    expiryDate: "2026-05-12",
    body: "Your call count this week is below team average. Please review your daily plan and improve by week's end.",
    status: computeStatus("2026-05-12"),
  },
  {
    id: "ANN-003",
    title: "Team-wide Reminder: Update Prospect Forms Daily",
    type: "Announcement",
    audience: "Team",
    audienceDetail: currentTL.team,
    sentDate: "2026-05-03",
    expiryDate: "2026-06-30",
    body: "All executives are reminded to keep prospect forms up to date. Pending forms will be flagged in next week's review.",
    status: computeStatus("2026-06-30"),
  },
  {
    id: "ANN-004",
    title: "Appreciation: Highest Conversion Rate",
    type: "Appreciation",
    audience: "Executive",
    audienceDetail: "Priya Mehta",
    sentDate: "2026-05-04",
    expiryDate: "2026-05-31",
    body: "Excellent conversion rate of 13.1% this month — a great signal of quality calls and strong follow-through.",
    status: computeStatus("2026-05-31"),
  },
];

// Audience choices for the TL — only Team or Executive (no role/dept selectors)
export const TL_AUDIENCE_OPTIONS = ["Team", "Executive"];

// Executive list (canonical from teamLeaderStore)
export const EXECUTIVE_NAMES = teamExecutives.map((e) => e.name);
