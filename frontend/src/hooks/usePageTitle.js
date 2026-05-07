/**
 * usePageTitle — sets the browser tab title from the last URL segment.
 *
 * Examples:
 *   /sales-executive/leads        → "Leads | Graphura CRM"
 *   /finance/work-orders          → "Work Orders | Graphura CRM"
 *   /sales-manager/leads/follow-ups → "Follow Ups | Graphura CRM"
 *   /admin  (root, no segment)    → "Dashboard | Graphura CRM"
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const APP_NAME = "Graphura CRM";

function toTitle(segment) {
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function usePageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Get last non-empty segment
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];

    const page = last ? toTitle(last) : "Dashboard";
    document.title = `${page} | ${APP_NAME}`;
  }, [pathname]);
}
