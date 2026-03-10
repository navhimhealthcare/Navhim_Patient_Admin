import { cn } from '../../utils/helpers'

export default function Card({ children, className, hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl border border-brand-primary/[0.08] overflow-hidden',
        hover && 'cursor-pointer transition-all duration-200 hover:shadow-hover hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('flex items-center justify-between px-5 pt-5', className)}>
      <div>
        {title    && <h3 className="font-poppins font-bold text-[15px] text-navy tracking-tight">{title}</h3>}
        {subtitle && <p className="text-[11.5px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
