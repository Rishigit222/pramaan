import { useEffect, useState, type FormEvent } from 'react'
import { ArrowRight, Download, FilePlus2, FolderOpen, Trash2 } from 'lucide-react'

export const STORAGE_KEY = 'pramaan.local-complaints.v1'
const incidentTypes = ['Smoke or haze', 'Dust', 'Odour', 'Other'] as const
type IncidentType = typeof incidentTypes[number]

export type Complaint = {
  id: string
  incidentType: IncidentType
  occurredAt: string
  location: string
  notes: string
  createdAt: string
}

type Draft = { incidentType: IncidentType | ''; occurredAt: string; location: string; notes: string }
type Field = keyof Draft
const emptyDraft: Draft = { incidentType: '', occurredAt: '', location: '', notes: '' }
const checklist = [
  'Record the incident duration and any changes over time.',
  'Find contemporaneous measurements from a calibrated monitor near the area and an independent background location.',
  'Check monitor calibration, clocks, data gaps, and relevant wind conditions.',
  'Compare alternative explanations such as traffic, construction, or regional smoke before naming a source.'
]

function isComplaint(value: unknown): value is Complaint {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && item.id.length > 0 && incidentTypes.includes(item.incidentType as IncidentType)
    && typeof item.occurredAt === 'string' && !Number.isNaN(Date.parse(item.occurredAt))
    && typeof item.createdAt === 'string' && !Number.isNaN(Date.parse(item.createdAt))
    && typeof item.location === 'string' && item.location.length <= 200
    && typeof item.notes === 'string' && item.notes.length <= 2000
}

export function readComplaints(): { items: Complaint[]; error: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return { items: [], error: null }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isComplaint) || new Set(parsed.map(item => item.id)).size !== parsed.length) {
      throw new Error('Invalid saved complaint format')
    }
    return { items: parsed, error: null }
  } catch {
    return { items: [], error: 'Saved complaints could not be read. No changes were made. Check browser storage access or restore your local data before trying again.' }
  }
}

function validate(draft: Draft): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {}
  if (!incidentTypes.includes(draft.incidentType as IncidentType)) errors.incidentType = 'Select an incident type.'
  const timestamp = new Date(draft.occurredAt).getTime()
  if (!draft.occurredAt || !Number.isFinite(timestamp)) errors.occurredAt = 'Enter the date and time of the incident.'
  else if (timestamp > Date.now() + 60_000) errors.occurredAt = 'The incident time cannot be in the future.'
  if (!draft.location.trim()) errors.location = 'Describe where the incident occurred.'
  else if (draft.location.trim().length < 5) errors.location = 'Add a more specific location (at least 5 characters).'
  else if (draft.location.length > 200) errors.location = 'Keep the location under 200 characters.'
  if (draft.notes.length > 2000) errors.notes = 'Keep notes under 2,000 characters.'
  return errors
}

function displayTime(iso: string) { return new Date(iso).toLocaleString() }

