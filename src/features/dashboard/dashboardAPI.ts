// In production replace these with real axiosInstance calls
// import axiosInstance from '../../../services/axiosConfig'

export const STATS = [
  {
    id:     'patients',
    label:  'Total Patients',
    value:  '4,821',
    icon:   '👥',
    color:  'blue',
    change: '+12.4%',
    up:     true,
    note:   'vs last month',
  },
  {
    id:     'appointments',
    label:  'Appointments Today',
    value:  '368',
    icon:   '📅',
    color:  'green',
    change: '+8.1%',
    up:     true,
    note:   'vs yesterday',
  },
  {
    id:     'revenue',
    label:  'Revenue This Month',
    value:  '₹2.4L',
    icon:   '💰',
    color:  'yellow',
    change: '+19.3%',
    up:     true,
    note:   'vs last month',
  },
  {
    id:     'doctors',
    label:  'Active Doctors',
    value:  '47',
    icon:   '🩺',
    color:  'red',
    change: '▼ 2',
    up:     false,
    note:   'on leave today',
  },
]

export const CHART_DATA = [
  { month: 'Jan', completed: 88,  scheduled: 56 },
  { month: 'Feb', completed: 100, scheduled: 70 },
  { month: 'Mar', completed: 74,  scheduled: 90 },
  { month: 'Apr', completed: 120, scheduled: 50 },
  { month: 'May', completed: 95,  scheduled: 65 },
  { month: 'Jun', completed: 110, scheduled: 80 },
  { month: 'Jul', completed: 130, scheduled: 60 },
  { month: 'Aug', completed: 85,  scheduled: 75 },
  { month: 'Sep', completed: 140, scheduled: 55 },
]

export const ACTIVITY = [
  {
    id:     1,
    actor:  'Dr. Shruti Kedia',
    text:   'confirmed appointment with Rahul M.',
    time:   '2 min ago',
    tag:    '✓ Done',
    tagColor: 'green',
    avatarIndex: 0,
  },
  {
    id:     2,
    actor:  'Anika Patel',
    text:   'registered as new patient',
    time:   '14 min ago',
    tag:    'New',
    tagColor: 'blue',
    avatarIndex: 2,
  },
  {
    id:     3,
    actor:  'Invoice #2847',
    text:   'paid by Rohit Joshi — ₹3,500',
    time:   '38 min ago',
    tag:    'Paid',
    tagColor: 'green',
    avatarIndex: 1,
  },
  {
    id:     4,
    actor:  'Appointment #914',
    text:   'cancelled by Meera K.',
    time:   '1 hr ago',
    tag:    'Cancel',
    tagColor: 'red',
    avatarIndex: 3,
  },
  {
    id:     5,
    actor:  'Lab Report',
    text:   'uploaded for Vikram S.',
    time:   '2 hr ago',
    tag:    'Upload',
    tagColor: 'blue',
    avatarIndex: 0,
  },
]

export const APPOINTMENTS = [
  { id: 1, patient: 'Rahul Mehta',   specialty: 'General',  doctor: 'Dr. Kedia',  time: '10:00 AM', status: 'active',    amount: '₹500',   avatarIdx: 0 },
  { id: 2, patient: 'Anika Patel',   specialty: 'Dentist',  doctor: 'Dr. Rao',    time: '11:30 AM', status: 'pending',   amount: '₹750',   avatarIdx: 2 },
  { id: 3, patient: 'Sunita Kapoor', specialty: 'Cardio',   doctor: 'Dr. Sharma', time: '2:00 PM',  status: 'active',    amount: '₹1,200', avatarIdx: 1 },
  { id: 4, patient: 'Mohan Joshi',   specialty: 'Ortho',    doctor: 'Dr. Gupta',  time: '3:15 PM',  status: 'cancelled', amount: '—',      avatarIdx: 3 },
  { id: 5, patient: 'Priya Nair',    specialty: 'Gynae',    doctor: 'Dr. Mehta',  time: '4:45 PM',  status: 'pending',   amount: '₹900',   avatarIdx: 0 },
]

export const TOP_DOCTORS = [
  { name: 'Dr. Shruti Kedia',  specialty: 'Dentist',      rating: 4.9, reviews: 96, avatarIdx: 0 },
  { name: 'Dr. Rajiv Sharma',  specialty: 'Cardiologist', rating: 4.8, reviews: 84, avatarIdx: 1 },
  { name: 'Dr. Amit Gupta',    specialty: 'Orthopedic',   rating: 4.7, reviews: 71, avatarIdx: 2 },
]

export const DEPARTMENTS = [
  { name: 'Cardiology',   value: 87, color: 'blue'   },
  { name: 'Dentistry',    value: 74, color: 'green'  },
  { name: 'Orthopedics',  value: 61, color: 'yellow' },
  { name: 'General OPD',  value: 93, color: 'blue'   },
]

export const QUICK_ACTIONS = [
  { icon: '📅', label: 'New Appointment', bg: 'bg-brand-lighter' },
  { icon: '👤', label: 'Add Patient',     bg: 'bg-success-bg'    },
  { icon: '🧾', label: 'Generate Bill',   bg: 'bg-warning-bg'    },
  { icon: '🚨', label: 'Emergency',       bg: 'bg-danger-bg'     },
  { icon: '💊', label: 'Prescribe',       bg: 'bg-brand-lighter' },
  { icon: '🔬', label: 'Lab Test',        bg: 'bg-success-bg'    },
  { icon: '📊', label: 'View Report',     bg: 'bg-warning-bg'    },
  { icon: '⚙️', label: 'Settings',        bg: 'bg-surface'       },
]
