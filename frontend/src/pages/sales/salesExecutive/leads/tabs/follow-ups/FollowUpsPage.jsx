import { useMemo, useState } from "react";
import { Heading } from "../../../../../../components/shared/Common_Components";
import ReminderStats from "./components/ReminderStats";
import FollowUpTable from "./components/FollowUpTable";
import dummyFollowUps from "./data/DummyFollowUps";

const FOLLOW_UP_TABS = ["All", "Upcoming", "Missed", "Completed"];

export default function FollowUpsPage() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredData = useMemo(() => {
    if (activeTab === "All") return dummyFollowUps;

    return dummyFollowUps.filter((item) => item.status === activeTab);
  }, [activeTab]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Heading
        primaryText="Follow-Ups"
        secondaryText="Track upcoming and missed reminders"
        fontSize="3xl"
      />

      <ReminderStats reminders={dummyFollowUps} />

      <div className="flex items-center gap-3 flex-wrap">
        {FOLLOW_UP_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-2xl px-5 py-2.5 text-sm font-black transition ${
              activeTab === tab
                ? "bg-[#2a465a] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <FollowUpTable reminders={filteredData} />
    </div>
  );
}
