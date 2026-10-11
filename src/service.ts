export type ConnectionMode = 'local' | 'configured' | 'connected' | 'error'

export type ServiceConfig = {
  apiBaseUrl: string | null
  cognitoDomain: string | null
  cognitoClientId: string | null
  cognitoRedirectUri: string | null
}

export type ServiceStatus = { mode: ConnectionMode; detail: string; lastSuccess: string | null }

export type RemoteCase = { caseId: string; recordType?: string; status?: string; payload?: unknown; updatedAt?: string }

const trim = (value: string | undefined) => value?.trim().replace(/\/$/, '') || null
export const serviceConfig: ServiceConfig = {
  apiBaseUrl: trim(import.meta.env.VITE_API_BASE_URL),
  cognitoDomain: trim(import.meta.env.VITE_COGNITO_DOMAIN),
  cognitoClientId: trim(import.meta.env.VITE_COGNITO_CLIENT_ID),
  cognitoRedirectUri: trim(import.meta.env.VITE_COGNITO_REDIRECT_URI),
}

export const initialServiceStatus = (): ServiceStatus => serviceConfig.apiBaseUrl
  ? { mode: 'configured', detail: 'Backend configured; connection not yet verified.', lastSuccess: null }
  : { mode: 'local', detail: 'No API base URL configured. Local browser storage is active.', lastSuccess: null }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!serviceConfig.apiBaseUrl) throw new Error('API base URL is not configured')
  const response = await fetch(`${serviceConfig.apiBaseUrl}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
  })
  const body = await response.json().catch(() => ({})) as T & { error?: string }
  if (!response.ok) throw new Error(body.error || `Backend request failed (${response.status})`)
  return body
}

export function createComplaintRemote(complaint: { incidentType: string; occurredAt: string; location: string; notes: string }) {
  return request<RemoteCase>('/complaints', { method: 'POST', headers: { 'Idempotency-Key': complaint.incidentType + complaint.occurredAt + complaint.location }, body: JSON.stringify(complaint) })
}

export function listCasesRemote() { return request<{ items: RemoteCase[] }>('/cases') }

export function authState(): 'signed-out' | 'sign-in-required' | 'signed-in-placeholder' {
  if (!serviceConfig.cognitoDomain || !serviceConfig.cognitoClientId) return 'signed-out'
  return 'sign-in-required'
}

export function signInUrl(): string | null {
  if (!serviceConfig.cognitoDomain || !serviceConfig.cognitoClientId) return null
  const redirect = serviceConfig.cognitoRedirectUri || window.location.origin
  const params = new URLSearchParams({ response_type: 'code', client_id: serviceConfig.cognitoClientId, redirect_uri: redirect, scope: 'openid email' })
  return `${serviceConfig.cognitoDomain}/oauth2/authorize?${params}`
}

export type DataSource = { name: 'Open-Meteo' | 'OpenAQ'; endpoint: string; provenance: string; lastFetched: string | null; qaBoundary: string; state: 'available' | 'not-fetched' | 'unavailable' }
export const dataSources: DataSource[] = [
  { name: 'Open-Meteo', endpoint: 'api.open-meteo.com', provenance: 'Weather API · attribution required', lastFetched: null, qaBoundary: 'Weather context only; not pollution attribution or a validated dispersion model.', state: 'not-fetched' },
  { name: 'OpenAQ', endpoint: 'api.openaq.org', provenance: 'Open air-quality data network · station metadata required', lastFetched: null, qaBoundary: 'Measurements require station QA, calibration, coverage, and time-alignment checks.', state: 'not-fetched' },
]
