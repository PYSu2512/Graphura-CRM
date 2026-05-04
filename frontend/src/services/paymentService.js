// paymentService.js — API layer for Payments module
// Replace delay() + MOCK_PAYMENTS with real fetch() calls when backend is ready.

let MOCK_PAYMENTS = [
  { id: "TXN-001", clientName: "Ravi Sharma",    leadId: "L001", amount: 50000,  mode: "UPI",          status: "Success", date: "2026-05-02T10:30:00", invoiceId: "INV-2001", invoiceUrl: "/invoices/INV-2001.pdf", assignedTo: "John Doe", notes: "Full payment received for premium package." },
  { id: "TXN-002", clientName: "Priya Singh",    leadId: "L002", amount: 120000, mode: "Bank Transfer", status: "Pending", date: "2026-05-03T14:00:00", invoiceId: "INV-2002", invoiceUrl: "/invoices/INV-2002.pdf", assignedTo: "John Doe", notes: "Awaiting bank confirmation." },
  { id: "TXN-003", clientName: "Amit Patel",     leadId: "L003", amount: 30000,  mode: "Card",          status: "Failed",  date: "2026-05-03T09:15:00", invoiceId: "INV-2003", invoiceUrl: "/invoices/INV-2003.pdf", assignedTo: "John Doe", notes: "Card declined. Retry requested." },
  { id: "TXN-004", clientName: "Neha Gupta",     leadId: "L004", amount: 85000,  mode: "Cash",          status: "Success", date: "2026-05-04T11:45:00", invoiceId: "INV-2004", invoiceUrl: "/invoices/INV-2004.pdf", assignedTo: "John Doe", notes: "Cash collected at office." },
  { id: "TXN-005", clientName: "Vikram Malhotra",leadId: "L005", amount: 250000, mode: "UPI",           status: "Success", date: "2026-05-04T16:20:00", invoiceId: "INV-2005", invoiceUrl: "/invoices/INV-2005.pdf", assignedTo: "John Doe", notes: "Enterprise deal closed." },
  { id: "TXN-006", clientName: "Sunita Rao",     leadId: "L006", amount: 45000,  mode: "Card",          status: "Pending", date: "2026-05-05T08:00:00", invoiceId: "INV-2006", invoiceUrl: "/invoices/INV-2006.pdf", assignedTo: "John Doe", notes: "Payment link sent." },
  { id: "TXN-007", clientName: "Deepak Joshi",   leadId: "L007", amount: 60000,  mode: "Bank Transfer", status: "Failed",  date: "2026-05-05T13:30:00", invoiceId: "INV-2007", invoiceUrl: "/invoices/INV-2007.pdf", assignedTo: "John Doe", notes: "Insufficient funds." },
  { id: "TXN-008", clientName: "Meera Nair",     leadId: "L008", amount: 95000,  mode: "UPI",           status: "Success", date: "2026-05-06T10:00:00", invoiceId: "INV-2008", invoiceUrl: "/invoices/INV-2008.pdf", assignedTo: "John Doe", notes: "Quarterly subscription." },
];

const REVENUE_TREND = [
  { name: "Apr 28", revenue: 45000 },
  { name: "Apr 29", revenue: 62000 },
  { name: "Apr 30", revenue: 38000 },
  { name: "May 01", revenue: 91000 },
  { name: "May 02", revenue: 50000 },
  { name: "May 03", revenue: 150000 },
  { name: "May 04", revenue: 335000 },
  { name: "May 05", revenue: 105000 },
  { name: "May 06", revenue: 95000 },
];

const delay = (ms = 350) => new Promise(r => setTimeout(r, ms));

export const paymentService = {
  async getPayments(filters = {}) {
    await delay();
    let data = [...MOCK_PAYMENTS];
    if (filters.status) data = data.filter(p => p.status === filters.status);
    if (filters.mode)   data = data.filter(p => p.mode === filters.mode);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(p =>
        p.clientName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
      );
    }
    return { data, success: true };
  },

  async getPaymentById(id) {
    await delay(150);
    const payment = MOCK_PAYMENTS.find(p => p.id === id);
    return { data: payment || null, success: !!payment };
  },

  async retryPayment(id) {
    await delay(700);
    // Simulate: mark as Success after retry
    MOCK_PAYMENTS = MOCK_PAYMENTS.map(p =>
      p.id === id ? { ...p, status: "Success" } : p
    );
    return { success: true, message: `Retry successful for ${id}` };
  },

  async updateLeadStatus(leadId, status) {
    await delay(200);
    // Replace with: PUT /leads/:leadId { status }
    console.log(`[Smart] Lead ${leadId} status updated to "${status}"`);
    return { success: true };
  },

  async sendReminder(clientId, clientName) {
    await delay(400);
    // Replace with: POST /reminders { clientId }
    console.log(`[Reminder] Sent to ${clientName} (${clientId})`);
    return { success: true };
  },

  async getRevenueTrend() {
    await delay(250);
    return { data: REVENUE_TREND, success: true };
  },

  async getKPIs() {
    await delay(200);
    const payments = MOCK_PAYMENTS;
    const today = new Date().toISOString().slice(0, 10);
    return {
      data: {
        totalRevenue:  payments.filter(p => p.status === "Success").reduce((s, p) => s + p.amount, 0),
        todayRevenue:  payments.filter(p => p.status === "Success" && p.date.startsWith(today)).reduce((s, p) => s + p.amount, 0),
        successCount:  payments.filter(p => p.status === "Success").length,
        failedCount:   payments.filter(p => p.status === "Failed").length,
        pendingAmount: payments.filter(p => p.status === "Pending").reduce((s, p) => s + p.amount, 0),
      },
      success: true,
    };
  },
};
