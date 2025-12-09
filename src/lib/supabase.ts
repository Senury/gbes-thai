// Re-export the supabase client from the integration
export { supabase } from '@/integrations/supabase/client'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          company: string | null
          phone: string | null
          service_plan: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          company?: string | null
          phone?: string | null
          service_plan?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          company?: string | null
          phone?: string | null
          service_plan?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          company: string | null
          phone: string | null
          service: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          company?: string | null
          phone?: string | null
          service: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          email?: string
          company?: string | null
          phone?: string | null
          service?: string
          created_at?: string
        }
      }
    }
  }
}