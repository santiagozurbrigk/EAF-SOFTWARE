// ============================================================
// Tipos generados automáticamente desde Supabase
// Proyecto: eaf-software (uxjdglgoqgsxyqmvavrm)
// Regenerar con: npx supabase gen types typescript --project-id uxjdglgoqgsxyqmvavrm
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.15'
  }
  public: {
    Tables: {
      eaf_ad_sets: {
        Row: {
          campaign_id: string
          created_at: string
          exclusion_audience_id: string | null
          id: string
          meta_adset_id: string | null
          status: string
          target_cold_interests: Json | null
          video_variant_id: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          exclusion_audience_id?: string | null
          id?: string
          meta_adset_id?: string | null
          status?: string
          target_cold_interests?: Json | null
          video_variant_id?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          exclusion_audience_id?: string | null
          id?: string
          meta_adset_id?: string | null
          status?: string
          target_cold_interests?: Json | null
          video_variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'eaf_ad_sets_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'eaf_campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'eaf_ad_sets_video_variant_id_fkey'
            columns: ['video_variant_id']
            isOneToOne: false
            referencedRelation: 'video_variants'
            referencedColumns: ['id']
          },
        ]
      }
      eaf_campaigns: {
        Row: {
          budget: number
          budget_type: Database['public']['Enums']['budget_type']
          created_at: string
          id: string
          meta_campaign_id: string | null
          name: string
          status: string
          system_type: Database['public']['Enums']['campaign_type']
          user_id: string
        }
        Insert: {
          budget: number
          budget_type?: Database['public']['Enums']['budget_type']
          created_at?: string
          id?: string
          meta_campaign_id?: string | null
          name: string
          status?: string
          system_type: Database['public']['Enums']['campaign_type']
          user_id: string
        }
        Update: {
          budget?: number
          budget_type?: Database['public']['Enums']['budget_type']
          created_at?: string
          id?: string
          meta_campaign_id?: string | null
          name?: string
          status?: string
          system_type?: Database['public']['Enums']['campaign_type']
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'eaf_campaigns_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      lazarus_campaigns: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          status: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          status?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          status?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'lazarus_campaigns_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      lazarus_pulses: {
        Row: {
          asset_offered: Database['public']['Enums']['pulse_asset_type']
          campaign_id: string
          created_at: string
          id: string
          lead_email: string
          lead_id: string
          lead_name: string
          lead_phone: string | null
          responded_at: string | null
          scheduled_for: string
          sent_at: string | null
          status: Database['public']['Enums']['pulse_status']
        }
        Insert: {
          asset_offered: Database['public']['Enums']['pulse_asset_type']
          campaign_id: string
          created_at?: string
          id?: string
          lead_email: string
          lead_id: string
          lead_name: string
          lead_phone?: string | null
          responded_at?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: Database['public']['Enums']['pulse_status']
        }
        Update: {
          asset_offered?: Database['public']['Enums']['pulse_asset_type']
          campaign_id?: string
          created_at?: string
          id?: string
          lead_email?: string
          lead_id?: string
          lead_name?: string
          lead_phone?: string | null
          responded_at?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: Database['public']['Enums']['pulse_status']
        }
        Relationships: [
          {
            foreignKeyName: 'lazarus_pulses_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'lazarus_campaigns'
            referencedColumns: ['id']
          },
        ]
      }
      master_videos: {
        Row: {
          created_at: string
          id: string
          instagram_media_id: string | null
          is_winner: boolean | null
          organic_engagement_rate: number | null
          organic_views: number | null
          raw_video_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          instagram_media_id?: string | null
          is_winner?: boolean | null
          organic_engagement_rate?: number | null
          organic_views?: number | null
          raw_video_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instagram_media_id?: string | null
          is_winner?: boolean | null
          organic_engagement_rate?: number | null
          organic_views?: number | null
          raw_video_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'master_videos_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          joined_at: string
          organization_id: string
          profile_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          organization_id: string
          profile_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          organization_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'organization_members_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_members_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          ghl_access_token: string | null
          ghl_location_id: string | null
          ghl_refresh_token: string | null
          id: string
          meta_business_id: string | null
          meta_oauth_token: string | null
          name: string
          owner_id: string
          status: Database['public']['Enums']['account_status']
        }
        Insert: {
          created_at?: string
          ghl_access_token?: string | null
          ghl_location_id?: string | null
          ghl_refresh_token?: string | null
          id?: string
          meta_business_id?: string | null
          meta_oauth_token?: string | null
          name: string
          owner_id: string
          status?: Database['public']['Enums']['account_status']
        }
        Update: {
          created_at?: string
          ghl_access_token?: string | null
          ghl_location_id?: string | null
          ghl_refresh_token?: string | null
          id?: string
          meta_business_id?: string | null
          meta_oauth_token?: string | null
          name?: string
          owner_id?: string
          status?: Database['public']['Enums']['account_status']
        }
        Relationships: [
          {
            foreignKeyName: 'organizations_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database['public']['Enums']['user_role']
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database['public']['Enums']['user_role']
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database['public']['Enums']['user_role']
        }
        Relationships: []
      }
      video_variants: {
        Row: {
          audio_track_url: string | null
          created_at: string
          font_style: string | null
          hook_text: string | null
          id: string
          master_video_id: string
          processed_video_url: string | null
          status: Database['public']['Enums']['video_variant_status']
          variant_number: number
        }
        Insert: {
          audio_track_url?: string | null
          created_at?: string
          font_style?: string | null
          hook_text?: string | null
          id?: string
          master_video_id: string
          processed_video_url?: string | null
          status?: Database['public']['Enums']['video_variant_status']
          variant_number: number
        }
        Update: {
          audio_track_url?: string | null
          created_at?: string
          font_style?: string | null
          hook_text?: string | null
          id?: string
          master_video_id?: string
          processed_video_url?: string | null
          status?: Database['public']['Enums']['video_variant_status']
          variant_number?: number
        }
        Relationships: [
          {
            foreignKeyName: 'video_variants_master_video_id_fkey'
            columns: ['master_video_id']
            isOneToOne: false
            referencedRelation: 'master_videos'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      account_status: 'pending_activation' | 'active' | 'suspended'
      budget_type: 'ABO' | 'CBO'
      campaign_type:
        | 'sintonizador'
        | 'filtro_banda'
        | 'bucle_resonancia'
        | 'emisor_pulsos'
      pulse_asset_type: 'pdf_case_study' | 'video_breakout' | 'spreadsheet_roi'
      pulse_status: 'queued' | 'sent' | 'responded' | 'failed'
      user_role: 'member' | 'super_admin'
      video_variant_status: 'pending' | 'processing' | 'completed' | 'failed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ─── Helpers de conveniencia ──────────────────────────────────────────────────

type PublicSchema = Database['public']

/** Tipo Row de cualquier tabla pública */
export type Tables<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Row']

/** Tipo Row de cualquier enum público */
export type Enums<T extends keyof PublicSchema['Enums']> =
  PublicSchema['Enums'][T]

export const Constants = {
  public: {
    Enums: {
      account_status: ['pending_activation', 'active', 'suspended'],
      budget_type: ['ABO', 'CBO'],
      campaign_type: [
        'sintonizador',
        'filtro_banda',
        'bucle_resonancia',
        'emisor_pulsos',
      ],
      pulse_asset_type: ['pdf_case_study', 'video_breakout', 'spreadsheet_roi'],
      pulse_status: ['queued', 'sent', 'responded', 'failed'],
      user_role: ['member', 'super_admin'],
      video_variant_status: ['pending', 'processing', 'completed', 'failed'],
    },
  },
} as const
