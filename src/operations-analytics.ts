import type { Complaint } from './complaint-workspace'
import { complaintTimestamp } from './console-helpers'
import type { Audit } from './console-helpers'
import type { ComplaintWorkflow, DemoRecord, DemoStatus } from './demo-workspace'

export type AnalyticsRecord = {
  id: string
  title: string
  kind: string
  owner: string
  status: DemoStatus
  completeness: number | null
  timestamp: number
  source: 'DEMO / SYNTHETIC' | 'LOCAL COMPLAINT'
}

export type AnalyticsBucket = { label: string; count: number }
export type OperationsAnalytics = {
  asOf: string | null
  totalRecords: number
  demoRecords: number
  complaintRecords: number
  queueAging: AnalyticsBucket[]
  statusDistribution: AnalyticsBucket[]
  evidenceBands: AnalyticsBucket[]
  ownerWorkload: AnalyticsBucket[]
  slaRisk: AnalyticsBucket[]
  auditEvents: number
  recentAudit: Array<{ action: string; detail: string; at: string }>
  records: AnalyticsRecord[]
}

const statuses: DemoStatus[] = ['Queued', 'In review', 'Blocked', 'Ready for report']
const finiteTimestamp = (value: number) => Number.isFinite(value) && value > 0
function demoTimestamp(value: string): number {
  const match = value.match(/^(\d{1,2})\s([A-Z][a-z]{2})\s(\d{4})\s·\s(\d{2}):(\d{2})$/)
  if (!match) return 0
  const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
  if (months[match[2]] === undefined) return 0
  const timestamp = Date.UTC(Number(match[3]), months[match[2]], Number(match[1]), Number(match[4]), Number(match[5]))
  const parsed = new Date(timestamp)
  return parsed.getUTCFullYear() === Number(match[3]) && parsed.getUTCMonth() === months[match[2]] && parsed.getUTCDate() === Number(match[1]) && parsed.getUTCHours() === Number(match[4]) && parsed.getUTCMinutes() === Number(match[5]) ? timestamp : 0
}

function complaintRecord(complaint: Complaint, workflows: Record<string, ComplaintWorkflow>): AnalyticsRecord {
  const workflow = workflows[complaint.id]
  return {
    id: complaint.id,
    title: complaint.incidentType,
    kind: 'Pending complaint',
    owner: workflow?.owner || 'Intake coordinator',
    status: workflow?.status || 'Queued',
    completeness: null,
    timestamp: complaintTimestamp(complaint),
    source: 'LOCAL COMPLAINT',
  }
}

export function deriveOperationsAnalytics(
  demos: DemoRecord[],
  complaints: Complaint[],
  workflows: Record<string, ComplaintWorkflow>,
  audits: Audit[],
): OperationsAnalytics {
  const records: AnalyticsRecord[] = [
    ...demos.map(record => ({
      id: record.id, title: record.title, kind: record.kind, owner: record.owner, status: record.status,
      completeness: Math.max(0, Math.min(100, record.completeness)), timestamp: demoTimestamp(record.timestamp), source: 'DEMO / SYNTHETIC' as const,
    })),
    ...complaints.map(complaint => complaintRecord(complaint, workflows)),
  ].filter(record => finiteTimestamp(record.timestamp))

  const newest = records.reduce((max, record) => Math.max(max, record.timestamp), 0)
  const ageBucket = (record: AnalyticsRecord): string => {
    const hours = Math.max(0, newest - record.timestamp) / 3_600_000
    return hours < 24 ? 'Under 24h' : hours < 72 ? '1–3 days' : hours < 168 ? '3–7 days' : '7+ days'
  }
  const count = (labels: string[], valueFor: (record: AnalyticsRecord) => string): AnalyticsBucket[] => labels.map(label => ({ label, count: records.filter(record => valueFor(record) === label).length }))
  const riskFor = (record: AnalyticsRecord): string => {
    const hours = Math.max(0, newest - record.timestamp) / 3_600_000
    if (record.status === 'Blocked' || hours >= 72) return 'High risk'
    if (record.status === 'Queued' || hours >= 24) return 'Watch'
    return 'On track'
  }

  const owners = [...new Set(records.map(record => record.owner))].sort((a, b) => a.localeCompare(b))
  const auditItems = audits.filter(item => finiteTimestamp(Date.parse(item.at))).sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
  return {
    asOf: newest ? new Date(newest).toISOString() : null,
    totalRecords: records.length,
    demoRecords: records.filter(record => record.source === 'DEMO / SYNTHETIC').length,
    complaintRecords: records.filter(record => record.source === 'LOCAL COMPLAINT').length,
    queueAging: count(['Under 24h', '1–3 days', '3–7 days', '7+ days'], ageBucket),
    statusDistribution: count(statuses, record => record.status),
    evidenceBands: [
      { label: 'Pending evidence', count: records.filter(record => record.completeness === null).length },
      { label: '0–49%', count: records.filter(record => record.completeness !== null && record.completeness < 50).length },
      { label: '50–79%', count: records.filter(record => record.completeness !== null && record.completeness >= 50 && record.completeness < 80).length },
      { label: '80–100%', count: records.filter(record => record.completeness !== null && record.completeness >= 80).length },
    ],
    ownerWorkload: owners.map(owner => ({ label: owner, count: records.filter(record => record.owner === owner).length })),
    slaRisk: count(['High risk', 'Watch', 'On track'], riskFor),
    auditEvents: auditItems.length,
    recentAudit: auditItems.slice(0, 8).map(item => ({ action: item.action, detail: item.detail, at: item.at })),
    records: records.sort((a, b) => b.timestamp - a.timestamp || a.id.localeCompare(b.id)),
  }
}
