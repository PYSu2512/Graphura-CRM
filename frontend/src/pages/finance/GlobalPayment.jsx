import React, { useState } from "react";
import {
  Heading, Grid, DashGrid, Button,
  DataField, SelectField, Option,
} from "../../components/shared/Common_Components";

// ── Dummy Client DB ────────────────────────────────────────────────────────────
const clientDB = {
  "arjun@example.com": { name: "Arjun Mehta", mobile: "9876543210", service: "Brand Website", totalAmount: 80000, paidAmount: 40000 },
  "priya@example.com": { name: "Priya Sharma", mobile: "9823456789", service: "ERP Customization", totalAmount: 135000, paidAmount: 0 },
  "rohan@gupta.com": { name: "Rohan Gupta", mobile: "9812398123", service: "Google Ads", totalAmount: 57000, paidAmount: 57000 },
  "kavya@nair.com": { name: "Kavya Nair", mobile: "9012345678", service: "Brand Design", totalAmount: 43000, paidAmount: 20000 },
};

const validate = (form) => {
  const errors = {};
  if (!form.email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email";
  if (!form.mobile) errors.mobile = "Mobile is required";
  else if (!/^\d{10}$/.test(form.mobile)) errors.mobile = "Mobile must be exactly 10 digits";
  if (form.paymentType === "Partial") {
    const partial = parseFloat(form.partialAmount) || 0;
    const remaining = (form.totalAmount || 0) - (form.paidAmount || 0);
    if (partial <= 0) errors.partialAmount = "Enter a valid partial amount";
    if (partial > remaining) errors.partialAmount = "Partial amount cannot exceed remaining amount";
  }
  return errors;
};

export default function GlobalPayment() {
  const [step, setStep] = useState(1); // 1=identify, 2=payment, 3=result
  const [form, setForm] = useState({ email: "", mobile: "", name: "", service: "", totalAmount: 0, paidAmount: 0, paymentType: "Full", partialAmount: "" });
  const [errors, setErrors] = useState({});
  const [clientFound, setClientFound] = useState(false);
  const [result, setResult] = useState(null);

  const remaining = form.totalAmount - form.paidAmount;
  const payAmount = form.paymentType === "Full" ? remaining : parseFloat(form.partialAmount) || 0;

  const findClient = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const client = clientDB[form.email.toLowerCase()];
    if (client) {
      setForm(p => ({ ...p, ...client }));
      setClientFound(true);
      setStep(2);
    } else {
      setErrors({ email: "No client found with this email. Please check and try again." });
    }
  };

  const pay = () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (remaining === 0) {
      setErrors({ general: "This client has no remaining balance." });
      return;
    }

    // Dummy 80% success / 20% fail
    const success = Math.random() > 0.2;
    setResult({
      success,
      amount: payAmount,
      type: form.paymentType,
      client: form.name,
      txnId: `TXN${Date.now()}`,
    });
    setStep(3);
  };

  const reset = () => {
    setForm({ email: "", mobile: "", name: "", service: "", totalAmount: 0, paidAmount: 0, paymentType: "Full", partialAmount: "" });
    setErrors({});
    setClientFound(false);
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
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition ${step === i + 1 ? "bg-[#2a465a] text-white" : step > i + 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center border-2 border-current text-[10px]">{step > i + 1 ? "✓" : i + 1}</span>
              {label}
            </div>
            {i < 2 && <div className="flex-1 h-px bg-slate-200" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Client Identification */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-5">
          <h3 className="text-lg font-bold text-[#2a465a]">Find Client</h3>
          <Grid cols={12} gap={4}>
            <DataField label="Client Email" id="gp-email" type="email" placeholder="client@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} size={12} />
            {errors.email && <div className="col-span-12 text-xs text-rose-500 font-semibold -mt-2">{errors.email}</div>}
            <Button text="Find Client →" variant="primary" size={12} onClick={findClient} />
          </Grid>
        </div>
      )}

      {/* Step 2: Payment Details */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          {/* Client Summary Card */}
          <div className="bg-[#2a465a]/5 border border-[#2a465a]/20 rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Client Found</p>
            <div className="grid grid-cols-2 gap-3">
              {[["Name", form.name], ["Mobile", form.mobile], ["Service", form.service]].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 font-semibold">{label}</p>
                  <p className="text-sm font-bold text-[#2a465a]">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-[#2a465a]">Payment Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              {[["Total Amount", `₹${form.totalAmount.toLocaleString()}`], ["Paid Amount", `₹${form.paidAmount.toLocaleString()}`], ["Remaining", `₹${remaining.toLocaleString()}`]].map(([label, val]) => (
                <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
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
              <div className="col-span-12 bg-[#2a465a] rounded-2xl px-4 py-3 flex justify-between items-center">
                <span className="text-white text-sm font-semibold">Amount to Pay</span>
                <span className="text-white text-xl font-black">₹{payAmount.toLocaleString()}</span>
              </div>

              {errors.general && <div className="col-span-12 text-xs text-rose-500 font-semibold">{errors.general}</div>}

              <Button text="Pay Now →" variant="primary" size={8} onClick={pay} />
              <Button text="Reset" variant="secondary" size={4} onClick={reset} />
            </Grid>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && result && (
        <div className={`rounded-2xl p-8 text-center border ${result.success ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
          <div className={`text-5xl mb-4`}>{result.success ? "✅" : "❌"}</div>
          <h3 className={`text-xl font-black mb-2 ${result.success ? "text-emerald-700" : "text-rose-700"}`}>
            {result.success ? "Payment Successful!" : "Payment Failed"}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            {result.success
              ? `₹${result.amount.toLocaleString()} (${result.type}) received from ${result.client}.`
              : `Payment of ₹${result.amount.toLocaleString()} could not be processed. Please try again.`}
          </p>
          {result.success && (
            <p className="text-xs font-bold text-slate-400 mb-6">Transaction ID: {result.txnId}</p>
          )}
          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="bg-[#2a465a] text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-[#1e3a52] transition">
              New Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}