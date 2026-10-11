import { canonical, claimsFor, seal, sensitivity, type Case, type CaseId, type Outcome } from './evidence'

export const RUN_HISTORY_KEY = 'pramaan.case-runs.v1'
export const RUN_STAGES = ['Intake', 'QA gate', 'Falsification', 'Cross-examination', 'Seal'] as const
export type RunStageName = typeof RUN_STAGES[number]

export type OutcomeCounts = Record<Outcome, number>
export type StageOutput = { stage: RunStageName; output: string[] }
export type IntegrityResult = {
  algorithm: string
  root: string
  verified: boolean
  changed: string[]
  artifacts: Array<{ id: string; hash: string }>
}

export type EvidencePacket = {
  schemaVersion: 1
  recordType: 'synthetic-evidence-packet'
  dataBoundary: 'DEMO / SYNTHETIC · local fixture only'
  runId: string
  generatedAt: string
  inputs: {
    fixtureVersion: string
    caseId: CaseId
    caseNumber: string
    title: string
    location: string
    window: string
    source: string
    hypothesis: string
    baseline: number
    peak: number
    coverage: number
    sensors: Case['sensors']
  }
  stageOutputs: StageOutput[]
  testOutcomes: Case['tests']
  gradeBoundary: {
    grade: string
    label: string
    action: string
    rule: string
    ceiling: string
  }
  citations: Array<{ claimId: string; type: string; text: string; evidenceIds: string[]; gradeCeiling: string }>
  integrity: IntegrityResult
  limitations: string[]
}

export type CaseRunRecord = {
  runId: string
  caseId: CaseId
  caseTitle: string
  grade: string
  completedAt: string
  runCount: number
  packet: EvidencePacket
}

export type CaseComparison = {
  left: Case
  right: Case
  leftCounts: OutcomeCounts
  rightCounts: OutcomeCounts
  completenessDifference: number
  gradeChanged: boolean
}

const emptyCounts = (): OutcomeCounts => ({ supports: 0, contradicts: 0, inconclusive: 0, unavailable: 0 })

export function outcomeCounts(c: Case): OutcomeCounts {
  return c.tests.reduce<OutcomeCounts>((counts, test) => {
    counts[test.outcome] += 1
    return counts
  }, emptyCounts())
}

export function compareCases(left: Case, right: Case): CaseComparison {
  return {
    left,
    right,
    leftCounts: outcomeCounts(left),
    rightCounts: outcomeCounts(right),
    completenessDifference: right.coverage - left.coverage,
    gradeChanged: left.grade !== right.grade,
  }
}

function stableHash(value: string): string {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0').toUpperCase()
}

export function runIdForCase(c: Case): string {
  const identity = canonical({ fixtureVersion: 'synthetic-v1', caseId: c.id, stages: RUN_STAGES })
  return `PRM-${c.number}-RUN-${stableHash(identity)}`
}

function qaLines(c: Case): string[] {
  const eligible = c.sensors.filter(sensor => sensor.status.startsWith('Valid')).length
  const invalid = c.sensors.filter(sensor => !sensor.status.startsWith('Valid'))
  return [
    `${eligible}/${c.sensors.length} fixture monitors are labelled eligible for comparison.`,
    `Coverage gate: ${c.coverage}% eligible coverage in the recorded episode window.`,
    invalid.length ? `Excluded from attribution: ${invalid.map(sensor => `${sensor.id} (${sensor.status})`).join('; ')}.` : 'No fixture monitor is excluded by its status label.',
    c.coverage >= 80 && invalid.length === 0 ? 'QA gate output: pass for the synthetic falsification battery.' : 'QA gate output: hold attribution; the fixture does not satisfy the full QA gate.',
  ]
}

export function stageOutput(c: Case, stage: RunStageName): string[] {
  if (stage === 'Intake') {
    return [
      `Loaded fixture ${c.number} · ${c.title} (${c.id}).`,
      `Episode window ${c.window}; baseline ${c.baseline} µg/m³; displayed peak ${c.peak} µg/m³.`,
      `Named hypothesis: ${c.hypothesis}`,
      'Input boundary: existing browser fixture only; no complaint, live feed, or backend record was added.',
    ]
  }
  if (stage === 'QA gate') return qaLines(c)
  if (stage === 'Falsification') {
    const counts = outcomeCounts(c)
    return [
      `Evaluated ${c.tests.length} predeclared fixture tests against the named hypothesis.`,
      `Supports ${counts.supports} · contradicts ${counts.contradicts} · inconclusive ${counts.inconclusive} · unavailable ${counts.unavailable}.`,
      'Every test detail is copied from the existing fixture; no new observation is inferred.',
    ]
  }
  if (stage === 'Cross-examination') {
    const baseline = sensitivity(c, 0, 0)
    return [
      `Baseline perturbation: wind shift 0° and transport shift 0 minutes.`,
      `Illustrative stability ${baseline.stability}/100; perturbed grade ${baseline.grade}.`,
      baseline.explanation,
      'This is a deterministic sensitivity readout, not a probability and not a new evidence result.',
    ]
  }
  return [
    'Seal stage prepares observations.json, assessment.json, and config.json from this fixture.',
    'Browser SHA-256 verification reports byte agreement with the local sealed snapshot.',
    'Integrity confirms unchanged bytes only; it does not prove sensor truth, calibration, causation, or legal status.',
  ]
}

