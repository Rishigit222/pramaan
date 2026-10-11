import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Download, FileCheck2, FlaskConical, GitCompare, History, MousePointerClick, Pause, Play, RotateCcw, ShieldCheck } from 'lucide-react'
import { cases, seal, verify, type CaseId, type Outcome } from './evidence'
import { buildEvidencePacket, compareCases, outcomeCounts, persistRun, readRunHistory, runIdForCase, RUN_STAGES, stageOutput, type CaseComparison, type CaseRunRecord, type EvidencePacket } from './case-run'

function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const judgeSteps = [
  { title: 'Choose a fixture', detail: 'Start with the clearly labelled DEMO / SYNTHETIC case selector. Complaints are intentionally not selectable here.', target: 'Case selector' },
  { title: 'Run the case', detail: 'Start the five-stage local run, then pause it to inspect a stage before resuming.', target: 'Run controls' },
  { title: 'Read the work', detail: 'Follow Intake, QA gate, Falsification, Cross-examination, and Seal. Each output is copied or calculated from the existing fixture.', target: 'Stage progress' },
  { title: 'Compare the contrast', detail: 'Switch either side of the comparison to see grade, outcome counts, completeness, and next action side by side.', target: 'Case comparison' },
  { title: 'Export the boundary', detail: 'Download the completed packet and use its limitations and integrity result to explain what the demo does not prove.', target: 'Evidence packet' },
]

const comparisonOutcomes: Outcome[] = ['supports', 'contradicts', 'inconclusive', 'unavailable']
const outcomeLabel: Record<Outcome, string> = { supports: 'Supports', contradicts: 'Contradicts', inconclusive: 'Inconclusive', unavailable: 'Unavailable' }

