import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User } from '../types'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  profile: any | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGitHub: () => Promise<void>
  isLoading: boolean
  updateProfile: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper: fetch or create user profile in public.users
async function upsertUser(userId: string, email: string) {
  // Check if user exists
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (existing) return existing

  // Create user record
  const { error } = await supabase
    .from('users')
    .insert({
      id: userId,
      full_name: 'User',
      email: email,
      role: 'regular',
      bio: '',
      avatar_url: '',
      github_username: '',
      twitter_username: '',
      website_url: '',
    })

  if (error) {
    console.error('Error creating user record:', error)
    return null
  }

  // Fetch the newly created record
  const { data: created } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  return created
}

function buildUser(record: any, email: string): User {
  return {
    id: record.id,
    name: record.full_name || 'User',
    email: email || '',
    avatar: record.avatar_url || '',
    role: record.role || 'regular',
    bio: record.bio,
    github: record.github_username,
    twitter: record.twitter_username,
    website: record.website_url,
    joinedAt: new Date(record.created_at),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session?.user) {
          const userId = data.session.user.id
          const email = data.session.user.email

          const record = await upsertUser(userId, email)
          if (record) {
            setProfile(record)
            setUser(buildUser(record, email))
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          const userId = session.user.id
          const email = session.user.email

          const record = await upsertUser(userId, email)
          if (record) {
            setProfile(record)
            setUser(buildUser(record, email))
          }
        } else {
          setUser(null)
          setProfile(null)
        }
      })()
    })

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const userId = data.user.id
        const email = data.user.email

        const record = await upsertUser(userId, email)
        if (record) {
          setProfile(record)
          setUser(buildUser(record, email))
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGitHub = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('GitHub login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: any) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { error } = await supabase
        .from('users')
        .update({
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          bio: data.bio,
          github_username: data.github_username,
          twitter_username: data.twitter_username,
          website_url: data.website_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      const updated = { ...profile, ...data }
      setProfile(updated)
      setUser({
        ...user,
        name: data.full_name,
        avatar: data.avatar_url,
        bio: data.bio,
        github: data.github_username,
        twitter: data.twitter_username,
        website: data.website_url,
      })
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        login,
        logout,
        loginWithGoogle,
        loginWithGitHub,
        isLoading,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
