import { DumpedLeadsTable } from "./components/DumpedLeadsTable";
import { useDumpData } from "./hooks/useDumpData";

export default function DumpDataPage() {
  const { tableRows, reasonOptions } = useDumpData();

  return (
    <div className="space-y-6">
      <DumpedLeadsTable
        rows={tableRows}
        reasonOptions={reasonOptions}
      />
    </div>
  );
}
