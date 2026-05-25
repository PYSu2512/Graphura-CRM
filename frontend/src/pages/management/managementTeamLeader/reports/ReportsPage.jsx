import { useState } from "react";
import { CalendarCheck, History } from "lucide-react";
import {
  Heading,
} from "../../../../components/shared/Common_Components";
import DailyReportTable from "./components/DailyReportTable";
import ReassignModal from "./components/ReassignModal";
import ReportCharts from "./components/ReportCharts";
import ReportStatsCards from "./components/ReportStatsCards";
import SubmitReportModal from "./components/SubmitReportModal";
import ViewReportModal from "./components/ViewReportModal";
import WeeklyPerformanceTable from "./components/WeeklyPerformanceTable";
import {
  completedPendingData,
  dailyReportMetrics,
  projectReportRows,
  reportStatusData,
  weeklyEmployeePerformanceData,
  weeklyReportMetrics,
  weeklyPerformanceRows,
  weeklyProductivityData,
} from "./reportData";

const employeeOptions = ["Aarav Mehta", "Nisha Kapoor", "Dev Arora", "Ira Shah", "Kabir Sethi"];

export default function ReportsPage() {
  const [selected, setSelected] = useState(null);
  const [reportType, setReportType] = useState("daily");

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <Heading
        primaryText="Management Team"
        secondaryText="Reports"
        showAnimations
      />

      <div className="flex items-center justify-between">
        <div className="flex w-full items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm md:w-fit">
          {[
            { key: "daily", label: "Daily Progress Report", icon: CalendarCheck },
            { key: "weekly", label: "Weekly Update", icon: History },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setReportType(key)}
              className={`flex items-center justify-center gap-2.5 rounded-[14px] px-5 py-2.5 text-[15px] font-bold transition-all duration-300 ${
                reportType === key
                  ? "bg-[#2a465a] text-white shadow-md shadow-[#2a465a]/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon size={18} strokeWidth={reportType === key ? 2 : 1.5} className={reportType === key ? "text-white" : "text-slate-400"} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {reportType === "daily" && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/60 p-4 shadow-sm">
          <ReportStatsCards metrics={dailyReportMetrics} />
          <ReportCharts type="daily" completionData={completedPendingData} statusData={reportStatusData} />
          <DailyReportTable rows={projectReportRows} onSelect={setSelected} />
        </section>
      )}

      {reportType === "weekly" && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/60 p-4 shadow-sm">
          <ReportStatsCards metrics={weeklyReportMetrics} />
          <ReportCharts
            type="weekly"
            productivityData={weeklyProductivityData}
            performanceData={weeklyEmployeePerformanceData}
          />
          <WeeklyPerformanceTable rows={weeklyPerformanceRows} />
        </section>
      )}

      <ViewReportModal report={selected} />
      <ReassignModal report={selected} employeeOptions={employeeOptions} />
      <SubmitReportModal />
    </div>
  );
}
