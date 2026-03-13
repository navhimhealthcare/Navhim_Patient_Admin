export type PostType  = 'content' | 'question' | 'poll'
export type PostSort  = 'newest' | 'oldest' | 'trending' | 'mostLiked'

export interface PostMedia {
  url:  string
  type: 'image' | 'video'
}

export interface PostCategory {
  _id:  string
  name: string
}

export interface PostedBy {
  _id:   string
  role:  string
  name:  string
  image: string | null
}

export interface CommunityPost {
  _id:           string
  type:          PostType
  title:         string
  description:   string
  media:         PostMedia[]
  category:      PostCategory
  tags:          string[]
  isAnonymous:   boolean
  postedBy:      PostedBy
  likes:         string[]
  likesCount:    number
  commentsCount: number
  views:         number
  isLiked:       boolean
  createdAt:     string
  updatedAt:     string
}

export interface CommunityPostCreateForm {
  title:       string
  description: string
  type:        PostType
  category:    string
  tags:        string
  media:       File[]
  isAnonymous: boolean
}

// All params sent to the server
export interface CommunityPostParams {
  search?:   string
  type?:     PostType
  category?: string
  sort?:     PostSort
  page:      number
  limit:     number
}

export interface CommunityPostFilter {
  search:   string
  type:     PostType | 'all'
  category: string
  sort:     PostSort
  postedBy: 'all' | 'patient' | 'admin'
}

// ── API response shapes ────────────────────────────────────────────────
export interface PostListMeta {
  total:      number
  page:       number
  limit:      number
  totalPages: number
}

export interface PostListResponse {
  success: boolean
  status:  number
  message: string
  data:    CommunityPost[]
  meta?:   PostListMeta        // server may include pagination meta
  // some APIs nest differently — handle both shapes in the hook
  total?:      number
  page?:       number
  totalPages?: number
}

export interface PostSingleResponse {
  success: boolean
  status:  number
  message: string
  data:    CommunityPost
}
