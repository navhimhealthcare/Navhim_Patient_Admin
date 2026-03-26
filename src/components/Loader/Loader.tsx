import appLogo from '../../assets/images/appLogo.png'
import { cn } from '../../utils/helpers'

/* ─────────────────────────────────────────────────────────────────────
   SPINNER ICON — tiny reusable spin ring, used inside buttons / inline
───────────────────────────────────────────────────────────────────── */
export function SpinnerIcon({ size = 'md', color = 'current', className }: { size?: 'xs'|'sm'|'md'|'lg'|'xl'; color?: 'current'|'white'|'blue'|'gray'; className?: string }) {
  const sizes = {
    xs:  'w-3 h-3 border-[1.5px]',
    sm:  'w-4 h-4 border-2',
    md:  'w-5 h-5 border-2',
    lg:  'w-7 h-7 border-[3px]',
    xl:  'w-10 h-10 border-4',
  }
  const colors = {
    current: 'border-current   border-t-transparent',
    white:   'border-white     border-t-transparent',
    blue:    'border-[#4B69FF] border-t-transparent',
    gray:    'border-gray-300  border-t-transparent',
  }
  return (
    <span
      className={cn(
        'inline-block rounded-full animate-spin',
        sizes[size] || sizes.md,
        colors[color] || colors.current,
        className,
      )}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────
   PAGE LOADER — full-screen overlay (used on initial page/route loads)
───────────────────────────────────────────────────────────────────── */
export function PageLoader({ text = 'Loading…' }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      {/* Branded logo mark */}
      <div className="relative mb-6">
        <img src={appLogo} alt="Navhim Logo" className="w-16 h-16 rounded-2xl object-contain" />
        {/* Spinning ring around logo */}
        <span className="absolute -inset-1.5 rounded-[20px] border-2 border-[#4B69FF]/30 border-t-[#4B69FF] animate-spin" />
      </div>

      <p className="font-poppins font-semibold text-[15px] text-[#10162F] mb-1">
        Navhim-Patient-Admin
      </p>
      <p className="text-sm text-gray-400">{text}</p>

      {/* Pulsing dots */}
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#4B69FF] animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   SECTION LOADER — centred spinner for card / table loading states
───────────────────────────────────────────────────────────────────── */
export function SectionLoader({ text = 'Fetching data…', className }: { text?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
      <SpinnerIcon size="lg" color="blue" />
      <p className="text-sm text-gray-400 font-medium">{text}</p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   SKELETON — grey shimmer placeholder for text / cards
───────────────────────────────────────────────────────────────────── */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg',
        'animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:400%_100%]',
        className,
      )}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────
   STAT CARD SKELETON — placeholder while dashboard stats load
───────────────────────────────────────────────────────────────────── */
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-brand-primary/[0.08]">
      <Skeleton className="w-11 h-11 rounded-xl mb-3" />
      <Skeleton className="w-20 h-7 rounded mb-2" />
      <Skeleton className="w-32 h-4 rounded mb-3" />
      {/* <Skeleton className="w-24 h-3 rounded" /> */}
    </div>
  )
}
