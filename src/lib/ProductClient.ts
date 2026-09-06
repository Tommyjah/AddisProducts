import { supabase } from './supabase'

// Helper: fetch all products with user profile joined
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      profiles (
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
  return (data || []).map(transformProduct)
}

function transformProduct(row: any): any {
  return {
    id: row.id,
    title: row.title,
    titleAm: row.title_am,
    description: row.description,
    descriptionAm: row.description_am,
    image: row.image_url || '',
    website: row.website_url,
    github: row.github_url,
    category: row.category,
    tags: row.tags || [],
    votes: row.votes_count || 0,
    rating: row.avg_rating || 0,
    reviewCount: row.review_count || 0,
    userId: row.user_id,
    user: {
      id: row.profiles?.id || '',
      name: row.profiles?.full_name || 'Unknown',
      email: '',
      avatar: row.profiles?.avatar_url || '',
      role: row.profiles?.role || 'regular',
      bio: row.profiles?.bio,
      github: row.profiles?.github_username,
      twitter: row.profiles?.twitter_username,
      website: row.profiles?.website_url,
      joinedAt: new Date(row.profiles?.created_at || ''),
    },
    createdAt: new Date(row.created_at),
    isFeatured: row.is_featured || false,
    fundingGoal: row.funding_goal || 0,
    currentFunding: row.current_funding || 0,
    status: row.status,
    governmentOnly: row.government_only || false,
    pledgersCount: row.pledgers_count || 0,
    collaborators: [],
  }
}

export async function fetchProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      profiles (
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

  if (error) throw error
  return transformProduct(data)
}

export async function createProduct(data: any, userId: string) {
  const { data: result, error } = await supabase
    .from('products')
    .insert([{ ...data, user_id: userId, is_featured: false }])
    .select()
    .single()

  if (error) throw error
  return result
}

export async function voteProduct(productId: string, userId: string) {
  const { data: existing } = await supabase
    .from('votes')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    await supabase.from('votes').delete().eq('id', existing.id)
    return 'removed'
  } else {
    await supabase.from('votes').insert({
      product_id: productId,
      user_id: userId,
      vote_type: 'up',
    })
    return 'added'
  }
}

export async function submitReview(productId: string, userId: string, rating: number, comment: string) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{ product_id: productId, user_id: userId, rating, comment }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function fetchReviews(productId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`*, profiles (id, full_name, avatar_url)`)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(r => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    helpful: r.helpful_count || 0,
    userId: r.user_id,
    user: {
      id: r.profiles?.id || '',
      name: r.profiles?.full_name || 'User',
      avatar: r.profiles?.avatar_url || '',
    },
    productId,
    createdAt: new Date(r.created_at),
  }))
}

export async function createPledge(productId: string, userId: string, amount: number, message?: string) {
  const { data, error } = await supabase
    .from('pledges')
    .insert([{ product_id: productId, user_id: userId, amount, message: message || null, status: 'pledged' }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function fetchPledges(productId: string) {
  const { data, error } = await supabase
    .from('pledges')
    .select(`*, profiles (id, full_name, avatar_url)`)
    .eq('product_id', productId)
    .eq('status', 'pledged')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createCollaborationRequest(productId: string, userId: string, data: any) {
  const { result, error } = await supabase
    .from('collaboration_requests')
    .insert([{ product_id: productId, user_id: userId, ...data, status: 'pending' }])
    .select()
    .single()

  if (error) throw error
  return result
}

// Government proposals table (separate from products — seeded separately)
export async function fetchGovernmentProposals() {
  const { data, error } = await supabase
    .from('government_proposals')
    .select(`*, profiles (id, full_name, avatar_url, bio, role, created_at)`)
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Error fetching government proposals:', error)
    return []
  }

  if (!data) return []

  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    titleAm: row.title_am,
    description: row.description,
    descriptionAm: row.description_am,
    budget: row.budget,
    timeline: row.timeline,
    requirements: row.requirements || [],
    userId: row.user_id,
    user: {
      id: row.profiles?.id || '',
      name: row.profiles?.full_name || 'Unknown',
      email: '',
      avatar: row.profiles?.avatar_url || '',
      role: row.profiles?.role || 'regular',
      bio: row.profiles?.bio,
      joinedAt: new Date(row.profiles?.created_at || ''),
    },
    status: row.status as 'submitted' | 'under_review' | 'accepted' | 'declined',
    submittedAt: new Date(row.submitted_at || row.created_at),
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
    reviewNotes: row.review_notes,
  }))
}
