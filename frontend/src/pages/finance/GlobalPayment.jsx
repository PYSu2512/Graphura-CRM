import React, { useState } from "react";
import {
  Heading, Grid, DashGrid, Button,
  DataField, SelectField, Option,
} from "../../components/shared/Common_Components";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";

const validate = (form) => {
  const errors = {};
  if (!form.email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email";
  if (form.paymentType === "Partial") {
    const partial = parseFloat(form.partialAmount) || 0;
    const remaining = form.remainingAmount || 0;
    if (partial <= 0) errors.partialAmount = "Enter a valid partial amount";
    if (partial > remaining) errors.partialAmount = "Partial amount cannot exceed remaining amount";
  }
  return errors;
};

export default function GlobalPayment() {
  const [step, setStep] = useState(1); // 1=identify, 1.5=select, 2=payment, 3=result
  const [form, setForm] = useState({ email: "", mobile: "", name: "", service: "", totalAmount: 0, paidAmount: 0, remainingAmount: 0, paymentType: "Full", partialAmount: "", prospectId: "" });
  const [prospects, setProspects] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const payAmount = form.paymentType === "Full" ? form.remainingAmount : parseFloat(form.partialAmount) || 0;

  const findClient = async () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const response = await apiClient.get(`/finance/payments/search-prospect?email=${encodeURIComponent(form.email)}`);
      const data = response.data.data;
      if (data.found) {
        if (data.prospects.length === 1) {
          setForm(p => ({ ...p, ...data.prospects[0] }));
          setStep(2);
        } else {
          setProspects(data.prospects);
          setStep(1.5);
        }
      } else {
        const msg = data.allPaid 
          ? "All payments for this client are already completed." 
          : "No client found with this email. Please check and try again.";
        setErrors({ email: msg });
      }
    } catch (err) {
      setErrors({ email: err.response?.data?.message || "Error searching for client" });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProspect = (e) => {
    const selectedId = e.target.value;
    const selected = prospects.find(p => p.prospectId === selectedId);
    if (selected) {
      setForm(p => ({ ...p, ...selected }));
    }
  };

  const proceedToPayment = () => {
    if (!form.prospectId) {
      setErrors({ selection: "Please select a prospect to continue" });
      return;
    }
    setStep(2);
  };

  const pay = async () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (form.remainingAmount === 0) {
      setErrors({ general: "This client has no remaining balance." });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/finance/payments/offline-payment", {
        prospectId: form.prospectId,
        amount: payAmount,
        paymentType: form.paymentType,
        note: `Global Payment for ${form.service}`
      });

      const data = response.data.data;
      setResult({
        success: true,
        amount: data.amount,
        type: form.paymentType,
        client: form.name,
        txnId: data.txnId,
      });
      setStep(3);
      toast.success("Payment recorded successfully!");
    } catch (err) {
      setResult({
        success: false,
        amount: payAmount,
        error: err.response?.data?.message || "Failed to record payment"
      });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({ email: "", mobile: "", name: "", service: "", totalAmount: 0, paidAmount: 0, remainingAmount: 0, paymentType: "Full", partialAmount: "", prospectId: "" });
    setProspects([]);
    setErrors({});
    setResult(null);
    setStep(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Global" secondaryText="Payment Portal" size={12} />
      </DashGrid>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {["Client ID", "Payment", "Result"].map((label, i) => (
          <React.Fragment key={label}>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition ${step >= i + 1 ? (step > i + 1 ? "bg-emerald-100 text-emerald-700" : "bg-[#2a465a] text-white") : "bg-slate-100 text-slate-400"}`}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center border-2 border-current text-[10px]">{step > i + 1 ? "✓" : i + 1}</span>
              {label}
            </div>
            {i < 2 && <div className="flex-1 h-px bg-slate-200" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Client Identification */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#2a465a]">Find Client</h3>
          <Grid cols={12} gap={4}>
            <DataField label="Client Email" id="gp-email" type="email" placeholder="client@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} size={12} />
            {errors.email && <div className="col-span-12 text-xs text-rose-500 font-semibold -mt-2">{errors.email}</div>}
            <Button text={loading ? "Searching..." : "Find Client →"} variant="primary" size={12} onClick={findClient} disabled={loading} />
          </Grid>
        </div>
      )}

      {/* Step 1.5: Select Client & Service */}
      {step === 1.5 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="text-lg font-bold text-[#2a465a]">Select Client</h3>
          <p className="text-sm text-slate-500 -mt-2">Multiple pending accounts found for <b>{form.email}</b>. Please select the correct client record:</p>
          <Grid cols={12} gap={4}>
            <SelectField 
              label="Select Unpaid Client Record" 
              id="gp-select" 
              value={form.prospectId} 
              onChange={handleSelectProspect}
              size={12}
            >
              <Option value="" label="-- Choose Client & Service --" />
              {prospects.map(p => (
                <Option 
                  key={p.prospectId} 
                  value={p.prospectId} 
                  label={`${p.name} | ${p.service} (Unpaid: ₹${p.remainingAmount.toLocaleString()})`} 
                />
              ))}
            </SelectField>
            {errors.selection && <div className="col-span-12 text-xs text-rose-500 font-semibold -mt-2">{errors.selection}</div>}
            
            <div className="col-span-12 flex gap-3 mt-2">
              <Button text="Continue →" variant="primary" size={8} onClick={proceedToPayment} />
              <Button text="Back" variant="ghost" size={4} onClick={() => setStep(1)} />
            </div>
          </Grid>
        </div>
      )}

      {/* Step 2: Payment Details */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          {/* Client Summary Card */}
          <div className="bg-[#2a465a]/5 border border-[#2a465a]/20 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Client Found</p>
            <div className="grid grid-cols-2 gap-3">
              {[["Name", form.name], ["Mobile", form.mobile], ["Service", form.service]].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 font-semibold">{label}</p>
                  <p className="text-sm font-bold text-[#2a465a] truncate">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            <h3 className="text-lg font-bold text-[#2a465a]">Payment Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              {[["Total Amount", `₹${form.totalAmount.toLocaleString()}`], ["Paid Amount", `₹${form.paidAmount.toLocaleString()}`], ["Remaining", `₹${form.remainingAmount.toLocaleString()}`]].map(([label, val]) => (
                <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center transition hover:border-slate-300">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{label}</p>
                  <p className="text-base font-black text-[#2a465a] mt-1">{val}</p>
                </div>
              ))}
            </div>

            <Grid cols={12} gap={4}>
              <SelectField label="Payment Type" id="gp-type" value={form.paymentType} onChange={e => setForm(p => ({ ...p, paymentType: e.target.value }))} size={12}>
                <Option value="Full" label="Full Payment" />
                <Option value="Partial" label="Partial Payment" />
              </SelectField>

              {form.paymentType === "Partial" && (
                <>
                  <DataField label="Partial Amount (₹)" id="gp-partial" type="number" placeholder="Enter amount" value={form.partialAmount} onChange={e => setForm(p => ({ ...p, partialAmount: e.target.value }))} size={12} />
                  {errors.partialAmount && <div className="col-span-12 text-xs text-rose-500 font-semibold -mt-2">{errors.partialAmount}</div>}
                </>
              )}

              {/* Pay Amount Preview */}
              <div className="col-span-12 bg-[#2a465a] rounded-2xl px-4 py-3 flex justify-between items-center shadow-md">
                <span className="text-white text-sm font-semibold">Amount to Pay</span>
                <span className="text-white text-xl font-black">₹{payAmount.toLocaleString()}</span>
              </div>

              {errors.general && <div className="col-span-12 text-xs text-rose-500 font-semibold">{errors.general}</div>}

              <Button text={loading ? "Processing..." : "Pay Now →"} variant="primary" size={8} onClick={pay} disabled={loading} />
              <Button text="Reset" variant="secondary" size={4} onClick={reset} disabled={loading} />
            </Grid>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && result && (
        <div className={`rounded-2xl p-8 text-center border shadow-sm ${result.success ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
          <div className={`text-5xl mb-4 animate-bounce`}>{result.success ? "✅" : "❌"}</div>
          <h3 className={`text-xl font-black mb-2 ${result.success ? "text-emerald-700" : "text-rose-700"}`}>
            {result.success ? "Payment Successful!" : "Payment Failed"}
          </h3>
          <p className="text-sm text-slate-600 mb-4 px-4">
            {result.success
              ? `₹${result.amount.toLocaleString()} (${result.type}) received from ${result.client}.`
              : result.error || "Payment could not be processed."}
          </p>
          {result.success && (
            <p className="text-xs font-bold text-slate-400 mb-6">Transaction ID: {result.txnId}</p>
          )}
          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="bg-[#2a465a] text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-[#1e3a52] transition shadow-md active:scale-95">
              New Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
