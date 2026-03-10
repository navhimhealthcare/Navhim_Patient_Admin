import { cn } from '../../utils/helpers'

const colors = {
  blue:   'bg-brand-lighter text-brand-primary',
  green:  'bg-success-bg text-green-700',
  yellow: 'bg-warning-bg text-yellow-700',
  red:    'bg-danger-bg text-danger',
  gray:   'bg-gray-100 text-gray-500',
}

export default function Badge({ children, color = 'blue', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold min-w-[20px]',
        colors[color],
        className,
      )}
    >
      {children}
    </span>
  )
}
