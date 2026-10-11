import type { Case } from './evidence'
import type { Complaint } from './complaint-workspace'

export type Audit = { id: string; at: string; action: string; detail: string }
export type Preferences = { density: 'comfortable' | 'compact'; motion: boolean; privacy: boolean }
export const defaultPreferences: Preferences = { density: 'comfortable', motion: true, privacy: true }

export function isAudit(value: unknown): value is Audit {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && typeof item.at === 'string' && Number.isFinite(Date.parse(item.at)) && typeof item.action === 'string' && typeof item.detail === 'string'
}
export function parseAudit(raw: string | null): Audit[] {
  try { const value: unknown = JSON.parse(raw || '[]'); return Array.isArray(value) ? value.filter(isAudit).slice(0, 100) : [] } catch { return [] }
}
export function parsePreferences(raw: string | null): Preferences {
  try {
    const value = JSON.parse(raw || '{}') as Partial<Preferences>
    return { density: value.density === 'compact' ? 'compact' : 'comfortable', motion: typeof value.motion === 'boolean' ? value.motion : true, privacy: typeof value.privacy === 'boolean' ? value.privacy : true }
  } catch { return defaultPreferences }
}
export function caseTimestamp(c: Case): number { const match = c.date.match(/(\d{1,2})\s([A-Z]{3})\s(\d{4})\s·\s(\d{2}):(\d{2})/); if (!match) return 0; const months: Record<string, number> = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 }; return Date.UTC(Number(match[3]), months[match[2]] ?? 0, Number(match[1]), Number(match[4]), Number(match[5])) }
export function complaintTimestamp(c: Complaint): number { const value = Date.parse(c.occurredAt); return Number.isFinite(value) ? value : 0 }
export function priorityFactors(c: Case) { const factors = { evidenceGap: c.coverage < 75 ? 40 : c.coverage < 90 ? 20 : 8, qaConcern: c.tests.filter(t => t.outcome === 'contradicts' || t.outcome === 'unavailable').length * 8, timeSensitivity: c.id === 'refused' ? 12 : c.id === 'confirmed' ? 8 : 5 }; return { ...factors, total: factors.evidenceGap + factors.qaConcern + factors.timeSensitivity } }
export function complaintPriority() { return { evidenceGap: 40, qaConcern: 0, timeSensitivity: 5, total: 45 } }
