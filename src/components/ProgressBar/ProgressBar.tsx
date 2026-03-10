import { cn } from '../../utils/helpers'

const trackColors = {
  blue:   'from-brand-primary to-brand-gradient',
  green:  'from-green-400 to-green-600',
  yellow: 'from-yellow-400 to-orange-400',
  red:    'from-red-400 to-red-600',
}

export default function ProgressBar({
  value    = 0,
  max      = 100,
  color    = 'blue',
  label,
  showValue = true,
  className,
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label    && <span className="text-[13px] font-semibold text-gray-600">{label}</span>}
          {showValue && <span className="text-[12px] font-bold text-brand-primary">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', trackColors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
