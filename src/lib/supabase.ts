import { SupabaseClient, Session, User } from '@supabase/supabase-js'

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          title: string
          title_am: string | null
          description: string
          description_am: string | null
          image_url: string | null
          gallery_urls: string[] | null
          website_url: string | null
          github_url: string | null
          category: string
          tags: string[] | null
          funding_goal: number | null
          current_funding: number | null
          status: 'active' | 'funding' | 'completed'
          is_featured: boolean
          government_only: boolean
          user_id: string
          created_at: string
          updated_at: string
          votes_count: number | null
          avg_rating: number | null
          review_count: number | null
          pledgers_count: number | null
        }
        Insert: {
          id?: string
          title: string
          title_am?: string
          description: string
          description_am?: string
          image_url?: string
          gallery_urls?: string[]
          website_url?: string
          github_url?: string
          category: string
          tags?: string[]
          funding_goal?: number
          current_funding?: number
          status?: 'active' | 'funding' | 'completed'
          is_featured?: boolean
          government_only?: boolean
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          title_am?: string
          description?: string
          description_am?: string
          image_url?: string
          gallery_urls?: string[]
          website_url?: string
          github_url?: string
          category?: string
          tags?: string[]
          funding_goal?: number
          current_funding?: number
          status?: 'active' | 'funding' | 'completed'
          is_featured?: boolean
          government_only?: boolean
          user_id?: string
        }
      }
      users: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          github_username: string | null
          twitter_username: string | null
          linkedin_url: string | null
          website_url: string | null
          role: 'regular' | 'government' | 'admin'
          email: string | null
          is_verified: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string
          bio?: string
          github_username?: string
          twitter_username?: string
          linkedin_url?: string
          website_url?: string
          role?: 'regular' | 'government' | 'admin'
          email?: string
          is_verified?: boolean
        }
        Update: {
          full_name?: string
          avatar_url?: string
          bio?: string
          github_username?: string
          twitter_username?: string
          linkedin_url?: string
          website_url?: string
          role?: 'regular' | 'government' | 'admin'
          email?: string
          is_verified?: boolean
        }
      }
      votes: {
        Row: {
          id: string
          product_id: string
          user_id: string
          vote_type: 'up' | 'down'
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          vote_type: 'up' | 'down'
        }
        Update: {
          vote_type?: 'up' | 'down'
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          comment: string
          helpful_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          comment: string
          helpful_count?: number
        }
        Update: {
          rating?: number
          comment?: string
          helpful_count?: number
        }
      }
      pledges: {
        Row: {
          id: string
          product_id: string
          user_id: string
          amount: number
          message: string | null
          status: 'pledged' | 'paid' | 'cancelled'
          chapa_transaction_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          amount: number
          message?: string
          status?: 'pledged' | 'paid' | 'cancelled'
          chapa_transaction_id?: string
        }
        Update: {
          amount?: number
          message?: string
          status?: 'pledged' | 'paid' | 'cancelled'
          chapa_transaction_id?: string
        }
      }
      collaboration_requests: {
        Row: {
          id: string
          product_id: string
          user_id: string
          role: string
          message: string
          experience: string | null
          portfolio_url: string | null
          availability: string | null
          status: 'pending' | 'accepted' | 'declined'
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          role: string
          message: string
          experience?: string
          portfolio_url?: string
          availability?: string
          status?: 'pending' | 'accepted' | 'declined'
        }
        Update: {
          status?: 'pending' | 'accepted' | 'declined'
        }
      }
      user_projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          image_url: string | null
          category: string | null
          tags: string[] | null
          status: string
          funding_goal: number | null
          current_funding: number | null
          website_url: string | null
          github_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          image_url?: string
          category?: string
          tags?: string[]
          status?: string
          funding_goal?: number
          current_funding?: number
          website_url?: string
          github_url?: string
        }
        Update: {
          title?: string
          description?: string
          image_url?: string
          category?: string
          tags?: string[]
          status?: string
          funding_goal?: number
          current_funding?: number
          website_url?: string
          github_url?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Helper types for auth
export type { Session, User }
export type SupabaseClientType = SupabaseClient<Database>

// Helper to get a typed supabase client
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
