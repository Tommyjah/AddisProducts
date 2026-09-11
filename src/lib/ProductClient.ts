import { supabase } from './supabase'
import type { Database } from './supabase'
import type {
  Product,
  ProductInput,
  Review,
  Pledge,
  VoteState,
  User,
  GovernmentProposal,
} from '../types'

type ProductRow = Database['public']['Tables']['products']['Row']
type UserRow = Database['public']['Tables']['users']['Row']
type ReviewRow = Database['public']['Tables']['reviews']['Row']
type VoteRow = Database['public']['Tables']['votes']['Row']
type PledgeRow = Database['public']['Tables']['pledges']['Row']
type GovProposalRow = Database['public']['Tables']['government_proposals']['Row']

type ProductJoin = ProductRow & {
  users: Pick<UserRow, 'id' | 'full_name' | 'avatar_url' | 'bio' | 'github_username' | 'twitter_username' | 'website_url' | 'role' | 'created_at'> | null
}

type ReviewJoin = ReviewRow & {
  users: Pick<UserRow, 'id' | 'full_name' | 'avatar_url'> | null
}

type PledgeJoin = PledgeRow & {
  users: Pick<UserRow, 'id' | 'full_name' | 'avatar_url'> | null
}

function buildUser(u: Pick<UserRow, 'id' | 'full_name' | 'avatar_url' | 'bio' | 'github_username' | 'twitter_username' | 'website_url' | 'role' | 'created_at'> | null, email?: string): User {
  return {
    id: u?.id || '',
    name: u?.full_name || 'Unknown',
    email: email || '',
    avatar: u?.avatar_url || '',
    role: (u?.role as User['role']) || 'regular',
    bio: u?.bio || '',
    github: u?.github_username || '',
    twitter: u?.twitter_username || '',
    website: u?.website_url || '',
    joinedAt: new Date(u?.created_at || ''),
  }
}

function transformProduct(row: ProductRow & { users: ProductJoin['users'] }): Product {
  return {
    id: row.id,
    title: row.title,
    titleAm: row.title_am || undefined,
    description: row.description,
    descriptionAm: row.description_am || undefined,
    image: row.image_url || '',
    galleryUrls: row.gallery_urls || [],
    website: row.website_url || undefined,
    github: row.github_url || undefined,
    category: row.category,
    tags: row.tags || [],
    votes: row.votes_count || 0,
    rating: row.avg_rating || 0,
    reviewCount: row.review_count || 0,
    userId: row.user_id,
    user: buildUser(row.users),
    createdAt: new Date(row.created_at),
    isFeatured: row.is_featured || false,
    fundingGoal: row.funding_goal || 0,
    currentFunding: row.current_funding || 0,
    pledgersCount: row.pledgers_count || 0,
    status: row.status,
    governmentOnly: row.government_only || false,
    collaborators: [],
  }
}

function transformReview(row: ReviewJoin): Review {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    helpful: row.helpful_count || 0,
    userId: row.user_id,
    user: {
      id: row.users?.id || '',
      name: row.users?.full_name || 'User',
      avatar: row.users?.avatar_url || '',
    },
    productId: row.product_id,
    createdAt: new Date(row.created_at),
  }
}

function transformPledge(row: PledgeJoin): Pledge {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    amount: row.amount,
    message: row.message || undefined,
    status: row.status,
    createdAt: new Date(row.created_at),
    user: row.users ? {
      id: row.users.id,
      name: row.users.full_name,
      avatar: row.users.avatar_url || '',
    } : undefined,
  }
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        users (
          id,
          full_name,
          avatar_url,
          bio,
          github_username,
          twitter_username,
          website_url,
          role,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ProductJoin[] | null | undefined)?.map(transformProduct) || []
  } catch (err) {
    console.error('fetchProducts with users join failed, retrying without join:', err)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as (ProductRow & { users: null })[] | null | undefined)?.map(row =>
      transformProduct({ ...row, users: null })
    ) || []
  }
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      users (
        id,
        full_name,
        avatar_url,
        bio,
        github_username,
        twitter_username,
        website_url,
        role,
        created_at
      )
    `)
    .eq('id', id)
    .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to load product: ${error.message}${error.details ? ` ${error.details}` : ''}${error.hint ? ` ${error.hint}` : ''}`.trim())
    }

  return transformProduct(data as ProductJoin)
}

