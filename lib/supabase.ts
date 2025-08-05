import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from '@/config/supabase-config'

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'user' | 'admin'
          national_id: string
          phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'user' | 'admin'
          national_id: string
          phone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'user' | 'admin'
          national_id?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          service_name: string
          status: 'pending' | 'in_progress' | 'completed' | 'rejected'
          application_data: any
          submitted_at: string
          updated_at: string
          reference_number: string
        }
        Insert: {
          id?: string
          user_id: string
          service_name: string
          status?: 'pending' | 'in_progress' | 'completed' | 'rejected'
          application_data: any
          submitted_at?: string
          updated_at?: string
          reference_number?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_name?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'rejected'
          application_data?: any
          submitted_at?: string
          updated_at?: string
          reference_number?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          category: string
          description: string
          requirements: string[]
          processing_time: string
          fee: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description: string
          requirements: string[]
          processing_time: string
          fee: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string
          requirements?: string[]
          processing_time?: string
          fee?: number
          is_active?: boolean
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