import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { User } from '../types'
import { UserProfile } from '../types'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGitHub: () => Promise<void>
  isLoading: boolean
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface UpsertProfilePayload {
  id: string
  full_name: string
  email?: string | null
  role?: string
  bio?: string
  avatar_url?: string
  github_username?: string
  twitter_username?: string
  website_url?: string
}

async function upsertUser(userId: string, email?: string): Promise<UserProfile | null> {
  const payload: UpsertProfilePayload = {
    id: userId,
    full_name: 'User',
    email: email || null,
    role: 'regular',
    bio: '',
    avatar_url: '',
    github_username: '',
    twitter_username: '',
    website_url: '',
  }

  const tables = ['users', 'profiles'] as const

  for (const table of tables) {
    try {
      const { data: existing } = await supabase
        .from(table)
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (existing) return existing as UserProfile

      const { error } = await supabase.from(table).insert([payload] as never)

      if (error) {
        console.error(`Error creating user record in ${table}:`, error)
        continue
      }

      const { data: created } = await supabase
        .from(table)
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (created) return created as UserProfile
    } catch (err) {
      console.error(`Error upserting user in ${table}:`, err)
    }
  }

  return null
}

function buildUser(record: UserProfile | null, email?: string): User {
  return {
    id: record?.id || '',
    name: record?.full_name || 'User',
    email: email || record?.email || '',
    avatar: record?.avatar_url || '',
    role: (record?.role as User['role']) || 'regular',
    bio: record?.bio || '',
    github: record?.github_username || '',
    twitter: record?.twitter_username || '',
    website: record?.website_url || '',
    joinedAt: new Date(record?.created_at || ''),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async (userId: string, email?: string) => {
    const record = await upsertUser(userId, email)
    if (record) {
      setProfile(record)
      setUser(buildUser(record, email))
    } else {
      console.warn('Could not load or create user profile, using auth data only')
      setUser({
        id: userId,
        name: 'User',
        email: email || '',
        avatar: '',
        role: 'regular',
        bio: '',
        github: '',
        twitter: '',
        website: '',
        joinedAt: new Date(),
      })
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session?.user) {
          const userId = data.session.user.id
          const email = data.session.user.email
          await loadUser(userId, email)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const userId = session.user.id
          const email = session.user.email
          await loadUser(userId, email)
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
  }, [loadUser])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        await loadUser(data.user.id, data.user.email)
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        console.error('Google login error:', error)
        throw error
      }
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        console.error('GitHub login error:', error)
        throw error
      }
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

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('No user logged in')

      const tables = ['users', 'profiles'] as const
      let lastError: Error | null = null

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .update({
            full_name: data.full_name,
            avatar_url: data.avatar_url,
            bio: data.bio,
            github_username: data.github_username,
            twitter_username: data.twitter_username,
            website_url: data.website_url,
            updated_at: new Date().toISOString(),
          } as never)
          .eq('id', user.id)

        if (!error) {
          const updated = { ...profile, ...data } as UserProfile
          setProfile(updated)
          setUser({
            ...user,
            name: data.full_name || user.name,
            avatar: data.avatar_url || user.avatar,
            bio: data.bio || user.bio,
            github: data.github_username || user.github,
            twitter: data.twitter_username || user.twitter,
            website: data.website_url || user.website,
          })
          return
        }

        lastError = error as Error
      }

      throw lastError || new Error('Failed to update profile')
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
