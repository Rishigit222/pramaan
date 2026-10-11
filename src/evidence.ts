export type CaseId = 'confirmed' | 'refused' | 'regional'
export type Outcome = 'supports' | 'contradicts' | 'inconclusive' | 'unavailable'
export type Test = { id: string; name: string; outcome: Outcome; detail: string }
export type Sensor = { id: string; label: string; x: number; y: number; role: string; status: string; values: number[] }
export type Case = {
  id: CaseId; number: string; title: string; subtitle: string; location: string; date: string
  source: string; hypothesis: string; grade: string; gradeName: string; action: string
  summary: string; alternative: string; windFrom: number; baseline: number; peak: number
  coverage: number; detection: number; score: number; window: string; sensors: Sensor[]; tests: Test[]
}

const times = ['09:40', '09:45', '09:50', '09:55', '10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30', '10:35']
export { times }

export const cases: Case[] = [
  {
    id: 'confirmed', number: '01', title: 'Coherent local plume', subtitle: 'Candidate association',
    location: 'Eastbank industrial corridor', date: '18 JUN 2026 · 09:40–10:35 UTC', source: 'Candidate S1',
    hypothesis: 'Transport from candidate S1 is consistent with the observed PM2.5 episode.',
    grade: 'B', gradeName: 'Consistent association', action: 'Request independent operations records and maintain observation.',
    summary: 'Two independent downwind monitors rose while the upwind reference remained near baseline. Wind and lag are consistent with transport from the candidate, but causation is not established.',
    alternative: 'A local source outside the mapped corridor cannot be excluded.', windFrom: 248, baseline: 18, peak: 51,
    coverage: 94, detection: 91, score: 78, window: '10:00–10:20 UTC',
    sensors: [
      { id: 'D1', label: 'Downwind · near', x: 72, y: 46, role: 'downwind', status: 'Valid · CAL-04', values: [18, 19, 18, 20, 33, 44, 51, 47, 37, 25, 20, 19] },
      { id: 'D2', label: 'Downwind · far', x: 84, y: 37, role: 'downwind', status: 'Valid · CAL-04', values: [17, 18, 18, 19, 23, 32, 41, 46, 38, 28, 20, 18] },
      { id: 'U1', label: 'Upwind reference', x: 21, y: 67, role: 'upwind', status: 'Valid · CAL-03', values: [17, 18, 18, 17, 18, 19, 18, 19, 18, 18, 17, 18] }
    ],
    tests: [
      { id: 'T-01', name: 'Upwind / downwind contrast', outcome: 'supports', detail: 'D1 +33 µg/m³; U1 +1 µg/m³ against pre-event median.' },
      { id: 'T-02', name: 'Wind sector & transport lag', outcome: 'supports', detail: '248° from WSW; observed near-to-far ordering within 5–10 min.' },
      { id: 'T-03', name: 'Spatial coherence', outcome: 'supports', detail: 'D1 and D2 rise in sequence on independent instruments.' },
      { id: 'T-04', name: 'Regional background', outcome: 'supports', detail: 'Regional reference remains near its pre-event range.' },
      { id: 'T-05', name: 'Other local sources', outcome: 'inconclusive', detail: 'No verified operations log; other local activity is not ruled out.' },
      { id: 'T-06', name: 'Instrument validity', outcome: 'supports', detail: 'Calibration and clock checks pass in this synthetic fixture.' }
    ]
  },
  {
    id: 'refused', number: '02', title: 'Single-sensor anomaly', subtitle: 'Attribution refused',
    location: 'North quay monitoring zone', date: '19 JUN 2026 · 09:40–10:35 UTC', source: 'Candidate S2',
    hypothesis: 'A spike at D1 indicates emissions from candidate S2.',
    grade: 'U', gradeName: 'Unassessable', action: 'Inspect D1, restore calibration, and deploy an independent monitor at the computed location.',
    summary: 'A single extreme reading overlaps a clock and calibration fault. Nearby independent monitors do not corroborate it. The suspect reading is retained but excluded from source attribution.',
    alternative: 'Instrument fault is more plausible than a shared plume; the candidate remains unassessed.', windFrom: 238, baseline: 19, peak: 83,
    coverage: 58, detection: 22, score: 8, window: '10:00–10:20 UTC',
    sensors: [
      { id: 'D1', label: 'Suspect monitor', x: 72, y: 46, role: 'suspect', status: 'Invalid · clock +4m / calibration expired', values: [19, 18, 20, 19, 21, 83, 83, 83, 24, 19, 18, 19] },
      { id: 'D2', label: 'Independent peer', x: 84, y: 37, role: 'downwind', status: 'Valid · CAL-04', values: [18, 19, 18, 19, 20, 19, 19, 20, 19, 18, 19, 18] },
      { id: 'U1', label: 'Upwind reference', x: 21, y: 67, role: 'upwind', status: 'Valid · CAL-03', values: [18, 18, 19, 18, 19, 18, 18, 19, 18, 18, 18, 19] }
    ],
    tests: [
      { id: 'T-01', name: 'Upwind / downwind contrast', outcome: 'unavailable', detail: 'D1 is excluded from eligible comparison; D2 does not rise.' },
      { id: 'T-02', name: 'Wind sector & transport lag', outcome: 'inconclusive', detail: 'Wind is plausible but cannot validate an ineligible concentration reading.' },
      { id: 'T-03', name: 'Spatial coherence', outcome: 'contradicts', detail: 'Independent D2 stays near 19 µg/m³ while D1 is stuck at 83.' },
      { id: 'T-04', name: 'Regional background', outcome: 'inconclusive', detail: 'No regional change; source-specific inference still unavailable.' },
      { id: 'T-05', name: 'Other local sources', outcome: 'unavailable', detail: 'No verified activity records available for this window.' },
      { id: 'T-06', name: 'Instrument validity', outcome: 'contradicts', detail: 'D1 clock skew +4 min, expired calibration, and repeated plateau.' }
    ]
  },
  {
    id: 'regional', number: '03', title: 'Regional smoke front', subtitle: 'Local hypothesis contradicted',
    location: 'South basin reference network', date: '20 JUN 2026 · 09:40–10:35 UTC', source: 'Candidate S3',
    hypothesis: 'Candidate S3 explains the observed local PM2.5 rise.',
    grade: 'D', gradeName: 'Contradicted', action: 'Clear S3 from this episode assessment; investigate regional transport.',
    summary: 'The PM2.5 rise is observed, but upwind and regional monitors rise simultaneously with downwind sites. The candidate-specific plume hypothesis is contradicted by the broader pattern.',
    alternative: 'A regional smoke front better fits the simultaneous network-wide rise.', windFrom: 255, baseline: 21, peak: 48,
    coverage: 96, detection: 88, score: 11, window: '10:00–10:20 UTC',
    sensors: [
      { id: 'D1', label: 'Downwind · near', x: 72, y: 46, role: 'downwind', status: 'Valid · CAL-04', values: [21, 21, 22, 23, 31, 39, 46, 48, 42, 33, 26, 23] },
      { id: 'D2', label: 'Downwind · far', x: 84, y: 37, role: 'downwind', status: 'Valid · CAL-04', values: [20, 21, 22, 22, 30, 38, 45, 47, 42, 34, 27, 22] },
      { id: 'U1', label: 'Upwind reference', x: 21, y: 67, role: 'upwind', status: 'Valid · CAL-03', values: [20, 21, 21, 22, 31, 40, 46, 47, 42, 34, 26, 22] }
    ],
    tests: [
      { id: 'T-01', name: 'Upwind / downwind contrast', outcome: 'contradicts', detail: 'U1 rises +26 µg/m³ alongside D1; no local excess beyond uncertainty.' },
      { id: 'T-02', name: 'Wind sector & transport lag', outcome: 'inconclusive', detail: 'Candidate-facing wind alone is insufficient; sites respond simultaneously.' },
      { id: 'T-03', name: 'Spatial coherence', outcome: 'contradicts', detail: 'Simultaneous upwind and downwind response lacks expected lag.' },
      { id: 'T-04', name: 'Regional background', outcome: 'contradicts', detail: 'Regional reference shows a matching rise, supporting a broad smoke front.' },
      { id: 'T-05', name: 'Other local sources', outcome: 'supports', detail: 'Synthetic regional smoke advisory overlaps the episode.' },
      { id: 'T-06', name: 'Instrument validity', outcome: 'supports', detail: 'All three monitors pass QA; contradiction is based on eligible data.' }
    ]
  }
]

