/**
 * idMask.js — Production-level ID masking utility
 *
 * Converts internal MongoDB ObjectIds into short, human-friendly reference
 * codes for display purposes. The raw ID is NEVER shown to the user.
 *
 * Rules:
 *  - Input : 24-char hex ObjectId  → "LEA-A3F2"
 *  - Input : any string            → last 4 chars uppercased, prefixed by type
 *  - Input : null / undefined      → "—"
 *
 * Usage:
 *   import { maskId } from '@/utils/idMask';
 *   maskId(lead.id, 'LEA')   → "LEA-A3F2"
 *   maskId(team.id, 'TM')    → "TM-C91E"
 *   maskId(payment.id, 'PAY')→ "PAY-7B22"
 */

/**
 * Returns a short reference code derived from an ID.
 * @param {string|null|undefined} id   - Raw internal ID (MongoDB ObjectId string)
 * @param {string} [prefix='REF']      - Display prefix (e.g. 'LEA', 'TM', 'PAY')
 * @returns {string}                   - Masked reference string, e.g. "LEA-A3F2"
 */
export function maskId(id, prefix = 'REF') {
  if (!id) return '—';
  const str = String(id);
  // Take last 4 hex chars for brevity and uniqueness
  const suffix = str.slice(-4).toUpperCase();
  return `${prefix}-${suffix}`;
}

/**
 * Returns a short ticket/reference code for display in tables.
 * Alias for maskId with a common default prefix.
 */
export function refCode(id, prefix = 'REF') {
  return maskId(id, prefix);
}
