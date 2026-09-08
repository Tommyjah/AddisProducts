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
    throw error
  }

  return transformProduct(data as ProductJoin)
}

export async function createProduct(input: ProductInput, userId: string): Promise<Product> {
  const payload: Record<string, unknown> = {
    ...input,
    user_id: userId,
    is_featured: false,
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

  if (error) throw error
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
    if (delErr) throw delErr
  } else {
    const { error: insErr } = await supabase
      .from('votes')
      .insert([{ product_id: productId, user_id: userId, vote_type: 'up' }] as never)
    if (insErr) throw insErr
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

  if (error) throw error
  return transformReview(data as ReviewJoin)
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`*, users (id, full_name, avatar_url)`)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) throw error
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
  const { data, error } = await supabase
    .from('government_proposals')
    .select(`*, users (id, full_name, avatar_url, bio, role, created_at)`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching government proposals:', error)
    return []
  }

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

export function formatGithubUrl(input: string | undefined): string | undefined {
  if (!input) return undefined
  if (/^https?:\/\//i.test(input)) return input
  return `https://github.com/${input}`
}
