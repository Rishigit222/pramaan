export type DemoStatus = 'Queued' | 'In review' | 'Blocked' | 'Ready for report'
export type ComplaintWorkflow = { owner: string; status: DemoStatus; updatedAt: string }
export type DemoRecord = {
  id: string; kind: string; title: string; region: string; owner: string; stage: string;
  status: DemoStatus; sla: string; completeness: number; timestamp: string; nextAction: string; note: string
}

export const DEMO_WORKSPACE_KEY = 'pramaan.demo-workspace.v1'
export const COMPLAINT_WORKFLOW_KEY = 'pramaan.complaint-workflow.v1'
export const defaultComplaintWorkflow: ComplaintWorkflow = { owner: 'Intake coordinator', status: 'Queued', updatedAt: '' }

export const seededDemoRecords: DemoRecord[] = [
  { id: 'DEMO-CASE-014', kind: 'Case', title: 'North gate odour episode', region: 'Ward 12 · north corridor', owner: 'Duty investigator', stage: 'Triage', status: 'In review', sla: '6h remaining', completeness: 82, timestamp: '11 Oct 2026 · 09:18', nextAction: 'Review comparator coverage', note: 'Synthetic case packet with two independent monitors and a visible alternative explanation.' },
  { id: 'DEMO-CMP-022', kind: 'Pending complaint', title: 'Dust reported near market road', region: 'Market road · east sector', owner: 'Intake coordinator', stage: 'Evidence requested', status: 'Queued', sla: '18h remaining', completeness: 34, timestamp: '11 Oct 2026 · 08:42', nextAction: 'Request calibrated monitor', note: 'Synthetic intake record. No source assessment or measurement is attached.' },
  { id: 'DEMO-REG-003', kind: 'Regional event', title: 'Citywide haze pattern review', region: 'Three-zone reference set', owner: 'Regional review lead', stage: 'Comparative review', status: 'Ready for report', sla: '1d 4h remaining', completeness: 91, timestamp: '10 Oct 2026 · 17:06', nextAction: 'Prepare regional summary', note: 'Synthetic regional pattern where references rise together; not a live event signal.' },
  { id: 'DEMO-QA-008', kind: 'QA fault', title: 'Monitor clock drift exception', region: 'Station N-04 · synthetic', owner: 'QA steward', stage: 'Quality hold', status: 'Blocked', sla: '3h remaining', completeness: 49, timestamp: '10 Oct 2026 · 15:21', nextAction: 'Confirm calibration history', note: 'Synthetic QA fault. Any associated reading remains excluded from attribution.' },
  { id: 'DEMO-SNS-019', kind: 'Sensor maintenance', title: 'Reference monitor service window', region: 'South reference node', owner: 'Sensor steward', stage: 'Maintenance', status: 'Queued', sla: '2d remaining', completeness: 67, timestamp: '10 Oct 2026 · 12:10', nextAction: 'Log field service checklist', note: 'Synthetic maintenance work item with no dispatch or live device state.' },
  { id: 'DEMO-RPT-031', kind: 'Report-ready', title: 'Incident packet completeness check', region: 'Ward 4 · bounded fixture', owner: 'Review editor', stage: 'Report assembly', status: 'Ready for report', sla: '8h remaining', completeness: 96, timestamp: '09 Oct 2026 · 16:44', nextAction: 'Verify citations and export', note: 'Synthetic packet staged for a local report preview only.' },
  { id: 'DEMO-CASE-027', kind: 'Case', title: 'Single-sensor anomaly follow-up', region: 'Industrial edge · fixture', owner: 'Duty investigator', stage: 'Cross-examination', status: 'In review', sla: '11h remaining', completeness: 73, timestamp: '09 Oct 2026 · 11:32', nextAction: 'Inspect timing sensitivity', note: 'Synthetic weak-QA case. Review actions cannot change the scientific grade.' },
  { id: 'DEMO-CMP-029', kind: 'Pending complaint', title: 'Smoke report from school perimeter', region: 'School perimeter · west sector', owner: 'Intake coordinator', stage: 'Triage', status: 'Queued', sla: '22h remaining', completeness: 28, timestamp: '08 Oct 2026 · 14:09', nextAction: 'Collect time-window details', note: 'Synthetic complaint shell. It is deliberately pending evidence.' },
]

export function readDemoRecords(): DemoRecord[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(DEMO_WORKSPACE_KEY) || 'null')
    if (!Array.isArray(parsed)) return seededDemoRecords
    const valid = parsed.filter((record): record is DemoRecord => Boolean(record && typeof record === 'object' && typeof record.id === 'string' && record.id.startsWith('DEMO-') && typeof record.title === 'string' && typeof record.status === 'string' && typeof record.completeness === 'number'))
    return valid
  } catch {
    return seededDemoRecords
  }
}
export function saveDemoRecords(records: DemoRecord[]) { try { localStorage.setItem(DEMO_WORKSPACE_KEY, JSON.stringify(records)) } catch { /* best effort */ } }

export function readComplaintWorkflows(): Record<string, ComplaintWorkflow> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(COMPLAINT_WORKFLOW_KEY) || '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => {
      if (!value || typeof value !== 'object') return false
      const item = value as Record<string, unknown>
      return typeof item.owner === 'string' && ['Queued', 'In review', 'Blocked', 'Ready for report'].includes(item.status as string) && typeof item.updatedAt === 'string'
    })) as Record<string, ComplaintWorkflow>
  } catch { return {} }
}

export function saveComplaintWorkflows(workflows: Record<string, ComplaintWorkflow>) {
  try { localStorage.setItem(COMPLAINT_WORKFLOW_KEY, JSON.stringify(workflows)) } catch { /* best effort */ }
}
