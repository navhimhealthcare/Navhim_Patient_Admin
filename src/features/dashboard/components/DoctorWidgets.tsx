import Card, { CardHeader } from '../../../components/Card/Card'
import Avatar from '../../../components/Avatar/Avatar'
import ProgressBar from '../../../components/ProgressBar/ProgressBar'
import { TOP_DOCTORS, DEPARTMENTS } from '../dashboardAPI'
import showToast from '../../../utils/toast'

export function TopDoctors() {
  const handleDoctorClick = (doc) => {
    showToast.info(`Viewing profile of ${doc.name} — ${doc.specialty}`)
  }

  return (
    <Card>
      <CardHeader title="Top Doctors" subtitle="By rating this month" />
      <div className="px-5 pb-4 pt-3 divide-y divide-brand-primary/[0.06]">
        {TOP_DOCTORS.map((doc) => (
          <div key={doc.name} onClick={() => handleDoctorClick(doc)}
            className="flex items-center gap-3 py-3 cursor-pointer hover:bg-surface -mx-5 px-5 transition-colors">
            <Avatar name={doc.name} size="md" index={doc.avatarIdx} shape="square" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-navy truncate hover:text-brand-primary transition-colors">{doc.name}</p>
              <p className="text-[11.5px] text-gray-400 mt-0.5">{doc.specialty}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[12px] font-bold text-warning">⭐ {doc.rating}</p>
              <p className="text-[11px] text-gray-300 mt-0.5">{doc.reviews} reviews</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function DepartmentLoad() {
  const handleDeptClick = (dep) => {
    const level = dep.value >= 80 ? 'warn' : dep.value >= 50 ? 'info' : 'success'
    const msgs = {
      warn:    `⚠️ ${dep.name} is at high capacity (${dep.value}%). Consider reallocation.`,
      info:    `${dep.name} is at moderate capacity (${dep.value}%).`,
      success: `${dep.name} has comfortable capacity (${dep.value}%).`,
    }
    showToast[level](msgs[level])
  }

  return (
    <Card>
      <CardHeader title="Department Load" subtitle="Capacity utilization" />
      <div className="px-5 pb-5 pt-3 flex flex-col gap-4">
        {DEPARTMENTS.map(dep => (
          <div key={dep.name} onClick={() => handleDeptClick(dep)} className="cursor-pointer">
            <ProgressBar label={dep.name} value={dep.value} color={dep.color} />
          </div>
        ))}
      </div>
    </Card>
  )
}
