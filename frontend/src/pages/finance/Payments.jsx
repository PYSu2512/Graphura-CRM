import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Heading,
  DashGrid,
  EnhancedDashCard,
  DataTable,
  Button,
  Modal,
  ModalProfile,
  ModalGrid,
  ModalData,
  DataField,
  SelectField,
  Option,
  openModal,
  closeModal,
} from "../../components/shared/Common_Components";
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Split,
  DollarSign,
  Eye,
  ShieldCheck,
  Ban,
  Link2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";
import { maskId } from "../../utils/idMask";

const fmt = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const fmtDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const statusColor = (s) => {
  if (s === "Successful") return "bg-emerald-100 text-emerald-700";
  if (s === "Pending") return "bg-amber-100 text-amber-700";
  if (s === "Failed") return "bg-rose-100 text-rose-700";
  return "bg-blue-100 text-blue-700";
};

export default function Payments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payments, setPayments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [verifyForm, setVerifyForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sendingLinkId, setSendingLinkId] = useState(null);
  const [recreatingLinkId, setRecreatingLinkId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    pending: 0,
    failed: 0,
    partial: 0,
    full: 0,
  });
  const [pollingActive, setPollingActive] = useState(false);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/finance/payments");
      const data = response?.data?.data || {};
      const paymentsList = (data.payments || []).map((p) => ({
        ...p,
        link: p.razorpayLinkUrl,
      }));
      setPayments(paymentsList);
      setStats(
        data.stats || {
          total: 0,
          successful: 0,
          pending: 0,
          failed: 0,
          partial: 0,
          full: 0,
        },
      );
    } catch (fetchError) {
      setError(fetchError?.message || "Failed to load payment records");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load payments on mount
  useEffect(() => {
    loadPayments();

    // Check if returning from successful payment
    const successParam = searchParams.get("success");
    if (successParam === "true") {
      toast.success("Payment received! Your records have been updated.");
      setSearchParams({}, { replace: true });
      // Reload payments immediately
      loadPayments();
    }
  }, [loadPayments, searchParams, setSearchParams]);

  // Polling mechanism: refresh payment status every 10 seconds
  // This helps catch webhook updates in real-time
  useEffect(() => {
    const hasPending = payments.some(
      (p) => p.status === "Pending" || p.paymentLinkStatus === "SENT",
    );

    if (!hasPending) {
      if (pollingActive) setPollingActive(false);
      return;
    }

    if (!pollingActive) {
      setPollingActive(true);
    }

    const pollInterval = setInterval(() => {
      loadPayments();
    }, 10000); // Refresh every 10 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [payments, pollingActive, loadPayments]);

  const total = stats.total || payments.length;
  const successful =
    stats.successful ??
    payments.filter((p) => p.status === "Successful").length;
  const pending =
    stats.pending ?? payments.filter((p) => p.status === "Pending").length;
  const failed =
    stats.failed ?? payments.filter((p) => p.status === "Failed").length;
  const partial =
    stats.partial ?? payments.filter((p) => p.type === "Partial").length;
  const full = stats.full ?? payments.filter((p) => p.type === "Full").length;

  const openView = (row) => {
    setSelected(row);
    openModal("pay-view");
  };
  const openVerify = (row) => {
    setSelected(row);
    setVerifyForm({
      status: "Successful",
      note: "",
      type: row.type,
      amount: row.amount,
    });
    openModal("pay-verify");
  };
  const sendRazorpayLink = async (row) => {
    setSendingLinkId(row.prospectId);
    const tid = toast.loading("Sending payment link…");
    try {
      const response = await apiClient.post(
        `/finance/payments/${row.prospectId}/send-razorpay-link`,
        {
          email: row.email,
          clientName: row.client,
          companyName: row.companyName,
          mobile: row.mobile,
        },
      );
      const emailResult = response?.data?.data?.email;
      if (emailResult && emailResult.success === false) {
        toast.error(
          emailResult.reason ||
            "Payment link created, but email delivery failed",
          { id: tid },
        );
      } else {
        toast.success("Payment link sent successfully!", { id: tid });
      }
      await loadPayments();
    } catch (sendError) {
      toast.error(sendError?.message || "Failed to send Razorpay link", { id: tid });
      setError(sendError?.message || "Failed to send Razorpay link");
    } finally {
      setSendingLinkId(null);
    }
  };
  const markFailed = async (row) => {
    const tid = toast.loading("Marking as failed...");
    try {
      await apiClient.put(`/finance/payments/${row.prospectId}/failed`, {
        note: "Cancelled manually from Payments management",
      });
      toast.success("Payment marked failed", { id: tid });
      await loadPayments();
    } catch (failError) {
      console.error(failError);
      toast.error(
        failError?.response?.data?.message ||
          failError?.message ||
          "Failed to update payment",
        { id: tid },
      );
    }
  };

  const recreateLink = async (row) => {
    setRecreatingLinkId(row.prospectId);
    try {
      toast.loading("Creating new payment link…", { id: "recreate" });
      await apiClient.post(
        `/finance/payments/${row.prospectId}/recreate-link`,
        {
          email: row.email,
          mobile: row.mobile,
        },
      );
      toast.dismiss("recreate");
      toast.success("New payment link created! Click 'Send Link' to send it to client.");
      await loadPayments();
    } catch (err) {
      toast.dismiss("recreate");
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to recreate link",
      );
    } finally {
      setRecreatingLinkId(null);
    }
  };

  const saveVerify = async () => {
    try {
      await apiClient.put(`/finance/payments/${selected.prospectId}/verify`, {
        status: verifyForm.status,
        amount: verifyForm.amount,
        method: verifyForm.type,
        note: verifyForm.note,
      });
      closeModal("pay-verify");
      await loadPayments();
    } catch (saveError) {
      setError(saveError?.message || "Failed to update payment");
    }
  };

  const columns = [
    { key: "client", label: "Client Name" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    {
      key: "link",
      label: "Pay Link",
      render: (v) =>
        v ? (
          <a
            className="text-sm text-blue-600 underline"
            href={v}
            target="_blank"
            rel="noreferrer"
          >
            Open
          </a>
        ) : (
          "—"
        ),
    },
    { key: "amount", label: "Amount", render: (v) => fmt(v) },
    { key: "type", label: "Type" },
    { key: "method", label: "Method" },
    {
      key: "status",
      label: "Status",
      render: (v) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(v)}`}
        >
          {v}
        </span>
      ),
    },
    { key: "date", label: "Payment Date" },
  ];

  const paymentLinkActionLabel = (row) =>
    row?.linkStatus === "SENT" ? "Resend Link" : "Send Razorpay Link";
  const paymentLinkActionTooltip = (row) =>
    row?.linkStatus === "SENT" ? "Resend Link" : "Send Razorpay Link";

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        {error && (
          <div className="col-span-12 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}
        <Heading primaryText="Payments" secondaryText="Management" size={12} />
        <EnhancedDashCard
          title="Total Payments"
          value={total}
          icon={<CreditCard size={22} />}
          accentColor="#3b82f6"
          size={2}
        />
        <EnhancedDashCard
          title="Successful"
          value={successful}
          icon={<CheckCircle size={22} />}
          accentColor="#22c55e"
          size={2}
        />
        <EnhancedDashCard
          title="Pending"
          value={pending}
          icon={<Clock size={22} />}
          accentColor="#f59e0b"
          size={2}
        />
        <EnhancedDashCard
          title="Failed"
          value={failed}
          icon={<XCircle size={22} />}
          accentColor="#f43f5e"
          size={2}
        />
        <EnhancedDashCard
          title="Full"
          value={full}
          icon={<DollarSign size={22} />}
          accentColor="#14b8a6"
          size={3}
        />
      </DashGrid>

      <DataTable
        title="All Payments"
        columns={columns}
        rows={payments}
        pageSize={10}
        defaultSortKey="date"
        defaultSortDir="desc"
        actions={[
          {
            icon: <Link2 size={15} />,
            label: paymentLinkActionLabel,
            tooltip: paymentLinkActionTooltip,
            variant: "primary",
            onClick: sendRazorpayLink,
            show: (row) => row.status !== "Successful",
            loading: (row) => sendingLinkId === row.prospectId,
          },
          {
            icon: <RefreshCw size={15} />,
            tooltip: "Recreate Link (fix stale ngrok URL)",
            variant: "ghost",
            onClick: recreateLink,
            show: (row) => row.status !== "Successful",
            loading: (row) => recreatingLinkId === row.prospectId,
          },
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: openView,
          },
          {
            icon: <Ban size={15} />,
            tooltip: "Mark Failed",
            variant: "danger",
            onClick: (row) => {
              if (
                window.confirm(
                  `Are you sure you want to mark the payment for ${row.client} as failed?`,
                )
              ) {
                markFailed(row);
              }
            },
            show: (row) => row.status === "Pending",
          },
        ]}
      />

      {loading && (
        <div className="text-center text-sm font-medium text-slate-400">
          Loading payment records...
        </div>
      )}

      {/* View Modal */}
      <Modal id="pay-view" title="Payment Details" size="lg">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.client}
              subtitle={`${selected.method} · ${selected.type} Payment`}
              meta={`Ref: ${maskId(selected.id, 'PAY')} · ${selected.method}`}
            />
            <ModalGrid title="Razorpay Info" cols={2}>
              <ModalData
                label="Razorpay Order ID"
                value={selected.razorOrderId}
              />
              <ModalData
                label="Razorpay Payment ID"
                value={selected.razorPayId}
              />
              <ModalData
                label="Razorpay Link"
                value={selected.razorpayLinkUrl || "—"}
              />
              <ModalData
                label="Link Status"
                value={selected.linkStatus || "PENDING"}
              />
            </ModalGrid>
            <ModalGrid title="Client Info" cols={2}>
              <ModalData label="Mobile" value={selected.mobile} />
              <ModalData label="Email" value={selected.email} />
            </ModalGrid>
            <ModalGrid title="Payment Info" cols={2}>
              <ModalData label="Amount" value={fmt(selected.amount)} />
              <ModalData label="Payment Type" value={selected.type} />
              <ModalData label="Method" value={selected.method} />
              <ModalData label="Status" value={selected.status} />
              <ModalData label="Date & Time" value={fmtDate(selected.date)} />
              <ModalData label="Notes" value={selected.notes || "—"} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button
                text="Close"
                variant="ghost"
                size={3}
                onClick={() => closeModal("pay-view")}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Verify Modal */}
      <Modal id="pay-verify" title="Verify / Update Payment" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.client}
              subtitle={`Amount: ${fmt(selected.amount)} · Ref: ${maskId(selected.id, 'PAY')}`}
              meta={`Amount: ${fmt(selected.amount)}`}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Status"
                id="v-status"
                value={verifyForm.status}
                onChange={(e) =>
                  setVerifyForm((p) => ({ ...p, status: e.target.value }))
                }
              >
                <Option value="Successful" label="Successful" />
                <Option value="Pending" label="Pending" />
                <Option value="Failed" label="Failed" />
              </SelectField>
              <SelectField
                label="Payment Type"
                id="v-type"
                value={verifyForm.type}
                onChange={(e) =>
                  setVerifyForm((p) => ({ ...p, type: e.target.value }))
                }
                disabled={true}
              >
                <Option value="Full" label="Full" />
              </SelectField>
              <DataField
                label="Amount (₹)"
                id="v-amount"
                type="number"
                value={verifyForm.amount}
                onChange={(e) =>
                  setVerifyForm((p) => ({ ...p, amount: e.target.value }))
                }
                size={12}
              />
              <DataField
                label="Verification Note"
                id="v-note"
                type="textarea"
                value={verifyForm.note}
                onChange={(e) =>
                  setVerifyForm((p) => ({ ...p, note: e.target.value }))
                }
                size={12}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                text="Cancel"
                variant="ghost"
                size={3}
                onClick={() => closeModal("pay-verify")}
              />
              <Button
                text="Save"
                variant="primary"
                size={3}
                onClick={saveVerify}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
