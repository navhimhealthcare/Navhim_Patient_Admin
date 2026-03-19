import axiosInstance from '../../../services/axiosConfig'
import { ActivityLogResponse, ActivityLogParams } from '../types/activityLog.types'

// GET  auth/activity-log
export const fetchActivityLogsAPI = (params: ActivityLogParams) =>
  axiosInstance.get<ActivityLogResponse>('/auth/activity-log', { params })
