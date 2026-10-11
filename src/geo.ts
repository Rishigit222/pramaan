/** Coordinate-bearing entities are optional by design; text locations are never geocoded here. */
export type Coordinate = { latitude: number; longitude: number }
export type GeospatialSource = Coordinate & { id: string; label: string; source: 'sensor' | 'candidate' | 'reference'; provenance: string; qa: 'unknown' | 'reviewed' }
export type CandidatePoint = Coordinate & { id: string; label: string; rationale: string; geospatialStatus: 'proposed' | 'field-confirmed' }

export function isCoordinate(value: unknown): value is Coordinate {
  if (!value || typeof value !== 'object') return false
  const item = value as Coordinate
  return Number.isFinite(item.latitude) && item.latitude >= -90 && item.latitude <= 90 && Number.isFinite(item.longitude) && item.longitude >= -180 && item.longitude <= 180
}
