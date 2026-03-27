import Card, { CardHeader } from '../../../components/Card/Card'

import { QUICK_ACTIONS } from '../../../utils/constants'
import { SpinnerIcon } from '../../../components/Loader/Loader'
import { cn } from '../../../utils/helpers'
import showToast from '../../../utils/toast'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function QuickActions() {
  const [loadingIdx, setLoadingIdx] = useState(null)
  const navigate = useNavigate()

  const handleAction = async (action, idx) => {
    setLoadingIdx(idx)
    await new Promise(r => setTimeout(r, 600)) // Shorter delay for better UX
    setLoadingIdx(null)
    navigate(action.path)
  }

  return (
    <Card>
      <CardHeader title="Quick Actions" subtitle="Common tasks" />
      <div className="grid grid-cols-4 gap-3 px-5 pb-5 pt-4">
        {QUICK_ACTIONS.map((action, idx) => (
          <button
            key={action.label}
            disabled={loadingIdx !== null}
            onClick={() => handleAction(action, idx)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl border border-transparent',
              'hover:bg-brand-lighter hover:border-brand-primary/20',
              'transition-all duration-200 cursor-pointer group bg-surface',
              'disabled:opacity-60 disabled:cursor-not-allowed',
            )}
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-lg relative', action.bg)}>
              {loadingIdx === idx
                ? <SpinnerIcon size="md" color="blue" />
                : action.icon
              }
            </div>
            <span className="text-[11.5px] font-semibold text-gray-500 text-center leading-tight group-hover:text-brand-primary transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  )
}
