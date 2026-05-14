// ── Finance Dashboard Data ────────────────────────────────────────────────────
// Plain JS data file — no JSX

// financeKpiData — array of KPI card objects
export const financeKpiData = [
  { title: "Total Revenue",      value: "₹48.5L",  sub: "+12% vs last month" },
  { title: "Today Revenue",      value: "₹1.2L",   sub: "As of today" },
  { title: "Pending Payments",   value: "90",       sub: "Awaiting clearance" },
  { title: "Failed Payments",    value: "18",       sub: "Needs attention" },
  { title: "Total Expenses",     value: "₹11.85L",  sub: "This month" },
  { title: "Net Profit",         value: "₹36.65L",  sub: "Revenue - Expenses" },
  { title: "Total Invoices",     value: "216",      sub: "All time" },
  { title: "Work Orders Signed", value: "84",       sub: "Active contracts" },
  { title: "Paid Invoices",      value: "148",      sub: "Fully settled" },
  { title: "Pending Invoices",   value: "52",       sub: "Awaiting payment" },
  { title: "Partial Payments",   value: "32",       sub: "Partially received" },
  { title: "Outstanding Amount", value: "₹8.4L",    sub: "Pending collection" },
];

// revenueExpenseData — monthly Revenue, Expense, Profit
export const revenueExpenseData = [
  { name: "Jan", revenue: 45, expense: 20, profit: 25 },
  { name: "Feb", revenue: 42, expense: 19, profit: 23 },
  { name: "Mar", revenue: 61, expense: 24, profit: 37 },
  { name: "Apr", revenue: 57, expense: 22, profit: 35 },
  { name: "May", revenue: 69, expense: 26, profit: 43 },
  { name: "Jun", revenue: 73, expense: 28, profit: 45 },
  { name: "Jul", revenue: 65, expense: 25, profit: 40 },
  { name: "Aug", revenue: 78, expense: 30, profit: 48 },
  { name: "Sep", revenue: 71, expense: 27, profit: 44 },
  { name: "Oct", revenue: 83, expense: 32, profit: 51 },
  { name: "Nov", revenue: 76, expense: 29, profit: 47 },
  { name: "Dec", revenue: 90, expense: 35, profit: 55 },
];

// paymentStatusData — for doughnut chart
export const paymentStatusData = [
  { name: "Successful Payments", value: 320 },
  { name: "Pending Payments",    value: 90  },
  { name: "Failed Payments",     value: 18  },
  { name: "Partial Payments",    value: 32  },
];

// expenseCategoryData — for pie chart
export const expenseCategoryData = [
  { name: "Salary",         value: 42 },
  { name: "Marketing",      value: 18 },
  { name: "Infrastructure", value: 14 },
  { name: "Software",       value: 10 },
  { name: "Operations",     value: 11 },
  { name: "Travel",         value: 5  },
];

// monthlyRevenueTargetData — for column chart
export const monthlyRevenueTargetData = [
  { name: "Jan", revenue: 45, target: 50 },
  { name: "Feb", revenue: 42, target: 48 },
  { name: "Mar", revenue: 61, target: 55 },
  { name: "Apr", revenue: 57, target: 60 },
  { name: "May", revenue: 69, target: 65 },
  { name: "Jun", revenue: 73, target: 70 },
  { name: "Jul", revenue: 65, target: 72 },
  { name: "Aug", revenue: 78, target: 75 },
  { name: "Sep", revenue: 71, target: 78 },
  { name: "Oct", revenue: 83, target: 80 },
  { name: "Nov", revenue: 76, target: 82 },
  { name: "Dec", revenue: 90, target: 88 },
];

// recentPaymentsData
export const recentPaymentsData = [
  { id: "PAY-1041", client: "Arjun Mehta",        invoiceId: "INV-2025-018", amount: "₹45,000",   paymentType: "Full",    method: "UPI",         status: "Successful", date: "2026-05-10" },
  { id: "PAY-1042", client: "Priya Sharma",        invoiceId: "INV-2025-019", amount: "₹82,500",   paymentType: "Partial", method: "Net Banking", status: "Pending",    date: "2026-05-11" },
  { id: "PAY-1043", client: "Rohan Gupta",         invoiceId: "INV-2025-020", amount: "₹30,000",   paymentType: "Full",    method: "Card",        status: "Successful", date: "2026-05-12" },
  { id: "PAY-1044", client: "Sneha Patil",         invoiceId: "INV-2025-021", amount: "₹60,000",   paymentType: "Advance", method: "UPI",         status: "Failed",     date: "2026-05-12" },
  { id: "PAY-1045", client: "Kavya Nair",          invoiceId: "INV-2025-022", amount: "₹1,20,000", paymentType: "Full",    method: "Net Banking", status: "Successful", date: "2026-05-13" },
  { id: "PAY-1046", client: "TechNova Pvt Ltd",    invoiceId: "INV-2025-023", amount: "₹2,50,000", paymentType: "Partial", method: "NEFT",        status: "Pending",    date: "2026-05-13" },
  { id: "PAY-1047", client: "Ravi Logistics",      invoiceId: "INV-2025-024", amount: "₹75,000",   paymentType: "Full",    method: "Cheque",      status: "Successful", date: "2026-05-14" },
  { id: "PAY-1048", client: "Meera Constructions", invoiceId: "INV-2025-025", amount: "₹1,80,000", paymentType: "Advance", method: "RTGS",        status: "Successful", date: "2026-05-14" },
];

