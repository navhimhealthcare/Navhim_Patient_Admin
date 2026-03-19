// ── Activity Log ─────────────────────────────────────────────────────────
export type LogRole   = 'admin' | 'patient'
export type LogMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface LogUser {
  _id:   string
  name:  string
  email: string
}

export interface ActivityLog {
  _id:        string
  userId:     string
  role:       LogRole
  method:     LogMethod
  endpoint:   string
  statusCode: number
  ipAddress:  string
  userAgent:  string
  createdAt:  string
  updatedAt:  string
  user:       LogUser
}

// ── Filter / Params ───────────────────────────────────────────────────────
export interface ActivityLogFilter {
  role:      LogRole | 'all'
  userId:    string
  startDate: string   // ISO string or ''
  endDate:   string   // ISO string or ''
  search:    string   // client-side: search endpoint / user name
}

export interface ActivityLogParams {
  limit?:     number
  role?:      LogRole
  userId?:    string
  startDate?: string
  endDate?:   string
}

// ── API Response ──────────────────────────────────────────────────────────
export interface ActivityLogResponse {
  success: boolean
  status:  number
  message: string
  data: {
    formattedLogs: ActivityLog[]
  }
}
