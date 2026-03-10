import { cn } from '../../utils/helpers'
import { SpinnerIcon } from '../Loader/Loader'

const variants = {
  primary:   'bg-gradient-to-r from-brand-primary to-brand-gradient text-white shadow-btn hover:opacity-90',
  secondary: 'bg-brand-lighter text-brand-primary hover:bg-brand-soft',
  danger:    'bg-danger-bg text-danger hover:bg-red-100',
  ghost:     'bg-transparent text-gray-500 hover:bg-surface',
  outline:   'border border-brand-primary text-brand-primary hover:bg-brand-lighter',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  disabled = false,
  loading  = false,
  icon,
  onClick,
  className,
  type = 'button',
  ...props
}) {
  const spinnerColor = variant === 'primary' ? 'white' : 'blue'

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 font-semibold transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <SpinnerIcon size="sm" color={spinnerColor} />
      ) : icon ? (
        <span className="text-base leading-none">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
