import { useMemo, useState } from "react";
import {
  Button,
  DataField,
  Grid,
  Modal,
  Option,
  SelectField,
  closeModal,
} from "../../../../../components/shared/Common_Components";

const initialMetrics = {
  totalProjects: 18,
  completedProjects: 11,
  delayedProjects: 3,
};

export default function SubmitReportModal() {
  const [metrics, setMetrics] = useState(initialMetrics);

  const pendingProjects = Math.max(Number(metrics.totalProjects || 0) - Number(metrics.completedProjects || 0), 0);
  const productivityPercent = useMemo(() => {
    const total = Number(metrics.totalProjects || 0);
    const completed = Number(metrics.completedProjects || 0);
    return total ? Math.round((completed / total) * 100) : 0;
  }, [metrics.totalProjects, metrics.completedProjects]);
  const progressPercent = Math.min(productivityPercent, 100);

  const updateMetric = (key) => (event) => {
    const value = Math.max(Number(event.target.value || 0), 0);
    setMetrics((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal id="mtl-submit-daily-report" title="Submit Report to Management Manager" size="lg">
      <div className="space-y-5">
        <Grid cols={12} gap={3}>
          <SelectField label="Weekly Status" id="mtl-submit-weekly-status" size={6} placeholder="Select status" searchable={false}>
            <Option value="Excellent" label="Excellent" />
            <Option value="Good" label="Good" />
            <Option value="Average" label="Average" />
            <Option value="Delayed" label="Delayed" />
          </SelectField>
          <DataField label="Progress %" size={6} value={`${progressPercent}%`} readOnly />
          <DataField label="Total Projects" type="number" size={4} value={metrics.totalProjects} onChange={updateMetric("totalProjects")} />
          <DataField label="Completed Projects" type="number" size={4} value={metrics.completedProjects} onChange={updateMetric("completedProjects")} />
          <DataField label="Delayed Projects" type="number" size={4} value={metrics.delayedProjects} onChange={updateMetric("delayedProjects")} />
          <DataField label="Pending Projects" type="number" size={6} value={pendingProjects} readOnly />
          <DataField label="Productivity %" size={6} value={`${productivityPercent}%`} readOnly />
          <DataField
            label="Report Notes"
            type="textarea"
            size={12}
            rows={5}
            placeholder="Add the daily progress or weekly update for the Management Manager..."
          />
        </Grid>
      </div>
      <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button text="Cancel" variant="secondary" onClick={() => closeModal("mtl-submit-daily-report")} />
        <Button text="Submit" variant="primary" onClick={() => closeModal("mtl-submit-daily-report")} />
      </div>
    </Modal>
  );
}
