import { useState, useRef, useCallback } from 'react'
import { CommunityPostCreateForm, PostType, PostCategory } from '../types/community.types'

interface Props {
  open:       boolean
  onClose:    () => void
  onSubmit:   (form: CommunityPostCreateForm) => Promise<boolean>
  loading:    boolean
  categories: PostCategory[]
}

const TYPE_OPTIONS: { key: PostType; label: string; icon: string; desc: string }[] = [
  { key: 'content',  label: 'Content',  icon: '📝', desc: 'Share health tips or articles' },
  { key: 'question', label: 'Question', icon: '❓', desc: 'Ask the community something'    },
]

const EMPTY: CommunityPostCreateForm = {
  title: '', description: '', type: 'content', category: '', tags: '', media: [], isAnonymous: false,
}

export default function CreatePostModal({ open, onClose, onSubmit, loading, categories }: Props) {
  const [form,       setForm]       = useState<CommunityPostCreateForm>(EMPTY)
  const [tagInput,   setTagInput]   = useState('')
  const [tagList,    setTagList]    = useState<string[]>([])
  const [previews,   setPreviews]   = useState<{ url: string; name: string }[]>([])
  const [dragOver,   setDragOver]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof CommunityPostCreateForm, v: any) => setForm(p => ({ ...p, [k]: v }))

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return
    const arr = Array.from(incoming).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
    const next = [...form.media, ...arr].slice(0, 5) // max 5
    setForm(p => ({ ...p, media: next }))
    const newPreviews = arr.slice(0, 5 - form.media.length).map(f => ({
      url: URL.createObjectURL(f), name: f.name,
    }))
    setPreviews(p => [...p, ...newPreviews].slice(0, 5))
  }, [form.media])

  const removeFile = (i: number) => {
    setForm(p => ({ ...p, media: p.media.filter((_, idx) => idx !== i) }))
    setPreviews(p => p.filter((_, idx) => idx !== i))
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !tagList.includes(t) && tagList.length < 8) {
      const next = [...tagList, t]
      setTagList(next)
      set('tags', next.join(','))
    }
    setTagInput('')
  }
  const removeTag = (t: string) => {
    const next = tagList.filter(x => x !== t)
    setTagList(next)
    set('tags', next.join(','))
  }

  const reset = () => {
    setForm(EMPTY); setTagInput(''); setTagList([]); setPreviews([])
  }

  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.category) return
    const ok = await onSubmit({ ...form, tags: tagList.join(',') })
    if (ok) handleClose()
  }

  const isValid = form.title.trim() && form.description.trim() && form.category

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-poppins font-bold text-[18px] text-navy">Create Post</h2>
            <p className="text-[12.5px] text-gray-400 mt-0.5">Share knowledge with the community</p>
          </div>
          <button onClick={handleClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-navy transition-all text-sm">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Post Type */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Post Type</label>
            <div className="grid grid-cols-2 gap-2.5">
              {TYPE_OPTIONS.map(t => (
                <button key={t.key} type="button"
                  onClick={() => set('type', t.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
                    ${form.type === t.key
                      ? 'border-brand-primary bg-brand-lighter'
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                    }`}>
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <p className={`text-[13px] font-bold ${form.type === t.key ? 'text-brand-primary' : 'text-navy'}`}>{t.label}</p>
                    <p className="text-[11px] text-gray-400">{t.desc}</p>
                  </div>
                  {form.type === t.key && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center text-white text-[10px]">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Title *</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Enter post title…"
              maxLength={120}
              className="w-full h-10 px-4 bg-gray-50 rounded-xl text-[13px] font-medium text-navy placeholder:text-gray-300 outline-none border border-transparent focus:border-brand-primary/30 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 transition-all"
            />
            <p className="text-[11px] text-gray-300 mt-1 text-right">{form.title.length}/120</p>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Description *</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Write your post content here…"
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-[13px] font-medium text-navy placeholder:text-gray-300 outline-none border border-transparent focus:border-brand-primary/30 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Category *</label>
            <div className="relative">
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className={`w-full h-10 pl-4 pr-8 rounded-xl text-[13px] font-medium outline-none border appearance-none cursor-pointer transition-all
                  ${form.category
                    ? 'bg-brand-lighter border-brand-primary/20 text-brand-primary font-semibold'
                    : 'bg-gray-50 border-transparent text-gray-400'
                  }`}>
                <option value="">Select category…</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Tags <span className="font-normal normal-case text-gray-300">(optional, max 8)</span></label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
                placeholder="Type tag and press Enter…"
                className="flex-1 h-9 px-3 bg-gray-50 rounded-xl text-[12.5px] font-medium text-navy placeholder:text-gray-300 outline-none border border-transparent focus:border-brand-primary/30 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 transition-all"
              />
              <button type="button" onClick={addTag}
                className="h-9 px-4 bg-brand-lighter text-brand-primary text-[12.5px] font-bold rounded-xl hover:bg-brand-soft transition-colors">
                + Add
              </button>
            </div>
            {tagList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {tagList.map(t => (
                  <span key={t} className="flex items-center gap-1 bg-brand-lighter text-brand-primary text-[11.5px] font-semibold px-2.5 py-1 rounded-full">
                    #{t}
                    <button onClick={() => removeTag(t)} className="text-brand-primary/50 hover:text-brand-primary text-[10px] ml-0.5">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Media <span className="font-normal normal-case text-gray-300">(optional, max 5)</span></label>

            {/* Drop zone */}
            {form.media.length < 5 && (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
                  ${dragOver ? 'border-brand-primary bg-brand-lighter' : 'border-gray-200 hover:border-brand-primary/40 hover:bg-gray-50'}`}>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl">🖼️</div>
                  <p className="text-[12.5px] font-semibold text-gray-500">Drop images/videos here or <span className="text-brand-primary">browse</span></p>
                  <p className="text-[11px] text-gray-300">JPG, PNG, MP4 · Max 5 files</p>
                </div>
                <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden"
                  onChange={e => addFiles(e.target.files)} />
              </div>
            )}

            {/* Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {previews.map((p, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => removeFile(i)}
                        className="w-7 h-7 rounded-full bg-white/90 text-danger text-xs flex items-center justify-center hover:bg-white transition-colors">
                        ✕
                      </button>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-navy/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Anonymity Toggle */}
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xl shadow-sm">
                👤
              </div>
              <div>
                <p className="text-[13px] font-bold text-navy">Post Anonymously</p>
                <p className="text-[11px] text-gray-400">Hide your name and profile picture from others</p>
              </div>
            </div>
            <button
              onClick={() => set('isAnonymous', !form.isAnonymous)}
              className={`w-12 h-6 rounded-full transition-all relative ${form.isAnonymous ? 'bg-brand-primary' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.isAnonymous ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[11.5px] text-gray-400">
            {!form.title.trim() || !form.description.trim() || !form.category
              ? '⚠ Fill required fields to publish'
              : '✓ Ready to publish'
            }
          </p>
          <div className="flex items-center gap-2">
            <button onClick={handleClose}
              className="h-9 px-5 rounded-xl text-[13px] font-semibold text-gray-400 hover:text-navy hover:bg-gray-100 transition-all">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={!isValid || loading}
              className="h-9 px-6 rounded-xl bg-gradient-to-br from-brand-primary to-brand-gradient text-white text-[13px] font-semibold shadow-sm shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center gap-2">
              {loading ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Publishing…</>
              ) : (
                <><span>🚀</span> Publish Post</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
