import { cn } from '../../../utils/helpers'

const iconBg = {
  blue:   'bg-brand-lighter',
  green:  'bg-success-bg',
  yellow: 'bg-warning-bg',
  red:    'bg-danger-bg',
}

const cornerBg = {
  blue:   'bg-brand-primary',
  green:  'bg-success',
  yellow: 'bg-warning',
  red:    'bg-danger',
}

export default function StatCard({ label, value, icon, color = 'blue', change, up, note }) {
  return (
    <div className="relative bg-white rounded-2xl p-5 border border-brand-primary/[0.08] overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-hover hover:-translate-y-0.5">
      {/* Decorative corner */}
      <div
        className={cn(
          'absolute top-0 right-0 w-20 h-20 rounded-bl-[80px] opacity-[0.07]',
          cornerBg[color],
        )}
      />

      {/* Icon */}
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3', iconBg[color])}>
        {icon}
      </div>

      {/* Value */}
      <p className="font-poppins font-bold text-[26px] text-navy tracking-tight leading-none mb-1.5">
        {value}
      </p>

      {/* Label */}
      <p className="text-[12.5px] text-gray-400 font-medium mb-3">{label}</p>

      {/* Change */}
      <p className={cn('text-xs font-semibold flex items-center gap-1', up ? 'text-success' : 'text-danger')}>
        {change}
        <span className="text-gray-300 font-normal">{note}</span>
      </p>
    </div>
  )
}
