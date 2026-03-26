export interface DashboardCounts {
  totalPatients: number
  totalHospitals: number
  activeDoctors: number
  todaysAppointments: number
}

export interface DashboardCountsResponse {
  success: boolean
  status: number
  message: string
  data: DashboardCounts
}

export interface AppointmentOverviewMonth {
  month: string
  completed: number
  cancelled: number
  missed: number
  upcoming: number
}

export interface DashboardAppOverviewResponse {
  success: boolean
  status: number
  message: string
  data: AppointmentOverviewMonth[]
}

export interface RecentAppointment {
  patientName: string
  doctorName: string
  specialization: string
  amount: number
  status: string
  time: string
  date: string
}
export interface TopDoctor {
  rating: number
  reviewsCount: number
  recentAppointments: number
  doctorId: string
  doctorName: string
  specialization: string
  score: number
}

export interface DashboardRecentResponse {
  success: boolean
  status: number
  message: string
  data: RecentAppointment[]
}
export interface DashboardTopDoctorsResponse {
  success: boolean
  status: number
  message: string
  data: TopDoctor[]
}
export interface DepartmentLoad {
   department: string
  utilization: number
}
export interface DashboardDepartmentLoadResponse {
  success: boolean
  status: number
  message: string
  data: DepartmentLoad[]
}

