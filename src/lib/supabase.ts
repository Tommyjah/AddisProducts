import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          title: string
          description: string
          image: string
          total_funding: number
          funding_goal: number
          avg_rating: number
          review_count: number
          user_id: string
          created_at: string
          government_only: boolean
        }
        Insert: {
          id?: string
          title: string
          description: string
          image: string
          total_funding?: number
          funding_goal?: number
          avg_rating?: number
          review_count?: number
          user_id: string
          created_at?: string
          government_only?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image?: string
          total_funding?: number
          funding_goal?: number
          avg_rating?: number
          review_count?: number
          user_id?: string
          created_at?: string
          government_only?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string
          bio: string
          github_username: string
          linkedin_url: string
          role: 'regular' | 'government' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string
          bio?: string
          github_username?: string
          linkedin_url?: string
          role?: 'regular' | 'government' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string
          bio?: string
          github_username?: string
          linkedin_url?: string
          role?: 'regular' | 'government' | 'admin'
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          user_id: string
          product_id: string
          vote_type: 'up' | 'down'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          vote_type: 'up' | 'down'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          vote_type?: 'up' | 'down'
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          product_id: string
          rating: number
          comment: string
          helpful_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          rating: number
          comment: string
          helpful_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          rating?: number
          comment?: string
          helpful_count?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          product_id: string
          amount: number
          payment_method: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          amount: number
          payment_method: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          amount?: number
          payment_method?: string
          status?: string
          created_at?: string
        }
      }
      collaboration_requests: {
        Row: {
          id: string
          user_id: string
          product_id: string
          role: string
          message: string
          experience: string
          portfolio_url: string
          availability: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          role: string
          message: string
          experience: string
          portfolio_url?: string
          availability: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          role?: string
          message?: string
          experience?: string
          portfolio_url?: string
          availability?: string
          status?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