export async function ensureUserProfile(userId: string, email?: string): Promise<void> {
  const { data, error: findErr } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (!findErr && data) return

  if (findErr && findErr.code !== 'PGRST116' && findErr.code !== 'PGRST101') {
    throw new Error(`Cannot verify user profile: ${findErr.message}`)
  }

  const basePayload: Record<string, unknown> = {
    id: userId,
    full_name: 'User',
    email: email || null,
    bio: '',
    avatar_url: '',
  }

  let { error: insertErr } = await supabase
    .from('users')
    .insert({ ...basePayload, role: 'regular' } as never)

  // CHECK constraint may reject 'regular' — retry without role, letting DEFAULT or NULL take over
  if (insertErr && insertErr.code === '23514') {
    const { error: retryErr } = await supabase
      .from('users')
      .insert(basePayload as never)
    insertErr = retryErr
  }

  if (insertErr) {
    const detail = insertErr.details ? ` ${insertErr.details}` : ''
    const hint = insertErr.hint ? ` ${insertErr.hint}` : ''
    throw new Error(
      `Cannot create user profile: ${insertErr.message}${detail}${hint}`.trim()
    )
  }
}

export async function createProduct(input: ProductInput, userId: string, email?: string): Promise<Product> {
  await ensureUserProfile(userId, email)

  const payload: Record<string, unknown> = {
    title: input.title,
    title_am: input.titleAm,
    description: input.description,
    description_am: input.descriptionAm,
    image_url: input.imageUrl,
    gallery_urls: input.galleryUrls || [],
    website_url: input.websiteUrl,
    github_url: input.githubUrl,
    category: input.category,
    tags: input.tags || [],
    funding_goal: input.fundingGoal,
    status: input.status || 'active',
    user_id: userId,
    is_featured: false,
    created_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('products')
    .insert([payload] as never)
    .select(`
      *,
      users (
        id,
        full_name,
        avatar_url,
        bio,
        github_username,
        twitter_username,
        website_url,
        role,
        created_at
      )
    `)
    .single()

  if (error) {
    const detail = error.details ? ` ${error.details}` : ''
    const hint = error.hint ? ` ${error.hint}` : ''
    throw new Error(`Failed to create product: ${error.message}${detail}${hint}`.trim())
  }
  return transformProduct(data as ProductJoin)
}

export async function voteProduct(productId: string, userId: string): Promise<VoteState> {
  const { data: existing, error: findErr } = await supabase
    .from('votes')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .maybeSingle<VoteRow>()

  if (findErr) throw findErr

  if ((existing as VoteRow | null)?.id) {
    const { error: delErr } = await supabase.from('votes').delete().eq('id', (existing as VoteRow).id)
    if (delErr) throw new Error(`Failed to remove vote: ${delErr.message}${delErr.details ? ` ${delErr.details}` : ''}${delErr.hint ? ` ${delErr.hint}` : ''}`.trim())
  } else {
    const { error: insErr } = await supabase
      .from('votes')
      .insert([{ product_id: productId, user_id: userId, vote_type: 'up' }] as never)
    if (insErr) throw new Error(`Failed to cast vote: ${insErr.message}${insErr.details ? ` ${insErr.details}` : ''}${insErr.hint ? ` ${insErr.hint}` : ''}`.trim())
  }

  const { data: prod, error: prodErr } = await supabase
    .from('products')
    .select('votes_count')
    .eq('id', productId)
    .single()

  if (prodErr) throw prodErr

  return { voted: !(existing as VoteRow | null)?.id, votesCount: (prod as ProductRow).votes_count ?? 0 }
}

export async function fetchUserVote(productId: string, userId: string): Promise<'up' | null> {
  const { data, error } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .maybeSingle<VoteRow>()

  if (error) throw error
  const voteType = (data as VoteRow | null)?.vote_type
  return voteType === 'up' ? 'up' : null
}

export async function submitReview(productId: string, userId: string, rating: number, comment: string): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{ product_id: productId, user_id: userId, rating, comment }] as never)
    .select(`*, users (id, full_name, avatar_url)`)
    .single()

  if (error) throw new Error(`Failed to submit review: ${error.message}${error.details ? ` ${error.details}` : ''}${error.hint ? ` ${error.hint}` : ''}`.trim())
  return transformReview(data as ReviewJoin)
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`*, users (id, full_name, avatar_url)`)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to load reviews: ${error.message}${error.details ? ` ${error.details}` : ''}${error.hint ? ` ${error.hint}` : ''}`.trim())
  return (data as ReviewJoin[] | null | undefined)?.map(transformReview) || []
}

export async function createPledge(productId: string, userId: string, amount: number, message?: string): Promise<Pledge> {
  const { data, error } = await supabase
    .from('pledges')
    .insert([{ product_id: productId, user_id: userId, amount, message: message || null, status: 'pledged' }] as never)
    .select(`*, users (id, full_name, avatar_url)`)
    .single()

  if (error) throw error
  return transformPledge(data as PledgeJoin)
}

export async function fetchPledges(productId: string): Promise<Pledge[]> {
  const { data, error } = await supabase
    .from('pledges')
    .select(`*, users (id, full_name, avatar_url)`)
    .eq('product_id', productId)
    .in('status', ['pledged', 'paid'])
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as PledgeJoin[] | null | undefined)?.map(transformPledge) || []
}

export async function createCollaborationRequest(
  productId: string,
  userId: string,
  data: Record<string, unknown>
): Promise<{ id: string }> {
  const { data: result, error } = await supabase
      .from('collaborations')
    .insert([{ product_id: productId, user_id: userId, ...data, status: 'pending' }] as never)
    .select('id')
    .single()

  if (error) throw error
  return result as { id: string }
}

export async function fetchGovernmentProposals(): Promise<GovernmentProposal[]> {
  try {
    const { data, error } = await supabase
      .from('government_proposals')
      .select(`*, users (id, full_name, avatar_url, bio, role, created_at)`)
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!data) return []

    return (data as (GovProposalRow & { users: Pick<UserRow, 'id' | 'full_name' | 'avatar_url' | 'bio' | 'github_username' | 'twitter_username' | 'website_url' | 'role' | 'created_at'> | null })[] | null | undefined)?.map(row => ({
      id: row.id,
      title: row.title || '',
      titleAm: undefined,
      description: row.description || '',
      descriptionAm: undefined,
      budget: row.bid_amount ?? 0,
      timeline: row.timeline || '',
      requirements: row.requirements || [],
      userId: row.submitted_by,
      user: buildUser(row.users),
      status: row.status as GovernmentProposal['status'],
      submittedAt: new Date(row.created_at),
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
      reviewNotes: row.review_notes || undefined,
    })) || []
  } catch (err) {
    console.error('fetchGovernmentProposals with users join failed, retrying without join:', err)
    const { data, error } = await supabase
      .from('government_proposals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching government proposals:', error)
      return []
    }
    if (!data) return []

    return (data as GovProposalRow[] | null | undefined)?.map(row => ({
      id: row.id,
      title: row.title || '',
      titleAm: undefined,
      description: row.description || '',
      descriptionAm: undefined,
      budget: row.bid_amount ?? 0,
      timeline: row.timeline || '',
      requirements: row.requirements || [],
      userId: row.submitted_by,
      user: buildUser(null),
      status: row.status as GovernmentProposal['status'],
      submittedAt: new Date(row.created_at),
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
      reviewNotes: row.review_notes || undefined,
    })) || []
  }
}

export async function uploadImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'bin'
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('products')
    .upload(path, file, { upsert: false })

  if (uploadErr) throw uploadErr

  const { data: publicData } = supabase.storage.from('products').getPublicUrl(uploadData.path)
  return publicData.publicUrl
}

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'png'
  const path = `${userId}/avatar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const buckets = ['products', 'avatars']
  let lastError: unknown

  for (const bucket of buckets) {
    // Best-effort: try to ensure the bucket exists (only succeeds with admin/service_role key)
    try {
      await supabase.storage.createBucket(bucket, { public: true })
    } catch {
      // bucket may already exist or we lack permission to create it — continue
    }

    try {
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true })

      if (uploadErr) {
        lastError = uploadErr
        continue
      }

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path)
      return publicData.publicUrl
    } catch (e) {
      lastError = e
      continue
    }
  }

  // Final fallback: encode as data URL so the avatar feature still works even
  // without a configured storage bucket.
  console.warn('Storage upload failed, falling back to data URL:', lastError)
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function formatGithubUrl(input: string | undefined): string | undefined {
  if (!input) return undefined
  if (/^https?:\/\//i.test(input)) return input
  return `https://github.com/${input}`
}

export type AdminUser = {
  id: string
  full_name: string | null
  email: string | null
  role: 'regular' | 'government' | 'admin'
  avatar_url: string | null
  is_verified: boolean | null
  created_at: string
  products_count: number
  pledges_amount: number
}

export type AdminActivity = {
  id: string
  admin_id: string
  admin_name: string | null
  action: string
  entity_type: string
  entity_id: string | null
  details: string | null
  created_at: string
}

export type AdminSubscriber = {
  id: string
  email: string
  name: string | null
  source: string | null
  subscribed_at: string
}

export type AdminDashboardStats = {
  users_count: number
  products_count: number
  proposals_count: number
  pledges_count: number
  pledges_total: number
  reviews_count: number
  subscribers_count: number
  featured_campaigns_count: number
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('users')
    .select(`*, products:products(*), pledges:pledges(*)`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin users:', error)
    return []
  }
  if (!data) return []

  return (data as Array<{
    id: string
    full_name: string | null
    email: string | null
    role: string
    avatar_url: string | null
    is_verified: boolean | null
    created_at: string
    products: unknown[]
    pledges: unknown[]
  }>).map(row => ({
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role as 'regular' | 'government' | 'admin',
    avatar_url: row.avatar_url,
    is_verified: row.is_verified,
    created_at: row.created_at,
    products_count: Array.isArray(row.products) ? row.products.length : 0,
    pledges_amount: Array.isArray(row.pledges)
      ? (row.pledges as Array<{ amount?: number }>)?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
      : 0,
  }))
}

export async function updateUserRole(userId: string, role: 'regular' | 'government' | 'admin'): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) throw error
}

