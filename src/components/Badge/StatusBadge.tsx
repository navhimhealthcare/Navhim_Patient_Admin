import { cn } from '../../utils/helpers'
import { capitalize } from '../../utils/helpers'

const styles = {
  active:    'bg-success-bg text-green-700',
  pending:   'bg-warning-bg text-yellow-700',
  cancelled: 'bg-danger-bg text-danger',
  completed: 'bg-brand-lighter text-brand-primary',
}

const dots = {
  active:    'bg-success',
  pending:   'bg-warning',
  cancelled: 'bg-danger',
  completed: 'bg-brand-primary',
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const s = status?.toLowerCase() || 'pending'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold',
        styles[s] || styles.pending,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dots[s] || dots.pending)} />
      {capitalize(s)}
    </span>
  )
}
