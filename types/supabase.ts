export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      task_submissions: {
        Row: {
          id: string
          user_id: string
          task_id: string
          answer: string
          reward: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          answer: string
          reward: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          answer?: string
          reward?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_balances: {
        Row: {
          user_id: string
          usdc_balance: number
          pending_balance: number
          total_earned: number
          updated_at: string
        }
        Insert: {
          user_id: string
          usdc_balance?: number
          pending_balance?: number
          total_earned?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          usdc_balance?: number
          pending_balance?: number
          total_earned?: number
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'TASK_REWARD' | 'WITHDRAWAL' | 'INVESTMENT'
          amount: number
          status: 'PENDING' | 'COMPLETED' | 'FAILED'
          description: string | null
          created_at: string
          metadata: Record<string, any> | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'TASK_REWARD' | 'WITHDRAWAL' | 'INVESTMENT'
          amount: number
          status: 'PENDING' | 'COMPLETED' | 'FAILED'
          description?: string | null
          created_at?: string
          metadata?: Record<string, any> | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'TASK_REWARD' | 'WITHDRAWAL' | 'INVESTMENT'
          amount?: number
          status?: 'PENDING' | 'COMPLETED' | 'FAILED'
          description?: string | null
          created_at?: string
          metadata?: Record<string, any> | null
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