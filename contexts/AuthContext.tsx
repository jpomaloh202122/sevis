'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  nationalId: string
  phone: string
  photoUrl?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: 'user' | 'admin') => Promise<boolean>
  loginWithUser: (userData: any) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem('sevis_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: 'user' | 'admin'): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // This function is now deprecated - use loginWithUser instead
      // All authentication should go through the database
      console.warn('Direct login method is deprecated. Use database authentication instead.')
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithUser = async (userData: any): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Convert database user format to our User interface
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        nationalId: userData.national_id || '',
        phone: userData.phone,
        photoUrl: userData.photo_url
      }
      
      setUser(user)
      localStorage.setItem('sevis_user', JSON.stringify(user))
      return true
    } catch (error) {
      console.error('Login with user failed:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('sevis_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithUser, logout, isLoading }}>
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