export function RunLabView() {
  const [caseId, setCaseId] = useState<CaseId>('refused')
  const [leftId, setLeftId] = useState<CaseId>('confirmed')
  const [rightId, setRightId] = useState<CaseId>('refused')
  const [stageIndex, setStageIndex] = useState(-1)
  const [runStarted, setRunStarted] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sealBusy, setSealBusy] = useState(false)
  const [packet, setPacket] = useState<EvidencePacket | null>(null)
  const [history, setHistory] = useState<CaseRunRecord[]>(readRunHistory)
  const [notice, setNotice] = useState('')
  const [judgeMode, setJudgeMode] = useState(false)
  const [judgeStep, setJudgeStep] = useState(0)
  const selectedCase = cases.find(item => item.id === caseId) || cases[0]
  const leftCase = cases.find(item => item.id === leftId) || cases[0]
  const rightCase = cases.find(item => item.id === rightId) || cases[1]
  const comparison: CaseComparison = useMemo(() => compareCases(leftCase, rightCase), [leftCase, rightCase])
  const selectedCounts = useMemo(() => outcomeCounts(selectedCase), [selectedCase])
  const progress = runStarted ? Math.round(Math.min(stageIndex, RUN_STAGES.length) / RUN_STAGES.length * 100) : 0
  const finished = runStarted && stageIndex >= RUN_STAGES.length

  useEffect(() => {
    if (!judgeMode) return
    const target = document.querySelector(`[data-judge-target="${['case-selector', 'run-controls', 'stage-progress', 'case-comparison', 'evidence-packet'][judgeStep]}"]`)
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [judgeMode, judgeStep])

  const resetRun = (showNotice = true) => {
    setStageIndex(-1)
    setRunStarted(false)
    setIsRunning(false)
    setIsPaused(false)
    setSealBusy(false)
    setPacket(null)
    if (showNotice) setNotice('Run reset locally. Fixture evidence was not changed.')
  }

  const finishRun = async () => {
    setSealBusy(true)
    try {
      const sealed = await seal(selectedCase)
      const verification = await verify(sealed)
      const nextPacket = buildEvidencePacket(selectedCase, sealed, verification)
      setPacket(nextPacket)
      setHistory(persistRun(nextPacket))
      setNotice(`Run complete · ${nextPacket.runId} saved in local history.`)
    } catch {
      setNotice('Seal stage could not complete in this browser. The fixture was not modified.')
    } finally {
      setSealBusy(false)
    }
  }

  useEffect(() => {
    if (!isRunning) return undefined
    const timer = window.setTimeout(() => {
      if (stageIndex >= RUN_STAGES.length - 1) {
        setStageIndex(RUN_STAGES.length)
        setIsRunning(false)
        setIsPaused(false)
        void finishRun()
      } else {
        setStageIndex(current => current + 1)
      }
    }, 850)
    return () => window.clearTimeout(timer)
  }, [isRunning, stageIndex])

  const startRun = () => {
    setPacket(null)
    setStageIndex(0)
    setRunStarted(true)
    setIsPaused(false)
    setIsRunning(true)
    setSealBusy(false)
    setNotice(`Running ${selectedCase.title} from the local fixture…`)
  }

  const pauseRun = () => {
    setIsRunning(false)
    setIsPaused(true)
    setNotice('Run paused. Stage output remains local and deterministic.')
  }

  const resumeRun = () => {
    setIsPaused(false)
    setIsRunning(true)
    setNotice('Run resumed.')
  }

  const loadHistory = (record: CaseRunRecord) => {
    setCaseId(record.caseId)
    setPacket(record.packet)
    setStageIndex(RUN_STAGES.length)
    setRunStarted(true)
    setIsRunning(false)
    setIsPaused(false)
    setNotice(`Loaded ${record.runId} from browser-local history.`)
  }

  const downloadPacket = () => {
    if (!packet) return
    downloadJson(`${packet.runId.toLowerCase()}-evidence-packet.json`, packet)
    setNotice('Evidence packet download started. The file is labelled DEMO / SYNTHETIC.')
  }

  const changeCase = (value: CaseId) => {
    if (isRunning || sealBusy) return
    setCaseId(value)
    resetRun(false)
    setNotice('Fixture selected. Start a new local run when ready.')
  }

  const stageStatus = (index: number) => {
    if (!runStarted) return 'Pending'
    if (sealBusy && index === RUN_STAGES.length - 1) return 'Sealing'
    if (stageIndex >= RUN_STAGES.length || index < stageIndex) return 'Complete'
    if (index === stageIndex) return isPaused ? 'Paused' : sealBusy ? 'Sealing' : 'Running'
    return 'Pending'
  }

  const judgeClass = (step: number, base: string) => `${base}${judgeMode && judgeStep === step ? ' judge-highlight' : ''}`

  return <section className="page-content run-lab-page">
    <div className="page-intro run-lab-intro"><div><span className="eyebrow">INVESTIGATIONS / LOCAL RUN LAB</span><h2>Put a synthetic case through the full chain.</h2><p>A paced, inspectable case run for a judge or reviewer. It uses only the three fixtures already in Pramaan, stores completed packets in this browser, and never turns an intake complaint into a synthetic investigation.</p></div><button className="secondary-button" onClick={() => { setJudgeMode(true); setJudgeStep(0) }}><MousePointerClick size={16}/> Start judge mode</button></div>
    <div className="demo-notice"><FlaskConical size={17}/><span><b>DEMO / SYNTHETIC RUN LAB</b> · No backend, live feed, or new measurement is used. Local complaints remain <strong>pending evidence</strong> and cannot be selected or assigned a run.</span></div>
    {judgeMode && <div className="judge-banner" role="status"><div className="judge-banner-icon"><MousePointerClick size={18}/></div><div><span className="eyebrow">GUIDED JUDGE MODE · STEP {judgeStep + 1} / {judgeSteps.length}</span><h3>{judgeSteps[judgeStep].title}</h3><p>{judgeSteps[judgeStep].detail}</p><small>Highlighted target: {judgeSteps[judgeStep].target} · walkthrough guidance only; evidence is unchanged.</small></div><div className="judge-actions"><button className="secondary-button" disabled={judgeStep === 0} onClick={() => setJudgeStep(step => Math.max(0, step - 1))}>Back</button><button className="primary-button" onClick={() => judgeStep === judgeSteps.length - 1 ? setJudgeMode(false) : setJudgeStep(step => step + 1)}>{judgeStep === judgeSteps.length - 1 ? 'Finish walkthrough' : 'Next hint'} <ArrowRight size={15}/></button></div></div>}
    <div className="run-lab-layout">
      <div className="run-lab-main">
        <div className={judgeClass(0, 'panel run-selector')} data-judge-target="case-selector"><div className="panel-title"><div><span className="eyebrow">01 / INPUT</span><h3>Choose a synthetic fixture</h3></div><span className="tag">DEMO / SYNTHETIC</span></div><label className="run-field">Case fixture<select value={caseId} disabled={isRunning || sealBusy} onChange={event => changeCase(event.target.value as CaseId)}>{cases.map(item => <option key={item.id} value={item.id}>Case {item.number} · {item.title} · Grade {item.grade}</option>)}</select></label><p className="muted">The simulator reads the fixture’s recorded sensors, QA labels, test outcomes, grade boundary, and existing citations. It does not accept complaint records or arbitrary evidence.</p><div className="run-facts"><div><span>RUN ID</span><b>{runIdForCase(selectedCase)}</b></div><div><span>FIXTURE PEAK</span><b>{selectedCase.peak} µg/m³</b></div><div><span>COMPLETENESS</span><b>{selectedCase.coverage}%</b></div><div><span>TESTS</span><b>{selectedCase.tests.length}</b></div></div><div className="run-outcome-strip"><span>Fixture outcomes</span>{comparisonOutcomes.map(outcome => <b key={outcome} className={`outcome-${outcome}`}>{outcomeLabel[outcome]} {selectedCounts[outcome]}</b>)}</div></div>
        <div className={judgeClass(1, 'panel run-controls')} data-judge-target="run-controls"><div className="panel-title"><div><span className="eyebrow">02 / CONTROL</span><h3>Run the five stages</h3></div><span className={`run-state ${finished ? 'is-complete' : isPaused ? 'is-paused' : isRunning ? 'is-running' : ''}`}>{finished ? 'Complete' : isPaused ? 'Paused' : isRunning ? 'Running' : 'Ready'}</span></div><div className="run-progress-head"><span>{finished ? 'All stages complete' : runStarted ? `Stage ${Math.min(stageIndex + 1, RUN_STAGES.length)} of ${RUN_STAGES.length}` : 'Ready to start'}</span><b>{progress}%</b></div><div className="run-progress-track"><span style={{ width: `${progress}%` }}/></div><div className="run-button-row"><button className="primary-button" disabled={isRunning || sealBusy} onClick={startRun}>{packet ? <><RotateCcw size={16}/> Re-run case</> : <><Play size={16}/> Start case run</>}</button>{isRunning ? <button className="secondary-button" onClick={pauseRun}><Pause size={16}/> Pause</button> : isPaused ? <button className="secondary-button" onClick={resumeRun}><Play size={16}/> Resume</button> : null}<button className="secondary-button" onClick={() => resetRun()} disabled={(!runStarted && !packet) || sealBusy}><RotateCcw size={16}/> Reset</button><button className="secondary-button" onClick={downloadPacket} disabled={!packet}><Download size={16}/> Download packet</button></div><p className="run-status" aria-live="polite">{notice || 'Run stages advance automatically every 0.85 seconds; pause to inspect before resuming.'}</p></div>
        <div className={judgeClass(2, 'panel stage-panel')} data-judge-target="stage-progress"><div className="panel-title"><div><span className="eyebrow">03 / ORCHESTRATION</span><h3>Visible stage progress</h3></div><span className="tag">LOCAL ONLY</span></div><div className="stage-list">{RUN_STAGES.map((stage, index) => { const status = stageStatus(index); const visible = runStarted && (index < stageIndex || finished); return <div className={`stage-row stage-${status.toLowerCase().replace(' ', '-')}`} key={stage}><div className="stage-number">{index + 1}</div><div className="stage-copy"><div className="stage-heading"><b>{stage}</b><span>{status}</span></div>{visible ? <ul>{stageOutput(selectedCase, stage).map(line => <li key={line}>{line}</li>)}</ul> : <p>{status === 'Running' || status === 'Sealing' ? 'Working from the selected fixture…' : status === 'Paused' ? 'Paused here. Resume to reveal the stage output.' : 'Waiting for the preceding stage.'}</p>}</div></div> })}</div></div>
        <div className={judgeClass(3, 'panel comparison-panel')} data-judge-target="case-comparison"><div className="panel-title"><div><span className="eyebrow">04 / CONTRAST</span><h3><GitCompare size={18}/> Compare two synthetic cases</h3></div><span className="tag">NO COMPLAINTS</span></div><p className="muted">A side-by-side view of fixture differences. Changing the selectors only changes this comparison; it never edits evidence or assigns a run.</p><div className="comparison-selectors"><label>Case A<select value={leftId} onChange={event => setLeftId(event.target.value as CaseId)}>{cases.map(item => <option key={item.id} value={item.id}>Case {item.number} · {item.title}</option>)}</select></label><span className="comparison-arrow"><ArrowRight size={18}/></span><label>Case B<select value={rightId} onChange={event => setRightId(event.target.value as CaseId)}>{cases.map(item => <option key={item.id} value={item.id}>Case {item.number} · {item.title}</option>)}</select></label></div><div className="comparison-table-wrap"><table className="comparison-table"><thead><tr><th>Difference</th><th>{comparison.left.title}</th><th>{comparison.right.title}</th><th>Delta / reading</th></tr></thead><tbody><tr><th>Grade</th><td><strong className={`grade-text grade-${comparison.left.grade.toLowerCase()}`}>{comparison.left.grade}</strong> · {comparison.left.gradeName}</td><td><strong className={`grade-text grade-${comparison.right.grade.toLowerCase()}`}>{comparison.right.grade}</strong> · {comparison.right.gradeName}</td><td>{comparison.gradeChanged ? 'Changed' : 'Same'}</td></tr><tr><th>Completeness</th><td>{comparison.left.coverage}% eligible coverage</td><td>{comparison.right.coverage}% eligible coverage</td><td>{comparison.completenessDifference > 0 ? '+' : ''}{comparison.completenessDifference} points (B − A)</td></tr>{comparisonOutcomes.map(outcome => <tr key={outcome}><th>{outcomeLabel[outcome]}</th><td>{comparison.leftCounts[outcome]} test{comparison.leftCounts[outcome] === 1 ? '' : 's'}</td><td>{comparison.rightCounts[outcome]} test{comparison.rightCounts[outcome] === 1 ? '' : 's'}</td><td>{comparison.rightCounts[outcome] - comparison.leftCounts[outcome] > 0 ? '+' : ''}{comparison.rightCounts[outcome] - comparison.leftCounts[outcome]} (B − A)</td></tr>)}<tr><th>Next action</th><td>{comparison.left.action}</td><td>{comparison.right.action}</td><td><span className="muted">Read each boundary</span></td></tr></tbody></table></div></div>
        <div className={judgeClass(4, 'panel packet-panel')} data-judge-target="evidence-packet"><div className="panel-title"><div><span className="eyebrow">05 / HANDOFF</span><h3>Evidence packet</h3></div><FileCheck2 size={18}/></div>{packet ? <><div className="packet-ready"><ShieldCheck size={18}/><div><b>Packet ready · {packet.integrity.verified ? 'integrity verified' : 'verification failed'}</b><span>{packet.runId} · {packet.integrity.root.slice(0, 18)}…</span></div></div><div className="packet-grid"><div><span>Inputs</span><b>Fixture snapshot + {packet.inputs.sensors.length} sensors</b></div><div><span>Tests</span><b>{packet.testOutcomes.length} outcomes + citations</b></div><div><span>Grade boundary</span><b>{packet.gradeBoundary.grade} · {packet.gradeBoundary.label}</b></div><div><span>Limitations</span><b>{packet.limitations.length} explicit limits</b></div></div><details className="packet-details"><summary>Inspect packet contents before download</summary><p><b>Integrity:</b> {packet.integrity.verified ? 'Verified against the local seal.' : `Changed: ${packet.integrity.changed.join(', ') || 'unknown artifact'}.`}</p><p><b>Citations:</b> {packet.citations.map(citation => `${citation.claimId} → ${citation.evidenceIds.join(', ')}`).join(' · ')}</p><p><b>Boundary:</b> {packet.gradeBoundary.ceiling}</p></details><button className="primary-button" onClick={downloadPacket}><Download size={16}/> Download {packet.runId} packet</button></> : <div className="packet-empty"><FileCheck2 size={28}/><div><h4>Complete the run to create a packet</h4><p>The download will contain inputs, every fixture test outcome, the grade boundary, citation ledger, integrity result, and limitations.</p></div></div>}</div>
      </div>
      <aside className="run-lab-side"><div className="panel history-panel"><div className="panel-title"><div><span className="eyebrow">LOCAL HISTORY</span><h3><History size={18}/> Completed runs</h3></div><span className="tag">BROWSER STORAGE</span></div>{history.length ? <div className="history-list">{history.map(record => <button className={`history-row ${packet?.runId === record.runId ? 'is-selected' : ''}`} key={record.runId} onClick={() => loadHistory(record)}><span><b>{record.caseTitle}</b><small>{record.runId} · Grade {record.grade}</small></span><em>{record.runCount} run{record.runCount === 1 ? '' : 's'}<br/>{new Date(record.completedAt).toLocaleDateString()}</em></button>)}</div> : <div className="empty-state"><History size={25}/><p>No completed local runs yet.</p></div>}<p className="muted tiny">History is best-effort browser storage. Re-running keeps the deterministic run ID and updates its local run count.</p></div><div className="panel judge-help"><div className="panel-title"><div><span className="eyebrow">REVIEW BOUNDARY</span><h3>What a judge can verify</h3></div><ShieldCheck size={18}/></div><ul><li>Every stage points back to existing fixture inputs.</li><li>Paused runs do not create a packet or alter evidence.</li><li>Complaints never appear in this history.</li><li>Download content is explicitly labelled synthetic and local.</li></ul></div></aside>
    </div>
  </section>
}
