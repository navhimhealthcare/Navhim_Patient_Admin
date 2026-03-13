import { useNavigate } from 'react-router-dom'
import Card, { CardHeader } from '../../../components/Card/Card'
import Button from '../../../components/Button/Button'
import Avatar from '../../../components/Avatar/Avatar'
import StatusBadge from '../../../components/Badge/StatusBadge'
import { APPOINTMENTS } from '../dashboardAPI'
import showToast from '../../../utils/toast'

export default function AppointmentsTable() {
  const navigate = useNavigate()

  const handleRowClick = (row) => {
    showToast.info(`Viewing appointment for ${row.patient} with ${row.doctor}`)
  }

  const handleViewAll = () => {
    showToast.info('Loading all appointments…')
    setTimeout(() => navigate('/app/appointments'), 600)
  }

  return (
    <Card>
      <CardHeader
        title="Recent Appointments"
        subtitle="Today's schedule"
        action={<Button variant="secondary" size="sm" onClick={handleViewAll}>View All</Button>}
      />
      <div className="px-5 pb-5 pt-3 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              {['Patient', 'Doctor', 'Time', 'Status', 'Amount'].map(h => (
                <th key={h}
                  className="text-[11px] font-bold uppercase tracking-widest text-gray-300 pb-2.5 border-b border-brand-primary/[0.07]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {APPOINTMENTS.map(row => (
              <tr key={row.id} onClick={() => handleRowClick(row)}
                className="border-b border-brand-primary/[0.05] last:border-0 hover:bg-surface transition-colors cursor-pointer group">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={row.patient} size="sm" index={row.avatarIdx} shape="circle" />
                    <div>
                      <p className="text-[13px] font-bold text-navy leading-none group-hover:text-brand-primary transition-colors">{row.patient}</p>
                      <p className="text-[11px] text-gray-300 mt-0.5">{row.specialty}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-[12.5px] text-gray-500">{row.doctor}</td>
                <td className="py-3 pr-4 text-[12.5px] text-gray-500">{row.time}</td>
                <td className="py-3 pr-4"><StatusBadge status={row.status} /></td>
                <td className="py-3 text-[13px] font-bold text-navy">{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
