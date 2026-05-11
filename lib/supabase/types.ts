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
      profiles: {
        Row: {
          id: string
          username: string | null
          points_balance: number
          streak_count: number
          last_checkin_at: string | null
          wallet_address: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          points_balance?: number
          streak_count?: number
          last_checkin_at?: string | null
          wallet_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          points_balance?: number
          streak_count?: number
          last_checkin_at?: string | null
          wallet_address?: string | null
          created_at?: string
        }
      }
      quests: {
        Row: {
          id: string
          title: string
          description: string | null
          points_reward: number
          type: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          points_reward?: number
          type: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          points_reward?: number
          type?: string
          is_active?: boolean
          created_at?: string
        }
      }
      quest_completions: {
        Row: {
          id: string
          user_id: string
          quest_id: string
          points_earned: number | null
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quest_id: string
          points_earned?: number | null
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quest_id?: string
          points_earned?: number | null
          completed_at?: string
        }
      }
      rewards: {
        Row: {
          id: string
          title: string
          description: string | null
          points_cost: number
          stock: number | null
          image_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          points_cost?: number
          stock?: number | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          points_cost?: number
          stock?: number | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      redemptions: {
        Row: {
          id: string
          user_id: string
          reward_id: string
          points_spent: number
          redeemed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reward_id: string
          points_spent: number
          redeemed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reward_id?: string
          points_spent?: number
          redeemed_at?: string
        }
      }
    }
  }
}