export function buildEvidencePacket(c: Case, sealed: Awaited<ReturnType<typeof seal>>, verification: { ok: boolean; changed: string[] }, generatedAt = new Date().toISOString()): EvidencePacket {
  const claims = claimsFor(c)
  return {
    schemaVersion: 1,
    recordType: 'synthetic-evidence-packet',
    dataBoundary: 'DEMO / SYNTHETIC · local fixture only',
    runId: runIdForCase(c),
    generatedAt,
    inputs: {
      fixtureVersion: 'synthetic-v1',
      caseId: c.id,
      caseNumber: c.number,
      title: c.title,
      location: c.location,
      window: c.window,
      source: c.source,
      hypothesis: c.hypothesis,
      baseline: c.baseline,
      peak: c.peak,
      coverage: c.coverage,
      sensors: c.sensors,
    },
    stageOutputs: RUN_STAGES.map(stage => ({ stage, output: stageOutput(c, stage) })),
    testOutcomes: c.tests,
    gradeBoundary: {
      grade: c.grade,
      label: c.gradeName,
      action: c.action,
      rule: 'Synthetic fixture grade is an illustrative action label bounded by the recorded tests and QA gate.',
      ceiling: 'Not a guilt probability, regulatory finding, legal judgment, causal finding, or field instruction.',
    },
    citations: claims.map(claim => ({ claimId: claim.id, type: claim.type, text: claim.text, evidenceIds: claim.citations, gradeCeiling: claim.gradeCeiling })),
    integrity: {
      algorithm: 'SHA-256 over canonical fixture artifacts and sorted manifest leaves',
      root: sealed.root,
      verified: verification.ok,
      changed: verification.changed,
      artifacts: sealed.leaves,
    },
    limitations: [
      'All inputs are local synthetic fixtures; no live sensor, weather, authority, or backend data is included.',
      'The grade and indices are illustrative heuristics and are not calibrated field probabilities.',
      'The named source association is incident-specific and does not establish causation, violation, or health impact.',
      'A local browser seal detects changed bytes after sealing but does not prove source truth or custody before sealing.',
      'Complaints remain pending evidence and are deliberately excluded from this packet and simulator.',
    ],
  }
}

function isPacket(value: unknown): value is EvidencePacket {
  if (!value || typeof value !== 'object') return false
  const packet = value as Partial<EvidencePacket>
  return packet.recordType === 'synthetic-evidence-packet' && typeof packet.runId === 'string' && typeof packet.generatedAt === 'string' && Boolean(packet.inputs && typeof packet.inputs === 'object') && Array.isArray(packet.stageOutputs) && Array.isArray(packet.testOutcomes) && Boolean(packet.gradeBoundary && typeof packet.gradeBoundary === 'object') && Array.isArray(packet.citations) && Boolean(packet.integrity && typeof packet.integrity === 'object') && Array.isArray(packet.limitations)
}

function isRunRecord(value: unknown): value is CaseRunRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as Partial<CaseRunRecord>
  return typeof record.runId === 'string' && typeof record.caseId === 'string' && typeof record.caseTitle === 'string' && typeof record.grade === 'string' && typeof record.completedAt === 'string' && typeof record.runCount === 'number' && isPacket(record.packet)
}

export function readRunHistory(): CaseRunRecord[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RUN_HISTORY_KEY) || '[]') as unknown
    return Array.isArray(raw) ? raw.filter(isRunRecord).slice(0, 12) : []
  } catch {
    return []
  }
}

export function persistRun(packet: EvidencePacket, completedAt = new Date().toISOString()): CaseRunRecord[] {
  const current = readRunHistory()
  const existing = current.find(record => record.runId === packet.runId)
  const nextRecord: CaseRunRecord = {
    runId: packet.runId,
    caseId: packet.inputs.caseId,
    caseTitle: packet.inputs.title,
    grade: packet.gradeBoundary.grade,
    completedAt,
    runCount: (existing?.runCount || 0) + 1,
    packet,
  }
  const next = [nextRecord, ...current.filter(record => record.runId !== packet.runId)].slice(0, 12)
  try { localStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(next)) } catch { /* best effort local history */ }
  return next
}