export function ComplaintWorkspace() {
  const [stored, setStored] = useState(readComplaints)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [message, setMessage] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const selected = stored.items.find(item => item.id === openId)

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        setStored(readComplaints())
        setConfirmId(null)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function update<K extends Field>(key: K, value: Draft[K]) {
    setDraft(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: undefined }))
    setMessage('')
  }

  function persist(next: Complaint[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      window.dispatchEvent(new CustomEvent('pramaan:complaints-changed'))
      setStored({ items: next, error: null })
      return true
    } catch {
      setMessage('Could not save to browser storage. Your existing records were not changed. Check storage permissions or available space, then try again.')
      return false
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validate(draft)
    setErrors(found)
    if (Object.keys(found).length) { setMessage('Please correct the highlighted fields before saving.'); return }
    if (stored.error) { setMessage('Saved records are unavailable; reload them before creating another complaint.'); return }
    let id: string
    try { id = crypto.randomUUID() }
    catch { setMessage('This browser could not create a record ID. Your report was not saved. Please try a supported browser.'); return }
    const now = new Date().toISOString()
    const item: Complaint = {
      id, incidentType: draft.incidentType as IncidentType,
      occurredAt: new Date(draft.occurredAt).toISOString(), location: draft.location.trim(),
      notes: draft.notes.trim(), createdAt: now
    }
    if (persist([item, ...stored.items])) {
      setDraft(emptyDraft)
      setOpenId(item.id)
      setConfirmId(null)
      setMessage('Complaint saved on this device. Evidence is still pending.')
      document.getElementById('saved-complaints')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function remove(item: Complaint) {
    if (!persist(stored.items.filter(record => record.id !== item.id))) return
    if (openId === item.id) setOpenId(null)
    setConfirmId(null)
    setMessage('Complaint deleted from this browser.')
  }

  function download(item: Complaint) {
    try {
      const blob = new Blob([JSON.stringify({ schemaVersion: 1, recordType: 'local-complaint', evidenceStatus: 'pending', complaint: item }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pramaan-complaint-${item.id}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
      setMessage('JSON download started. The file contains your location and notes; share it only when you choose to.')
    } catch {
      setMessage('Could not prepare the JSON download. Please try again.')
    }
  }

  return <section id="complaints" className="complaint-workspace" aria-labelledby="complaint-title">
    <div className="complaint-intro"><div><div className="eyebrow accent">LOCAL CASE WORKSPACE / YOUR REPORTS</div><h2 id="complaint-title">Start with what you observed.</h2><p>Save the incident first. Evidence can be collected later; a report alone cannot identify a source.</p></div><span className="local-pill">LOCAL ONLY · THIS BROWSER</span></div>
    <p className="privacy-note">Your entries stay in this browser’s local storage. There is no account, upload, live sensor connection, or automatic backup. Clearing site data may erase them. Export a JSON copy before clearing your browser; it includes your location and notes.</p>
    <div className="complaint-grid"><form className="intake-card" onSubmit={submit} noValidate>
      <div className="complaint-card-head"><FilePlus2 size={22}/><div><span>01 / INTAKE</span><h3>New complaint</h3></div></div>
      <div className="intake-fields">
        <div className="intake-field"><label htmlFor="incident-type">Incident type <span>*</span></label><select id="incident-type" value={draft.incidentType} onChange={e => update('incidentType', e.target.value as Draft['incidentType'])} aria-invalid={!!errors.incidentType} aria-describedby={errors.incidentType ? 'incident-type-error' : undefined}><option value="">Select a type</option>{incidentTypes.map(type => <option key={type} value={type}>{type}</option>)}</select>{errors.incidentType && <small id="incident-type-error" className="field-error">{errors.incidentType}</small>}</div>
        <div className="intake-field"><label htmlFor="incident-time">Incident date & time <span>*</span></label><input id="incident-time" type="datetime-local" value={draft.occurredAt} onChange={e => update('occurredAt', e.target.value)} aria-invalid={!!errors.occurredAt} aria-describedby={errors.occurredAt ? 'incident-time-error' : 'time-hint'}/><small id="time-hint">Your local time zone; stored as UTC.</small>{errors.occurredAt && <small id="incident-time-error" className="field-error">{errors.occurredAt}</small>}</div>
        <div className="intake-field wide"><label htmlFor="incident-location">Location description <span>*</span></label><input id="incident-location" type="text" maxLength={200} placeholder="e.g. near the north gate, Eastbank" value={draft.location} onChange={e => update('location', e.target.value)} aria-invalid={!!errors.location} aria-describedby={errors.location ? 'incident-location-error' : undefined}/>{errors.location && <small id="incident-location-error" className="field-error">{errors.location}</small>}</div>
        <div className="intake-field wide"><label htmlFor="incident-notes">Notes <span className="optional">optional</span></label><textarea id="incident-notes" rows={4} maxLength={2000} placeholder="What did you see, smell, or hear? Duration or possible alternatives?" value={draft.notes} onChange={e => update('notes', e.target.value)} aria-invalid={!!errors.notes} aria-describedby={errors.notes ? 'incident-notes-error' : undefined}/>{errors.notes && <small id="incident-notes-error" className="field-error">{errors.notes}</small>}</div>
      </div><button className="complaint-primary" type="submit">Save complaint <ArrowRight size={17}/></button>
    </form>
    <div id="saved-complaints" className="saved-card"><div className="complaint-card-head"><FolderOpen size={22}/><div><span>02 / LOCAL RECORDS</span><h3>Saved complaints <small>{stored.items.length}</small></h3></div></div>
      {stored.error ? <div className="storage-error" role="alert"><p>{stored.error}</p><button type="button" onClick={() => { setStored(readComplaints()); setMessage('') }}>Retry reading storage</button></div> : stored.items.length === 0 ? <p className="empty-complaints">No complaints saved yet. Complete the form to start a local case record.</p> : <div className="complaint-list">{stored.items.map(item => <button key={item.id} type="button" className={`complaint-list-item ${openId === item.id ? 'is-selected' : ''}`} onClick={() => { setOpenId(item.id); setConfirmId(null) }} aria-pressed={openId === item.id}><span><strong>{item.incidentType}</strong><small>{displayTime(item.occurredAt)} · {item.location}</small></span><ArrowRight size={16}/></button>)}</div>}
      {selected && <article className="complaint-detail" aria-label="Opened complaint"><div className="detail-top"><span className="pending-pill">PENDING EVIDENCE</span><small>Saved {displayTime(selected.createdAt)}</small></div><h4>{selected.incidentType}</h4><dl><div><dt>Incident time</dt><dd>{displayTime(selected.occurredAt)}</dd></div><div><dt>Location</dt><dd>{selected.location}</dd></div><div><dt>Notes</dt><dd>{selected.notes || 'No notes provided.'}</dd></div><div><dt>Record ID</dt><dd className="record-id">{selected.id}</dd></div></dl><div className="next-data"><strong>Insufficient evidence · what to collect next</strong><p>This is a reported observation, not a verified reading, source assessment, or fixture grade.</p><ul>{checklist.map(step => <li key={step}>{step}</li>)}</ul></div><div className="detail-actions"><button type="button" onClick={() => download(selected)}><Download size={16}/> Download JSON</button><button type="button" className="delete-trigger" onClick={() => setConfirmId(selected.id)}><Trash2 size={16}/> Delete</button></div>{confirmId === selected.id && <div className="delete-confirm"><p>Delete this complaint from this browser? This cannot be undone.</p><div><button type="button" onClick={() => remove(selected)}>Yes, delete</button><button type="button" onClick={() => setConfirmId(null)}>Cancel</button></div></div>}</article>}
    </div></div>{message && <p className="complaint-message" role="status">{message}</p>}
    <div className="demo-route"><span>EXPLORE THE METHOD</span><p>Want to see how an investigation could work with actual evidence? The separate examples below use invented sensors and prewritten outcomes.</p><a href="#investigation">Explore synthetic cases <ArrowRight size={16}/></a></div>
  </section>
}
