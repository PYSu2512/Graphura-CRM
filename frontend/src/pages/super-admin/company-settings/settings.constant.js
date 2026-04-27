export const DEFAULT_SETTINGS = {
  branding: {
    company_name: "",
    email: "",
    phone: "",
    website_url: "",
    address: "",
    logo_url: "",
  },
  limits: {
    max_users: 40,
    exec_lead_limit: 250,
    tl_lead_limit: 1500,
    total_lead_capacity: 6000,
  },
  rbac: {
    exec_can_restore_dump: false,
    tl_can_reassign_leads: true,
    tl_can_approve_leaves: true,
    tl_can_view_payment_alerts: true,
    finance_can_delete_expense: true,
    mgmt_tl_can_reassign_project: true,
    sales_mgr_auto_distribution: false,
    underperformer_detection: true,
  },
};

export const RBAC_LABELS = [
  {
    key: "exec_can_restore_dump",
    label: "Sales Exec — restore dump leads",
    note: "Brief: Exec cannot restore. Locked off.",
    locked: true,
  },
  {
    key: "tl_can_reassign_leads",
    label: "Sales TL — reassign leads between execs",
    note: "",
  },
  {
    key: "tl_can_approve_leaves",
    label: "Sales TL — approve team leaves",
    note: "",
  },
  {
    key: "tl_can_view_payment_alerts",
    label: "Sales TL — view payment alerts",
    note: "",
  },
  {
    key: "finance_can_delete_expense",
    label: "Finance Mgr — delete expenses",
    note: "",
  },
  {
    key: "mgmt_tl_can_reassign_project",
    label: "Mgmt TL — reassign employees on project",
    note: "",
  },
  {
    key: "sales_mgr_auto_distribution",
    label: "Sales Mgr — auto lead distribution (round-robin)",
    note: "Pro feature",
    pro: true,
  },
  {
    key: "underperformer_detection",
    label: "All Mgrs — underperformer detection",
    note: "Pro feature",
    pro: true,
  },
];

export const LOCKED_RBAC_KEYS = ["exec_can_restore_dump"];