export function sensitivity(c: Case, windShift: number, timeShift: number) {
  const windPenalty = Math.max(0, Math.abs(windShift) - 10) * 1.25
  const timePenalty = Math.max(0, Math.abs(timeShift) - 5) * 2.2
  const stability = Math.max(0, Math.round(94 - windPenalty - timePenalty - (c.id === 'confirmed' ? 8 : c.id === 'refused' ? 35 : 12)))
  const robust = c.id === 'confirmed' && stability >= 70
  const grade = c.id === 'confirmed' ? (robust ? 'B' : 'C') : c.grade
  return { stability, grade, consistent: c.id === 'confirmed' ? robust : false,
    explanation: c.id === 'confirmed'
      ? robust ? 'Association remains consistent under this predeclared perturbation.' : 'Wind / lag alignment weakens; association is capped at episode-only grade C.'
      : c.id === 'refused' ? 'QA exclusion persists. Perturbation cannot rescue an invalid sensor.' : 'Regional simultaneity persists. The local hypothesis remains contradicted.' }
}

export function nextSensor(c: Case) {
  // Wind is meteorological FROM bearing; downwind is its opposite. Schematic source at 48,55.
  const bearing = (c.windFrom + 180) % 360
  const radians = bearing * Math.PI / 180
  return { x: Math.round(48 + Math.sin(radians) * 26), y: Math.round(55 - Math.cos(radians) * 26), bearing: Math.round(bearing) }
}

