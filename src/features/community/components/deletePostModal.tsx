import { CommunityPost } from '../types/community.types'

interface Props {
  post:     CommunityPost | null
  open:     boolean
  onClose:  () => void
  onConfirm: () => void
  loading:  boolean
}

export default function DeletePostModal({ post, open, onClose, onConfirm, loading }: Props) {
  if (!open || !post) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Red top bar */}
        <div className="h-1 bg-gradient-to-r from-red-400 to-danger" />

        <div className="px-6 py-6 flex flex-col gap-5">
          {/* Icon + Title */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-danger-bg flex items-center justify-center flex-shrink-0 text-2xl">
              🗑️
            </div>
            <div>
              <h2 className="font-poppins font-bold text-[17px] text-navy">Delete Post</h2>
              <p className="text-[13px] text-gray-400 mt-0.5">This action cannot be undone.</p>
            </div>
          </div>

          {/* Post preview */}
          <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide
                ${post.type === 'content' ? 'bg-brand-lighter text-brand-primary' : 'bg-amber-50 text-amber-600'}`}>
                {post.type}
              </span>
              {post.category?.name && (
                <span className="text-[10.5px] text-gray-400 font-medium">{post.category.name}</span>
              )}
            </div>
            <p className="text-[13.5px] font-bold text-navy line-clamp-1">{post.title}</p>
            <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed">{post.description}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-gray-300">❤️ {post.likesCount} likes</span>
              <span className="text-[11px] text-gray-300">💬 {post.commentsCount} comments</span>
            </div>
          </div>

          <p className="text-[13px] text-gray-500 leading-relaxed">
            Are you sure you want to permanently delete <span className="font-bold text-navy">"{post.title}"</span>?
            All likes and comments will also be removed.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <button onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 h-10 rounded-xl bg-danger text-white text-[13px] font-semibold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Deleting…</>
                : <>🗑️ Delete Post</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
