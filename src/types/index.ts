export type UserRole = 'regular' | 'government' | 'admin'
export type Language = 'en' | 'am'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: UserRole
  bio?: string
  github?: string
  twitter?: string
  website?: string
  joinedAt: Date
}

export interface Product {
  id: string
  title: string
  titleAm?: string
  description: string
  descriptionAm?: string
  image: string
  galleryUrls: string[]
  website?: string
  github?: string
  category: string
  tags: string[]
  votes: number
  rating: number
  reviewCount: number
  userId: string
  user: User
  createdAt: Date
  isFeatured: boolean
  fundingGoal: number
  currentFunding: number
  pledgersCount: number
  status: 'active' | 'funding' | 'completed'
  governmentOnly: boolean
  collaborators: User[]
}

export interface Review {
  id: string
  rating: number
  comment: string
  userId: string
  user: Pick<User, 'id' | 'name' | 'avatar'>
  productId: string
  createdAt: Date
  helpful: number
}

export interface Vote {
  id: string
  userId: string
  productId: string
  voteType: 'up' | 'down'
  createdAt: Date
}

export interface Pledge {
  id: string
  productId: string
  userId: string
  amount: number
  message?: string
  status: 'pledged' | 'paid' | 'cancelled'
  createdAt: Date
  user?: Pick<User, 'id' | 'name' | 'avatar'>
}

export interface CollaborationRequest {
  id: string
  productId: string
  userId: string
  role: string
  message: string
  experience?: string
  portfolioUrl?: string
  availability?: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: Date
}

export interface GovernmentProposal {
  id: string
  title: string
  titleAm?: string
  description: string
  descriptionAm?: string
  budget: number
  timeline: string
  requirements: string[]
  userId: string
  user: User
  status: 'submitted' | 'under_review' | 'accepted' | 'declined'
  submittedAt: Date
  reviewedAt?: Date
  reviewNotes?: string
}

export interface VoteState {
  voted: boolean
  votesCount: number
}

export interface ProductInput {
  title: string
  titleAm?: string
  description: string
  descriptionAm?: string
  imageUrl?: string
  galleryUrls?: string[]
  websiteUrl?: string
  githubUrl?: string
  category: string
  tags?: string[]
  fundingGoal?: number
  status?: 'active' | 'funding' | 'completed'
}

export type UserProfile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  github_username: string | null
  twitter_username: string | null
  linkedin_url: string | null
  website_url: string | null
  role: UserRole
  email: string | null
  is_verified: boolean | null
  created_at: string
  updated_at: string
}
