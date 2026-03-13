import { useState, useEffect, useCallback, useRef } from 'react'
import {
  CommunityPost, CommunityPostCreateForm,
  CommunityPostParams, CommunityPostFilter, PostSort,
} from '../types/community.types'
import { communityService } from '../services/communityService'
import showToast            from '../../../utils/toast'

export const PAGE_LIMIT = 9

export interface UseCommunityReturn {
  posts:         CommunityPost[]
  loading:       boolean
  actionLoading: boolean
  // Pagination
  page:          number
  totalPages:    number
  total:         number
  setPage:       (p: number) => void
  // Filters
  filter:        CommunityPostFilter
  setFilter:     (f: CommunityPostFilter) => void
  updateFilter:  (updater: (prev: CommunityPostFilter) => CommunityPostFilter) => void
  // Actions
  createPost:    (form: CommunityPostCreateForm) => Promise<boolean>
  deletePost:    (id: string) => Promise<boolean>
  refresh:       () => void
}

export const EMPTY_FILTER: CommunityPostFilter = {
  search:   '',
  type:     'all',
  category: 'all',
  sort:     'newest',
  postedBy: 'all',
}

export const useCommunity = (): UseCommunityReturn => {
  const [posts,         setPosts]         = useState<CommunityPost[]>([])
  const [loading,       setLoading]       = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [page,          setPageState]     = useState(1)
  const [totalPages,    setTotalPages]    = useState(1)
  const [total,         setTotal]         = useState(0)
  const [filter,        setFilterState]   = useState<CommunityPostFilter>(EMPTY_FILTER)

  // Keep a ref so fetchPosts closure always sees latest values
  const pageRef   = useRef(page)
  const filterRef = useRef(filter)
  pageRef.current   = page
  filterRef.current = filter

  const fetchPosts = useCallback(async (f: CommunityPostFilter, p: number) => {
    setLoading(true)
    try {
      // Build server params — omit 'all' / empty values
      const params: CommunityPostParams = { page: p, limit: PAGE_LIMIT }
      if (f.search)             params.search   = f.search
      if (f.type !== 'all')     params.type     = f.type
      if (f.category !== 'all') params.category = f.category
      if (f.sort)               params.sort     = f.sort

      const res  = await communityService.getAll(params)
      const body = res.data

      // Normalise pagination — handle both flat and nested meta shapes
      const rawPosts  = body.data ?? []
      const rawTotal  = body.meta?.total      ?? body.total      ?? rawPosts.length
      const rawPages  = body.meta?.totalPages ?? body.totalPages ?? 1

      // Client-side postedBy filter (not a server param)
      const filtered = f.postedBy === 'all'
        ? rawPosts
        : rawPosts.filter(post => post.postedBy?.role === f.postedBy)

      setPosts(filtered)
      setTotal(rawTotal)
      setTotalPages(rawPages)
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to load posts.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Re-fetch whenever page or filter changes
  useEffect(() => {
    fetchPosts(filter, page)
  }, [filter, page, fetchPosts])

  // When filter changes, reset to page 1
  const setFilter = useCallback((f: CommunityPostFilter) => {
    setFilterState(f)
    setPageState(1)
  }, [])

  const updateFilter = useCallback((updater: (prev: CommunityPostFilter) => CommunityPostFilter) => {
    setFilterState(prev => {
      const next = updater(prev)
      setPageState(1)
      return next
    })
  }, [])

  const setPage = useCallback((p: number) => {
    setPageState(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const refresh = useCallback(() => {
    fetchPosts(filterRef.current, pageRef.current)
  }, [fetchPosts])

  const createPost = async (form: CommunityPostCreateForm): Promise<boolean> => {
    setActionLoading(true)
    try {
      await communityService.create(form)
      showToast.success('Post published!')
      // Refresh page 1 with current filters to see new post
      setPageState(1)
      fetchPosts(filterRef.current, 1)
      return true
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to create post.')
      return false
    } finally { setActionLoading(false) }
  }

  const deletePost = async (id: string): Promise<boolean> => {
    setActionLoading(true)
    try {
      await communityService.remove(id)
      setPosts(p => p.filter(post => post._id !== id))
      setTotal(t => Math.max(0, t - 1))
      showToast.warn('Post deleted.')
      // If page is now empty and not first page, go back one
      if (posts.length === 1 && page > 1) {
        setPage(page - 1)
      }
      return true
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to delete post.')
      return false
    } finally { setActionLoading(false) }
  }

  return {
    posts, loading, actionLoading,
    page, totalPages, total,
    setPage, filter, setFilter, updateFilter,
    createPost, deletePost, refresh,
  }
}
