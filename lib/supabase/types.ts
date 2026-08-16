/**
 * Tipos TypeScript del schema de Supabase para EAF.
 * Generados manualmente del schema SQL — actualizar con:
 *   npx supabase gen types typescript --project-id <ID> > lib/supabase/types.ts
 */

export type UserRole = 'member' | 'super_admin'
export type AccountStatus = 'pending_activation' | 'active' | 'suspended'
export type CampaignType = 'sintonizador' | 'filtro_banda' | 'bucle_resonancia' | 'emisor_pulsos'
export type VideoVariantStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type PulseStatus = 'queued' | 'sent' | 'responded' | 'failed'
export type PulseAssetType = 'pdf_case_study' | 'video_breakout' | 'spreadsheet_roi'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: UserRole
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      organizations: {
        Row: {
          id: string
          name: string
          owner_id: string
          status: AccountStatus
          meta_oauth_token: string | null
          meta_business_id: string | null
          ghl_access_token: string | null
          ghl_refresh_token: string | null
          ghl_location_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          profile_id: string
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['organization_members']['Row'], 'id' | 'joined_at'>
        Update: never
      }
      master_videos: {
        Row: {
          id: string
          user_id: string
          instagram_media_id: string | null
          raw_video_url: string
          organic_views: number
          organic_engagement_rate: number | null
          is_winner: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['master_videos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['master_videos']['Insert']>
      }
      video_variants: {
        Row: {
          id: string
          master_video_id: string
          variant_number: number
          hook_text: string | null
          font_style: string | null
          audio_track_url: string | null
          processed_video_url: string | null
          status: VideoVariantStatus
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['video_variants']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['video_variants']['Insert']>
      }
      eaf_campaigns: {
        Row: {
          id: string
          user_id: string
          meta_campaign_id: string | null
          name: string
          system_type: CampaignType
          budget: number
          budget_type: 'ABO' | 'CBO'
          status: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['eaf_campaigns']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['eaf_campaigns']['Insert']>
      }
      lazarus_campaigns: {
        Row: {
          id: string
          organization_id: string
          name: string
          status: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['lazarus_campaigns']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['lazarus_campaigns']['Insert']>
      }
      lazarus_pulses: {
        Row: {
          id: string
          campaign_id: string
          lead_id: string
          lead_name: string
          lead_phone: string | null
          lead_email: string
          asset_offered: PulseAssetType
          status: PulseStatus
          scheduled_for: string
          sent_at: string | null
          responded_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['lazarus_pulses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['lazarus_pulses']['Insert']>
      }
    }
  }
}
