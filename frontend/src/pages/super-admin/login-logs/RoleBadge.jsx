import { ROLE_BADGE } from "./loginLogs.constants";

// ROLE BADGE  (small coloured pill shown inside the table cell)
export const RoleBadge = ({ role }) => (
  <span
    className={`inline-flex max-w-full items-center justify-center rounded-lg px-2.5 py-1 text-[12px] font-semibold leading-none ${ROLE_BADGE[role] ?? "bg-slate-100 text-slate-700"}`}
  >
    {role}
  </span>
);