// recentInvoicesData
export const recentInvoicesData = [
  { id: "INV-2025-018", client: "Arjun Mehta",        amount: "₹45,000",   gst: "₹8,100",   total: "₹53,100",   paymentType: "Full",        status: "Paid",    dueDate: "2026-05-15", date: "2026-05-10" },
  { id: "INV-2025-019", client: "Priya Sharma",        amount: "₹82,500",   gst: "₹14,850",  total: "₹97,350",   paymentType: "Partial",     status: "Pending", dueDate: "2026-05-18", date: "2026-05-11" },
  { id: "INV-2025-020", client: "Rohan Gupta",         amount: "₹30,000",   gst: "₹5,400",   total: "₹35,400",   paymentType: "Full",        status: "Paid",    dueDate: "2026-05-12", date: "2026-05-12" },
  { id: "INV-2025-021", client: "TechNova Pvt Ltd",    amount: "₹2,50,000", gst: "₹45,000",  total: "₹2,95,000", paymentType: "Installment", status: "Partial", dueDate: "2026-05-20", date: "2026-05-11" },
  { id: "INV-2025-022", client: "Kavya Nair",          amount: "₹1,20,000", gst: "₹21,600",  total: "₹1,41,600", paymentType: "Full",        status: "Paid",    dueDate: "2026-05-13", date: "2026-05-13" },
  { id: "INV-2025-023", client: "Ravi Logistics",      amount: "₹75,000",   gst: "₹13,500",  total: "₹88,500",   paymentType: "Partial",     status: "Unpaid",  dueDate: "2026-05-22", date: "2026-05-14" },
  { id: "INV-2025-024", client: "Meera Constructions", amount: "₹1,80,000", gst: "₹32,400",  total: "₹2,12,400", paymentType: "Installment", status: "Partial", dueDate: "2026-05-25", date: "2026-05-14" },
];

// pendingActionsData
export const pendingActionsData = [
  { title: "Pending Invoice Payments", count: 12, color: "#f59e0b" },
  { title: "Failed Transactions",      count: 5,  color: "#f43f5e" },
  { title: "Unsigned Work Orders",     count: 3,  color: "#8b5cf6" },
  { title: "Pending Approvals",        count: 7,  color: "#3b82f6" },
];

// recentActivitiesData
export const recentActivitiesData = [
  { id: "ACT-001", activity: "Invoice INV-2025-022 sent to Kavya Nair",         type: "Invoice",    user: "Finance Manager", date: "2026-05-14", status: "Completed" },
  { id: "ACT-002", activity: "Payment ₹45,000 received from Arjun Mehta",       type: "Payment",    user: "System",          date: "2026-05-13", status: "Completed" },
  { id: "ACT-003", activity: "Work Order WO-084 approved for TechNova Pvt Ltd", type: "Work Order", user: "Finance Manager", date: "2026-05-13", status: "Completed" },
  { id: "ACT-004", activity: "Expense ₹12,000 added under Marketing",           type: "Expense",    user: "Finance Manager", date: "2026-05-12", status: "Completed" },
  { id: "ACT-005", activity: "Payment PAY-1044 failed for Sneha Patil",         type: "Payment",    user: "System",          date: "2026-05-12", status: "Failed"    },
  { id: "ACT-006", activity: "Invoice INV-2025-021 partially paid by TechNova", type: "Invoice",    user: "System",          date: "2026-05-11", status: "Partial"   },
  { id: "ACT-007", activity: "New deal signed with Meera Constructions",        type: "Deal",       user: "Finance Manager", date: "2026-05-11", status: "Completed" },
  { id: "ACT-008", activity: "Salary expense ₹3.2L processed for May",          type: "Expense",    user: "Finance Manager", date: "2026-05-10", status: "Completed" },
];

// quickInsightsData
export const quickInsightsData = [
  { label: "Top Paying Client",        value: "TechNova Pvt Ltd", sub: "₹2,95,000 this month" },
  { label: "Highest Payment Today",    value: "₹1,80,000",        sub: "Meera Constructions"  },
  { label: "Most Used Payment Method", value: "UPI",              sub: "42% of transactions"  },
  { label: "Avg Invoice Amount",       value: "₹1,17,336",        sub: "Based on 7 invoices"  },
];
