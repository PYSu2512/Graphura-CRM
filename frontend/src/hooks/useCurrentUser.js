/**
 * useCurrentUser
 * Reads the logged-in user from localStorage (set by authService on login).
 * Returns the user object or null if not logged in.
 *
 * Shape (from backend): { _id, name, email, role, department, ... }
 */
import { useMemo } from "react";

export function useCurrentUser() {
  return useMemo(() => {
    try {
      const raw = localStorage.getItem("user") || localStorage.getItem("admin");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
}