export type Claim = { id: string; text: string; citations: string[]; type: 'measurement' | 'association' | 'causation'; gradeCeiling: string }
export function claimsFor(c: Case): Claim[] {
  return [
    { id: 'C-01', type: 'measurement', gradeCeiling: 'U', text: `${c.source} case: D1 has a displayed peak of ${c.peak} µg/m³ during ${c.window}. ${c.id === 'refused' ? 'D1 is QA-invalid and excluded.' : 'This is an observation, not attribution.'}`, citations: ['D1', 'T-06'] },
    { id: 'C-02', type: 'association', gradeCeiling: c.grade, text: c.summary, citations: c.id === 'confirmed' ? ['T-01', 'T-02', 'T-03', 'T-05'] : c.id === 'refused' ? ['T-01', 'T-03', 'T-06'] : ['T-01', 'T-03', 'T-04'] }
  ]
}

export function checkClaims(c: Case, claims: Claim[]) {
  const validIds = new Set([...c.sensors.map(s => s.id), ...c.tests.map(t => t.id)])
  const errors: string[] = []
  for (const claim of claims) {
    if (!claim.citations.length || claim.citations.some(id => !validIds.has(id))) errors.push(`${claim.id}: unknown or missing evidence ID`)
    if (claim.type === 'causation' || /\b(caused|proved|guilty|violated|safe to breathe)\b/i.test(claim.text)) errors.push(`${claim.id}: unsupported causal, legal, or health claim`)
    if (claim.type === 'measurement' && !claim.text.includes(`${c.peak} µg/m³`)) errors.push(`${claim.id}: measurement does not match fixture`)
    if (claim.type === 'association' && !claim.citations.some(id => c.tests.some(t => t.id === id && ['contradicts', 'inconclusive', 'unavailable'].includes(t.outcome)))) errors.push(`${claim.id}: omits contrary or unresolved evidence`)
  }
  return errors
}

export const injectedClaim: Claim = { id: 'C-99', type: 'causation', gradeCeiling: 'A', text: 'Candidate S1 caused the pollution and violated the law.', citations: ['T-99'] }

export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value !== null && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`
  return JSON.stringify(value)
}

async function sha256(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
}

export async function seal(c: Case) {
  const artifacts = [
    { id: 'observations.json', body: canonical(c.sensors) },
    { id: 'assessment.json', body: canonical({ caseId: c.id, grade: c.grade, tests: c.tests, claims: claimsFor(c) }) },
    { id: 'config.json', body: canonical({ algorithm: 'pramaan-demo-1.0', fixture: 'synthetic-v1', baseline: 'pre-event median', unit: 'µg/m³' }) }
  ].sort((a, b) => a.id.localeCompare(b.id))
  const leaves = await Promise.all(artifacts.map(async a => ({ id: a.id, hash: await sha256(a.body) })))
  const root = await sha256(canonical(leaves))
  return { artifacts, leaves, root }
}

export async function verify(packet: Awaited<ReturnType<typeof seal>>, tampered = false) {
  const artifacts = packet.artifacts.map(a => ({ ...a, body: tampered && a.id === 'observations.json' ? a.body.replace(/\d/, '9') : a.body }))
  const leaves = await Promise.all(artifacts.map(async a => ({ id: a.id, hash: await sha256(a.body) })))
  const root = await sha256(canonical(leaves))
  return { ok: root === packet.root && leaves.every((leaf, i) => leaf.hash === packet.leaves[i].hash), changed: leaves.filter((leaf, i) => leaf.hash !== packet.leaves[i].hash).map(l => l.id) }
}
