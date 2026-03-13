import Card, { CardHeader } from '../../../components/Card/Card'
import Avatar from '../../../components/Avatar/Avatar'
import { cn } from '../../../utils/helpers'
import { ACTIVITY } from '../dashboardAPI'
import showToast from '../../../utils/toast'

const tagStyles = {
  green: 'bg-success-bg text-green-700',
  blue:  'bg-brand-lighter text-brand-primary',
  red:   'bg-danger-bg text-danger',
}

export default function ActivityFeed() {
  const handleItemClick = (item) => {
    const toastMap = {
      green: showToast.success,
      red:   showToast.error,
      blue:  showToast.info,
    }
    ;(toastMap[item.tagColor] || showToast.info)(`${item.actor} — ${item.text}`)
  }

  return (
    <Card>
      <CardHeader title="Recent Activity" subtitle="Live updates" />
      <div className="px-5 py-3 divide-y divide-brand-primary/[0.06]">
        {ACTIVITY.map(item => (
          <div key={item.id} onClick={() => handleItemClick(item)}
            className="flex items-start gap-3 py-2.5 cursor-pointer hover:bg-surface -mx-5 px-5 transition-colors rounded-xl">
            <Avatar name={item.actor} size="sm" index={item.avatarIndex} className="mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] text-gray-600 font-medium leading-snug">
                <strong className="text-navy font-bold">{item.actor}</strong>{' '}{item.text}
              </p>
              <p className="text-[11px] text-gray-300 mt-0.5">{item.time}</p>
            </div>
            <span className={cn('text-[10.5px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5', tagStyles[item.tagColor] || tagStyles.blue)}>
              {item.tag}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
