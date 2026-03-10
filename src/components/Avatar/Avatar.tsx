import { getInitials, cn } from '../../utils/helpers'

const gradients = [
  'from-brand-primary to-brand-gradient',
  'from-green-400 to-green-600',
  'from-yellow-400 to-orange-500',
  'from-red-400 to-red-700',
  'from-purple-400 to-purple-700',
]

const sizes = {
  xs:  'w-7 h-7 text-[10px]',
  sm:  'w-8 h-8 text-xs',
  md:  'w-10 h-10 text-sm',
  lg:  'w-12 h-12 text-base',
  xl:  'w-16 h-16 text-xl',
}

const shapes = {
  circle: 'rounded-full',
  square: 'rounded-xl',
}

export default function Avatar({
  name    = '',
  src,
  size    = 'md',
  shape   = 'circle',
  index   = 0,
  className,
}) {
  const gradient = gradients[index % gradients.length]

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('object-cover', sizes[size], shapes[shape], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center font-bold text-white bg-gradient-to-br flex-shrink-0',
        gradient,
        sizes[size],
        shapes[shape],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  )
}
