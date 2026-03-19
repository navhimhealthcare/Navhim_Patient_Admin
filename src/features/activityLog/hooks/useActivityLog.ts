import { useState, useCallback, useEffect, useRef } from 'react'
import {
  ActivityLog, ActivityLogFilter, ActivityLogParams,
} from '../types/activityLog.types'
import { fetchActivityLogsAPI } from '../services/activityLogService'
import showToast from '../../../utils/toast'

export const DEFAULT_LIMIT    = 100
export const LIMIT_OPTIONS    = [25, 50, 100, 200, 500]

export const EMPTY_FILTER: ActivityLogFilter = {
  role:      'all',
  userId:    '',
  startDate: '',
  endDate:   '',
  search:    '',
}

export const useActivityLog = () => {
  const [logs,    setLogs]    = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilterState] = useState<ActivityLogFilter>(EMPTY_FILTER)
  const [limit,   setLimitState]  = useState<number>(DEFAULT_LIMIT)

  const filterRef = useRef(filter)
  const limitRef  = useRef(limit)
  filterRef.current = filter
  limitRef.current  = limit

  const isFetching = useRef(false)

  const fetchLogs = useCallback(async (f: ActivityLogFilter, l: number, force = false) => {
    // If already fetching and not forced, skip to avoid redundant calls
    if (!force && isFetching.current) return;

    isFetching.current = true
    setLoading(true)
    try {
      const params: ActivityLogParams = { limit: l }
      if (f.role !== 'all') params.role      = f.role
      if (f.userId)         params.userId    = f.userId
      if (f.startDate)      params.startDate = f.startDate
      if (f.endDate)        params.endDate   = f.endDate

      const res = await fetchActivityLogsAPI(params)
      setLogs(res.data.data.formattedLogs ?? [])
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to load activity logs.')
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [])

  // Re-fetch whenever server params change (filter fields or limit)
  useEffect(() => {
    fetchLogs(filter, limit)
  }, [filter.role, filter.userId, filter.startDate, filter.endDate, limit])

  const updateFilter = useCallback((updater: (prev: ActivityLogFilter) => ActivityLogFilter) => {
    setFilterState(prev => updater(prev))
  }, [])

  const setLimit = useCallback((l: number) => {
    const clamped = Math.max(1, Math.min(1000, l))
    setLimitState(clamped)
  }, [])

  const refresh = useCallback(() => {
    fetchLogs(filterRef.current, limitRef.current, true)
  }, [fetchLogs])

  // Client-side search only (no pagination — what you see = what the API returned)
  const filtered = logs.filter(log => {
    if (!filter.search) return true
    const q = filter.search.toLowerCase()
    return (
      log.endpoint?.toLowerCase().includes(q)   ||
      log.user?.name?.toLowerCase().includes(q)  ||
      log.user?.email?.toLowerCase().includes(q) ||
      log.ipAddress?.toLowerCase().includes(q)
    )
  })

  return {
    logs: filtered,
    total: filtered.length,
    fetchedCount: logs.length,
    loading,
    limit,
    setLimit,
    filter,
    updateFilter,
    refresh,
  }
}
