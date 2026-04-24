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
          full_name: string | null
          email: string | null
          avatar_url: string | null
          role: 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'member'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      contacts: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          notes: string | null
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          notes?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          notes?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      pipelines: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      stages: {
        Row: {
          id: string
          pipeline_id: string | null
          name: string
          color: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          pipeline_id?: string | null
          name: string
          color?: string
          position: number
          created_at?: string
        }
        Update: {
          id?: string
          pipeline_id?: string | null
          name?: string
          color?: string
          position?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          }
        ]
      }
      deals: {
        Row: {
          id: string
          title: string
          value: number
          currency: string
          status: 'open' | 'won' | 'lost'
          stage_id: string | null
          pipeline_id: string | null
          contact_id: string | null
          owner_id: string | null
          lost_reason: string | null
          expected_close_date: string | null
          notes: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          value?: number
          currency?: string
          status?: 'open' | 'won' | 'lost'
          stage_id?: string | null
          pipeline_id?: string | null
          contact_id?: string | null
          owner_id?: string | null
          lost_reason?: string | null
          expected_close_date?: string | null
          notes?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          value?: number
          currency?: string
          status?: 'open' | 'won' | 'lost'
          stage_id?: string | null
          pipeline_id?: string | null
          contact_id?: string | null
          owner_id?: string | null
          lost_reason?: string | null
          expected_close_date?: string | null
          notes?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      activities: {
        Row: {
          id: string
          deal_id: string | null
          user_id: string | null
          type: 'note' | 'call' | 'email' | 'meeting' | 'status_change'
          content: string | null
          created_at: string
        }
        Insert: {
          id?: string
          deal_id?: string | null
          user_id?: string | null
          type: 'note' | 'call' | 'email' | 'meeting' | 'status_change'
          content?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          deal_id?: string | null
          user_id?: string | null
          type?: 'note' | 'call' | 'email' | 'meeting' | 'status_change'
          content?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