export async function fetchAdminActivityLog(): Promise<AdminActivity[]> {
  const { data, error } = await supabase
    .from('admin_activity_log')
    .select(`*, admin:users!inner(full_name)`)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching activity log:', error)
    return []
  }
  if (!data) return []

  return (data as Array<{
    id: string
    admin_id: string
    action: string
    entity_type: string
    entity_id: string | null
    details: string | null
    created_at: string
    admin: { full_name: string | null }
  }>).map(row => ({
    id: row.id,
    admin_id: row.admin_id,
    admin_name: row.admin?.full_name ?? null,
    action: row.action,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    details: row.details,
    created_at: row.created_at,
  }))
}

export async function fetchAdminSubscribers(): Promise<AdminSubscriber[]> {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false })

  if (error) {
    console.error('Error fetching subscribers:', error)
    return []
  }
  if (!data) return []

  return data as AdminSubscriber[]
}

export async function fetchAdminStats(): Promise<AdminDashboardStats> {
  const [
    usersRes,
    productsRes,
    proposalsRes,
    pledgesRes,
    reviewsRes,
    subscribersRes,
    campaignsRes,
  ] = await Promise.all([
    supabase.from('users').select('!', { count: 'exact' }),
    supabase.from('products').select('!', { count: 'exact', head: true }),
    supabase.from('government_proposals').select('!', { count: 'exact', head: true }),
    supabase.from('pledges').select('amount', { count: 'exact' }),
    supabase.from('reviews').select('!', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('!', { count: 'exact', head: true }),
    supabase.from('featured_campaigns').select('!', { count: 'exact', head: true }),
  ])

  const pledgesAmount = (pledgesRes.data || []).reduce((sum: number, p: { amount?: number }) => sum + (Number(p.amount) || 0), 0)

  return {
    users_count: usersRes.count ?? 0,
    products_count: productsRes.count ?? 0,
    proposals_count: proposalsRes.count ?? 0,
    pledges_count: pledgesRes.count ?? 0,
    pledges_total: pledgesAmount,
    reviews_count: reviewsRes.count ?? 0,
    subscribers_count: subscribersRes.count ?? 0,
    featured_campaigns_count: campaignsRes.count ?? 0,
  }
}

export async function fetchAllProductsAdmin(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      users (
        id,
        full_name,
        avatar_url,
        bio,
        github_username,
        twitter_username,
        website_url,
        role,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin products:', error)
    return []
  }
  if (!data) return []

  return (data as ProductJoin[] | null | undefined)?.map(transformProduct) || []
}

export async function fetchAllProposalsAdmin(): Promise<GovernmentProposal[]> {
  const { data, error } = await supabase
    .from('government_proposals')
    .select(`*, users (id, full_name, avatar_url, bio, role, created_at)`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin proposals:', error)
    return []
  }
  if (!data) return []

  return (data as (GovProposalRow & { users: ProductJoin['users'] | null })[] | null | undefined)?.map(row => ({
    id: row.id,
    title: row.title || '',
    titleAm: undefined,
    description: row.description || '',
    descriptionAm: undefined,
    budget: row.bid_amount ?? 0,
    timeline: row.timeline || '',
    requirements: row.requirements || [],
    userId: row.submitted_by,
    user: buildUser(row.users),
    status: (row.status === 'accepted' ? 'accepted' : row.status === 'declined' ? 'declined' : row.status === 'under_review' ? 'under_review' : 'submitted') as GovernmentProposal['status'],
    submittedAt: new Date(row.created_at),
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
    reviewNotes: row.review_notes || undefined,
  })) || []
}
