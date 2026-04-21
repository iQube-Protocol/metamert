export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      access_requests: {
        Row: {
          created_at: string
          id: number
          owner_address: string
          requester_address: string
          status: string
          token_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          owner_address: string
          requester_address: string
          status?: string
          token_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          owner_address?: string
          requester_address?: string
          status?: string
          token_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_requests_token_fk"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "iqubes"
            referencedColumns: ["token_id"]
          },
        ]
      }
      agent_keys: {
        Row: {
          agent_id: string
          agent_name: string
          btc_address: string | null
          btc_private_key_encrypted: string | null
          created_at: string | null
          entity_type: string | null
          evm_address: string | null
          evm_private_key_encrypted: string | null
          fio_handle: string | null
          id: string
          key_version: number | null
          last_used_at: string | null
          persona_id: string | null
          solana_address: string | null
          solana_private_key_encrypted: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          agent_name: string
          btc_address?: string | null
          btc_private_key_encrypted?: string | null
          created_at?: string | null
          entity_type?: string | null
          evm_address?: string | null
          evm_private_key_encrypted?: string | null
          fio_handle?: string | null
          id?: string
          key_version?: number | null
          last_used_at?: string | null
          persona_id?: string | null
          solana_address?: string | null
          solana_private_key_encrypted?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          agent_name?: string
          btc_address?: string | null
          btc_private_key_encrypted?: string | null
          created_at?: string | null
          entity_type?: string | null
          evm_address?: string | null
          evm_private_key_encrypted?: string | null
          fio_handle?: string | null
          id?: string
          key_version?: number | null
          last_used_at?: string | null
          persona_id?: string | null
          solana_address?: string | null
          solana_private_key_encrypted?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_keys_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "agent_keys_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_keys_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_keys_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_keys_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_cards: {
        Row: {
          card_type: string
          content: string | null
          created_at: string | null
          experience_id: string | null
          id: string
          persona_id: string
          score: number | null
        }
        Insert: {
          card_type: string
          content?: string | null
          created_at?: string | null
          experience_id?: string | null
          id?: string
          persona_id: string
          score?: number | null
        }
        Update: {
          card_type?: string
          content?: string | null
          created_at?: string | null
          experience_id?: string | null
          id?: string
          persona_id?: string
          score?: number | null
        }
        Relationships: []
      }
      asset_policies: {
        Row: {
          asset_id: string
          created_at: string | null
          id: string
          pay_to_did: string
          price_amount: number | null
          price_asset: string | null
          rights: string[]
          tokenqube_template: string | null
          visibility: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          id?: string
          pay_to_did: string
          price_amount?: number | null
          price_asset?: string | null
          rights?: string[]
          tokenqube_template?: string | null
          visibility?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          id?: string
          pay_to_did?: string
          price_amount?: number | null
          price_asset?: string | null
          rights?: string[]
          tokenqube_template?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_policies_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "content_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      avl_comms_packs: {
        Row: {
          active: boolean
          audience_type: string
          comms_type: string
          created_at: string
          cta_options: Json | null
          id: string
          send_rules: Json | null
          slug: string
          subject_lines: Json | null
          template_markdown: string | null
          title: string
        }
        Insert: {
          active?: boolean
          audience_type: string
          comms_type: string
          created_at?: string
          cta_options?: Json | null
          id?: string
          send_rules?: Json | null
          slug: string
          subject_lines?: Json | null
          template_markdown?: string | null
          title: string
        }
        Update: {
          active?: boolean
          audience_type?: string
          comms_type?: string
          created_at?: string
          cta_options?: Json | null
          id?: string
          send_rules?: Json | null
          slug?: string
          subject_lines?: Json | null
          template_markdown?: string | null
          title?: string
        }
        Relationships: []
      }
      avl_partner_contacts: {
        Row: {
          assigned_agent: string
          audience_overlap_notes: string | null
          bd_stage: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          first_contact_at: string | null
          id: string
          last_contact_at: string | null
          name: string
          next_action: string | null
          notes: string | null
          org: string
          outreach_status: string
          response_signal: string | null
          strategic_value_tier: number | null
          updated_at: string
          wave: number
        }
        Insert: {
          assigned_agent?: string
          audience_overlap_notes?: string | null
          bd_stage?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          first_contact_at?: string | null
          id?: string
          last_contact_at?: string | null
          name: string
          next_action?: string | null
          notes?: string | null
          org: string
          outreach_status?: string
          response_signal?: string | null
          strategic_value_tier?: number | null
          updated_at?: string
          wave: number
        }
        Update: {
          assigned_agent?: string
          audience_overlap_notes?: string | null
          bd_stage?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          first_contact_at?: string | null
          id?: string
          last_contact_at?: string | null
          name?: string
          next_action?: string | null
          notes?: string | null
          org?: string
          outreach_status?: string
          response_signal?: string | null
          strategic_value_tier?: number | null
          updated_at?: string
          wave?: number
        }
        Relationships: []
      }
      avl_partner_stage_events: {
        Row: {
          changed_at: string
          changed_by: string | null
          from_stage: string | null
          id: string
          notes: string | null
          partner_id: string
          to_stage: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          from_stage?: string | null
          id?: string
          notes?: string | null
          partner_id: string
          to_stage: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          from_stage?: string | null
          id?: string
          notes?: string | null
          partner_id?: string
          to_stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "avl_partner_stage_events_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "avl_partner_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_statements: {
        Row: {
          closing_balance: number | null
          created_at: string
          file_name: string
          file_path: string
          id: string
          parsed_at: string
          period_end: string | null
          period_start: string | null
          user_id: string
        }
        Insert: {
          closing_balance?: number | null
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          parsed_at?: string
          period_end?: string | null
          period_start?: string | null
          user_id: string
        }
        Update: {
          closing_balance?: number | null
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          parsed_at?: string
          period_end?: string | null
          period_start?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaign_events: {
        Row: {
          campaign_id: string
          content_id: string | null
          created_at: string | null
          dvn_message_id: string | null
          event_type: string
          franchise_id: string | null
          id: string
          metadata: Json | null
          persona_id: string
          referrer_persona_id: string | null
          source: string | null
          tenant_id: string | null
        }
        Insert: {
          campaign_id: string
          content_id?: string | null
          created_at?: string | null
          dvn_message_id?: string | null
          event_type: string
          franchise_id?: string | null
          id?: string
          metadata?: Json | null
          persona_id: string
          referrer_persona_id?: string | null
          source?: string | null
          tenant_id?: string | null
        }
        Update: {
          campaign_id?: string
          content_id?: string | null
          created_at?: string | null
          dvn_message_id?: string | null
          event_type?: string
          franchise_id?: string | null
          id?: string
          metadata?: Json | null
          persona_id?: string
          referrer_persona_id?: string | null
          source?: string | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      campaign_states: {
        Row: {
          campaign_id: string
          current_phase_id: string | null
          franchise_id: string
          id: string
          persona_id: string
          progress: number | null
          state: Json
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          current_phase_id?: string | null
          franchise_id: string
          id?: string
          persona_id: string
          progress?: number | null
          state?: Json
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          current_phase_id?: string | null
          franchise_id?: string
          id?: string
          persona_id?: string
          progress?: number | null
          state?: Json
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      canonical_bundles: {
        Row: {
          blak_qube_id: string | null
          cid: string
          created_at: string | null
          encryption_alg: string
          episode_number: number
          id: string
          issue_id: string
          key_wrap_alg: string | null
          meta_qube_id: string | null
          mime_type: string
          owner_id: string
          updated_at: string | null
          user_token_qube_id: string | null
          wrapped_key: string | null
        }
        Insert: {
          blak_qube_id?: string | null
          cid: string
          created_at?: string | null
          encryption_alg: string
          episode_number: number
          id?: string
          issue_id: string
          key_wrap_alg?: string | null
          meta_qube_id?: string | null
          mime_type: string
          owner_id: string
          updated_at?: string | null
          user_token_qube_id?: string | null
          wrapped_key?: string | null
        }
        Update: {
          blak_qube_id?: string | null
          cid?: string
          created_at?: string | null
          encryption_alg?: string
          episode_number?: number
          id?: string
          issue_id?: string
          key_wrap_alg?: string | null
          meta_qube_id?: string | null
          mime_type?: string
          owner_id?: string
          updated_at?: string | null
          user_token_qube_id?: string | null
          wrapped_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "canonical_bundles_blak_qube_id_fkey"
            columns: ["blak_qube_id"]
            isOneToOne: false
            referencedRelation: "iq_blak_qubes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canonical_bundles_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: true
            referencedRelation: "user_issue_qubes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canonical_bundles_meta_qube_id_fkey"
            columns: ["meta_qube_id"]
            isOneToOne: false
            referencedRelation: "iq_meta_qubes"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          agent_id: string
          created_at: string
          franchise_id: string | null
          id: string
          messages: Json
          metadata: Json | null
          persona_id: string | null
          session_id: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string
          created_at?: string
          franchise_id?: string | null
          id?: string
          messages?: Json
          metadata?: Json | null
          persona_id?: string | null
          session_id: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          franchise_id?: string | null
          id?: string
          messages?: Json
          metadata?: Json | null
          persona_id?: string | null
          session_id?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_history_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "chat_history_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_history_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_history_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_history_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          amount_qcent: number
          claimant_did: string
          created_at: string | null
          id: string
          iqube_id: string
          redeem_to: string | null
          rights: string[] | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount_qcent: number
          claimant_did: string
          created_at?: string | null
          id?: string
          iqube_id: string
          redeem_to?: string | null
          rights?: string[] | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_qcent?: number
          claimant_did?: string
          created_at?: string | null
          id?: string
          iqube_id?: string
          redeem_to?: string | null
          rights?: string[] | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      codex_characters: {
        Row: {
          affiliation: string | null
          base: string | null
          created_at: string
          digiterra_name: string | null
          height: string | null
          id: string
          origin_ethnicity: string | null
          profile: string | null
          series: string
          terra_name: string | null
          updated_at: string
          weight: string | null
        }
        Insert: {
          affiliation?: string | null
          base?: string | null
          created_at?: string
          digiterra_name?: string | null
          height?: string | null
          id: string
          origin_ethnicity?: string | null
          profile?: string | null
          series?: string
          terra_name?: string | null
          updated_at?: string
          weight?: string | null
        }
        Update: {
          affiliation?: string | null
          base?: string | null
          created_at?: string
          digiterra_name?: string | null
          height?: string | null
          id?: string
          origin_ethnicity?: string | null
          profile?: string | null
          series?: string
          terra_name?: string | null
          updated_at?: string
          weight?: string | null
        }
        Relationships: []
      }
      codex_cluster_children: {
        Row: {
          child_id: string
          child_type: string
          cluster_id: string | null
          created_at: string | null
          display_order: number | null
          id: string
        }
        Insert: {
          child_id: string
          child_type: string
          cluster_id?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
        }
        Update: {
          child_id?: string
          child_type?: string
          cluster_id?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "codex_cluster_children_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "codex_cluster_qubes"
            referencedColumns: ["id"]
          },
        ]
      }
      codex_cluster_qubes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          meta_qube_id: string | null
          name: string
          series: string
          total_covers: number | null
          total_episodes: number | null
          total_media_assets: number | null
          total_motion_masters: number | null
          total_still_masters: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          meta_qube_id?: string | null
          name: string
          series: string
          total_covers?: number | null
          total_episodes?: number | null
          total_media_assets?: number | null
          total_motion_masters?: number | null
          total_still_masters?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          meta_qube_id?: string | null
          name?: string
          series?: string
          total_covers?: number | null
          total_episodes?: number | null
          total_media_assets?: number | null
          total_motion_masters?: number | null
          total_still_masters?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "codex_cluster_qubes_meta_qube_id_fkey"
            columns: ["meta_qube_id"]
            isOneToOne: false
            referencedRelation: "iq_meta_qubes"
            referencedColumns: ["id"]
          },
        ]
      }
      codex_configs: {
        Row: {
          created_at: string
          enabled: boolean | null
          id: string
          liquid_ui: Json | null
          metadata: Json
          name: string
          owner: string
          permissions: Json
          slug: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          id: string
          liquid_ui?: Json | null
          metadata?: Json
          name: string
          owner: string
          permissions?: Json
          slug: string
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          id?: string
          liquid_ui?: Json | null
          metadata?: Json
          name?: string
          owner?: string
          permissions?: Json
          slug?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      codex_episode_credits: {
        Row: {
          animation: string | null
          artists: string | null
          broadcast: string | null
          colorists: string | null
          copy_editing: string | null
          created_at: string
          creators: string | null
          episode_id: string | null
          graphics_and_digital_edits: string | null
          id: string
          length_raw: string | null
          letterers: string | null
          series: string
          updated_at: string
          writers: string | null
        }
        Insert: {
          animation?: string | null
          artists?: string | null
          broadcast?: string | null
          colorists?: string | null
          copy_editing?: string | null
          created_at?: string
          creators?: string | null
          episode_id?: string | null
          graphics_and_digital_edits?: string | null
          id: string
          length_raw?: string | null
          letterers?: string | null
          series?: string
          updated_at?: string
          writers?: string | null
        }
        Update: {
          animation?: string | null
          artists?: string | null
          broadcast?: string | null
          colorists?: string | null
          copy_editing?: string | null
          created_at?: string
          creators?: string | null
          episode_id?: string | null
          graphics_and_digital_edits?: string | null
          id?: string
          length_raw?: string | null
          letterers?: string | null
          series?: string
          updated_at?: string
          writers?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "codex_episode_credits_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "codex_episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      codex_episodes: {
        Row: {
          additional_writers: string | null
          artist: string | null
          colorist: string | null
          cover_ref: string | null
          created_at: string
          distribution_channel: string | null
          editorial_note: string | null
          end_quote: string | null
          episode_number: number | null
          episode_number_raw: string | null
          id: string
          intro_quote: string | null
          is_current: boolean
          issue_number: string | null
          knytcard_focus: string | null
          letterer: string | null
          season_number: string | null
          series: string
          synopsis: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          additional_writers?: string | null
          artist?: string | null
          colorist?: string | null
          cover_ref?: string | null
          created_at?: string
          distribution_channel?: string | null
          editorial_note?: string | null
          end_quote?: string | null
          episode_number?: number | null
          episode_number_raw?: string | null
          id: string
          intro_quote?: string | null
          is_current?: boolean
          issue_number?: string | null
          knytcard_focus?: string | null
          letterer?: string | null
          season_number?: string | null
          series?: string
          synopsis?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          additional_writers?: string | null
          artist?: string | null
          colorist?: string | null
          cover_ref?: string | null
          created_at?: string
          distribution_channel?: string | null
          editorial_note?: string | null
          end_quote?: string | null
          episode_number?: number | null
          episode_number_raw?: string | null
          id?: string
          intro_quote?: string | null
          is_current?: boolean
          issue_number?: string | null
          knytcard_focus?: string | null
          letterer?: string | null
          season_number?: string | null
          series?: string
          synopsis?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      codex_kb_chunks: {
        Row: {
          character_refs: string[] | null
          chunk_index: number
          chunk_type: string | null
          content: string
          created_at: string | null
          document_id: string
          embedding: string | null
          id: string
          location_refs: string[] | null
          page_number: number | null
          section_title: string | null
          token_count: number | null
          word_count: number | null
        }
        Insert: {
          character_refs?: string[] | null
          chunk_index: number
          chunk_type?: string | null
          content: string
          created_at?: string | null
          document_id: string
          embedding?: string | null
          id?: string
          location_refs?: string[] | null
          page_number?: number | null
          section_title?: string | null
          token_count?: number | null
          word_count?: number | null
        }
        Update: {
          character_refs?: string[] | null
          chunk_index?: number
          chunk_type?: string | null
          content?: string
          created_at?: string | null
          document_id?: string
          embedding?: string | null
          id?: string
          location_refs?: string[] | null
          page_number?: number | null
          section_title?: string | null
          token_count?: number | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "codex_kb_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "codex_kb_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      codex_kb_documents: {
        Row: {
          chunk_count: number | null
          content_category: string | null
          created_at: string | null
          domain: string
          episode_number: number | null
          extracted_at: string | null
          extraction_error: string | null
          extraction_status: string | null
          id: string
          metadata: Json | null
          page_count: number | null
          series: string | null
          source_cid: string | null
          source_id: string | null
          source_type: string
          tags: string[] | null
          title: string
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          chunk_count?: number | null
          content_category?: string | null
          created_at?: string | null
          domain?: string
          episode_number?: number | null
          extracted_at?: string | null
          extraction_error?: string | null
          extraction_status?: string | null
          id?: string
          metadata?: Json | null
          page_count?: number | null
          series?: string | null
          source_cid?: string | null
          source_id?: string | null
          source_type: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          chunk_count?: number | null
          content_category?: string | null
          created_at?: string | null
          domain?: string
          episode_number?: number | null
          extracted_at?: string | null
          extraction_error?: string | null
          extraction_status?: string | null
          id?: string
          metadata?: Json | null
          page_count?: number | null
          series?: string | null
          source_cid?: string | null
          source_id?: string | null
          source_type?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      codex_kb_entities: {
        Row: {
          aliases: string[] | null
          canonical_id: string | null
          created_at: string | null
          description: string | null
          document_count: number | null
          domain: string
          entity_type: string
          id: string
          mention_count: number | null
          metadata: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          aliases?: string[] | null
          canonical_id?: string | null
          created_at?: string | null
          description?: string | null
          document_count?: number | null
          domain?: string
          entity_type: string
          id?: string
          mention_count?: number | null
          metadata?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          aliases?: string[] | null
          canonical_id?: string | null
          created_at?: string | null
          description?: string | null
          document_count?: number | null
          domain?: string
          entity_type?: string
          id?: string
          mention_count?: number | null
          metadata?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      codex_kb_entity_mentions: {
        Row: {
          chunk_id: string
          context_snippet: string | null
          created_at: string | null
          entity_id: string
          id: string
          mention_text: string | null
        }
        Insert: {
          chunk_id: string
          context_snippet?: string | null
          created_at?: string | null
          entity_id: string
          id?: string
          mention_text?: string | null
        }
        Update: {
          chunk_id?: string
          context_snippet?: string | null
          created_at?: string | null
          entity_id?: string
          id?: string
          mention_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "codex_kb_entity_mentions_chunk_id_fkey"
            columns: ["chunk_id"]
            isOneToOne: false
            referencedRelation: "codex_kb_chunks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "codex_kb_entity_mentions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "codex_kb_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      codex_kb_queries: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          persona_id: string | null
          query_text: string
          result_chunk_ids: string[] | null
          result_count: number | null
          search_duration_ms: number | null
          session_id: string | null
          user_role: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string
          id?: string
          persona_id?: string | null
          query_text: string
          result_chunk_ids?: string[] | null
          result_count?: number | null
          search_duration_ms?: number | null
          session_id?: string | null
          user_role?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          persona_id?: string | null
          query_text?: string
          result_chunk_ids?: string[] | null
          result_count?: number | null
          search_duration_ms?: number | null
          session_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      codex_knyt_cards: {
        Row: {
          character_id: string | null
          created_at: string
          first_appearance: string | null
          id: string
          powers: string | null
          primary_weapon: string | null
          secondary_weapons: string | null
          series: string
          updated_at: string
        }
        Insert: {
          character_id?: string | null
          created_at?: string
          first_appearance?: string | null
          id: string
          powers?: string | null
          primary_weapon?: string | null
          secondary_weapons?: string | null
          series?: string
          updated_at?: string
        }
        Update: {
          character_id?: string | null
          created_at?: string
          first_appearance?: string | null
          id?: string
          powers?: string | null
          primary_weapon?: string | null
          secondary_weapons?: string | null
          series?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "codex_knyt_cards_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "codex_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      codex_media_assets: {
        Row: {
          asset_kind: Database["public"]["Enums"]["codex_asset_kind"]
          auto_drive_cid: string
          blak_qube_id: string | null
          cover_thumb_url: string | null
          created_at: string | null
          display_mode:
            | Database["public"]["Enums"]["content_display_mode"]
            | null
          edition_max: number | null
          edition_minted: number | null
          encryption_alg: string
          encryption_auth_tag: string | null
          encryption_iv: string
          episode_number: number | null
          extracted_text: string | null
          file_size: number | null
          id: string
          is_shareable: boolean | null
          meta_qube_id: string | null
          mime_type: string
          page_count: number | null
          pages_count: number | null
          pages_ready: boolean | null
          pdf_lite_url: string | null
          random_weight: number | null
          rarity_tier: string | null
          recommended_task: string | null
          series: string | null
          status: string | null
          title: string
          token_qube_id: string | null
          updated_at: string | null
          variant_name: string | null
        }
        Insert: {
          asset_kind: Database["public"]["Enums"]["codex_asset_kind"]
          auto_drive_cid: string
          blak_qube_id?: string | null
          cover_thumb_url?: string | null
          created_at?: string | null
          display_mode?:
            | Database["public"]["Enums"]["content_display_mode"]
            | null
          edition_max?: number | null
          edition_minted?: number | null
          encryption_alg?: string
          encryption_auth_tag?: string | null
          encryption_iv: string
          episode_number?: number | null
          extracted_text?: string | null
          file_size?: number | null
          id?: string
          is_shareable?: boolean | null
          meta_qube_id?: string | null
          mime_type: string
          page_count?: number | null
          pages_count?: number | null
          pages_ready?: boolean | null
          pdf_lite_url?: string | null
          random_weight?: number | null
          rarity_tier?: string | null
          recommended_task?: string | null
          series?: string | null
          status?: string | null
          title: string
          token_qube_id?: string | null
          updated_at?: string | null
          variant_name?: string | null
        }
        Update: {
          asset_kind?: Database["public"]["Enums"]["codex_asset_kind"]
          auto_drive_cid?: string
          blak_qube_id?: string | null
          cover_thumb_url?: string | null
          created_at?: string | null
          display_mode?:
            | Database["public"]["Enums"]["content_display_mode"]
            | null
          edition_max?: number | null
          edition_minted?: number | null
          encryption_alg?: string
          encryption_auth_tag?: string | null
          encryption_iv?: string
          episode_number?: number | null
          extracted_text?: string | null
          file_size?: number | null
          id?: string
          is_shareable?: boolean | null
          meta_qube_id?: string | null
          mime_type?: string
          page_count?: number | null
          pages_count?: number | null
          pages_ready?: boolean | null
          pdf_lite_url?: string | null
          random_weight?: number | null
          rarity_tier?: string | null
          recommended_task?: string | null
          series?: string | null
          status?: string | null
          title?: string
          token_qube_id?: string | null
          updated_at?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "codex_media_assets_blak_qube_id_fkey"
            columns: ["blak_qube_id"]
            isOneToOne: false
            referencedRelation: "iq_blak_qubes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "codex_media_assets_meta_qube_id_fkey"
            columns: ["meta_qube_id"]
            isOneToOne: false
            referencedRelation: "iq_meta_qubes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "codex_media_assets_token_qube_id_fkey"
            columns: ["token_qube_id"]
            isOneToOne: false
            referencedRelation: "iq_token_qubes"
            referencedColumns: ["id"]
          },
        ]
      }
      codex_motion_segments: {
        Row: {
          auto_drive_cid: string
          blak_qube_id: string | null
          created_at: string | null
          duration_seconds: number | null
          episode_id: string
          file_size: number | null
          id: string
          is_preview: boolean | null
          mime_type: string | null
          price_knyt: number | null
          segment_number: number
          title: string | null
          token_qube_id: string | null
          updated_at: string | null
        }
        Insert: {
          auto_drive_cid: string
          blak_qube_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          episode_id: string
          file_size?: number | null
          id?: string
          is_preview?: boolean | null
          mime_type?: string | null
          price_knyt?: number | null
          segment_number?: number
          title?: string | null
          token_qube_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_drive_cid?: string
          blak_qube_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          episode_id?: string
          file_size?: number | null
          id?: string
          is_preview?: boolean | null
          mime_type?: string | null
          price_knyt?: number | null
          segment_number?: number
          title?: string | null
          token_qube_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      codex_tabs: {
        Row: {
          codex_id: string
          config: Json
          created_at: string
          enabled: boolean | null
          id: string
          label: string
          metadata: Json | null
          order: number
          slug: string
          type: string
          updated_at: string
        }
        Insert: {
          codex_id: string
          config?: Json
          created_at?: string
          enabled?: boolean | null
          id: string
          label: string
          metadata?: Json | null
          order: number
          slug: string
          type: string
          updated_at?: string
        }
        Update: {
          codex_id?: string
          config?: Json
          created_at?: string
          enabled?: boolean | null
          id?: string
          label?: string
          metadata?: Json | null
          order?: number
          slug?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "codex_tabs_codex_id_fkey"
            columns: ["codex_id"]
            isOneToOne: false
            referencedRelation: "codex_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_membership: {
        Row: {
          cohort_id: string
          commitment: string
          created_at: string | null
          epoch: number
          risk_tier: number
        }
        Insert: {
          cohort_id: string
          commitment: string
          created_at?: string | null
          epoch: number
          risk_tier: number
        }
        Update: {
          cohort_id?: string
          commitment?: string
          created_at?: string | null
          epoch?: number
          risk_tier?: number
        }
        Relationships: []
      }
      composer_experience_qubes: {
        Row: {
          blak_qube: Json
          created_at: string | null
          creator_id: string
          id: string
          meta_qube: Json
          status: string
          template_id: string
          tenant_id: string
          token_qube: Json
          updated_at: string | null
        }
        Insert: {
          blak_qube?: Json
          created_at?: string | null
          creator_id: string
          id: string
          meta_qube?: Json
          status?: string
          template_id: string
          tenant_id: string
          token_qube?: Json
          updated_at?: string | null
        }
        Update: {
          blak_qube?: Json
          created_at?: string | null
          creator_id?: string
          id?: string
          meta_qube?: Json
          status?: string
          template_id?: string
          tenant_id?: string
          token_qube?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      composer_sessions: {
        Row: {
          created_at: string | null
          current_step: number
          data: Json
          expires_at: string | null
          id: string
          status: string
          template_id: string
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_step?: number
          data?: Json
          expires_at?: string | null
          id: string
          status?: string
          template_id: string
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_step?: number
          data?: Json
          expires_at?: string | null
          id?: string
          status?: string
          template_id?: string
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          campaign: string | null
          consent: boolean | null
          created_at: string
          email: string
          id: string
          name: string | null
          source: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          campaign?: string | null
          consent?: boolean | null
          created_at?: string
          email: string
          id?: string
          name?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          campaign?: string | null
          consent?: boolean | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      content: {
        Row: {
          ai_metadata: Json | null
          author_id: string | null
          author_type: string | null
          content: Json
          created_at: string | null
          domain: string
          duration: string | null
          event_data: Json | null
          excerpt: string | null
          format: string
          id: string
          issue_ref: string | null
          layout_type: string | null
          logos_sidebar: Json | null
          market_data: Json | null
          modalities: Json | null
          placement: Json | null
          published_at: string | null
          related_content: string[] | null
          share_count: number | null
          slug: string | null
          status: string | null
          tags: string[] | null
          thumbnail: string | null
          title: string
          type: string
          updated_at: string | null
          verification_did: string | null
          verification_proof: Json | null
        }
        Insert: {
          ai_metadata?: Json | null
          author_id?: string | null
          author_type?: string | null
          content?: Json
          created_at?: string | null
          domain: string
          duration?: string | null
          event_data?: Json | null
          excerpt?: string | null
          format: string
          id?: string
          issue_ref?: string | null
          layout_type?: string | null
          logos_sidebar?: Json | null
          market_data?: Json | null
          modalities?: Json | null
          placement?: Json | null
          published_at?: string | null
          related_content?: string[] | null
          share_count?: number | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          title: string
          type: string
          updated_at?: string | null
          verification_did?: string | null
          verification_proof?: Json | null
        }
        Update: {
          ai_metadata?: Json | null
          author_id?: string | null
          author_type?: string | null
          content?: Json
          created_at?: string | null
          domain?: string
          duration?: string | null
          event_data?: Json | null
          excerpt?: string | null
          format?: string
          id?: string
          issue_ref?: string | null
          layout_type?: string | null
          logos_sidebar?: Json | null
          market_data?: Json | null
          modalities?: Json | null
          placement?: Json | null
          published_at?: string | null
          related_content?: string[] | null
          share_count?: number | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          verification_did?: string | null
          verification_proof?: Json | null
        }
        Relationships: []
      }
      content_assets: {
        Row: {
          bytes: number | null
          created_at: string | null
          description: string | null
          id: string
          media_kind: string | null
          owner_did: string
          registry_ref: string | null
          sha256: string | null
          status: string | null
          storage_uri: string
          tags: string[] | null
          tenant_id: string
          title: string | null
        }
        Insert: {
          bytes?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          media_kind?: string | null
          owner_did: string
          registry_ref?: string | null
          sha256?: string | null
          status?: string | null
          storage_uri: string
          tags?: string[] | null
          tenant_id: string
          title?: string | null
        }
        Update: {
          bytes?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          media_kind?: string | null
          owner_did?: string
          registry_ref?: string | null
          sha256?: string | null
          status?: string | null
          storage_uri?: string
          tags?: string[] | null
          tenant_id?: string
          title?: string | null
        }
        Relationships: []
      }
      content_entitlements: {
        Row: {
          acquired_at: string
          acquired_via: Database["public"]["Enums"]["entitlement_acquisition"]
          capability_token: string | null
          chain_id: number | null
          content_id: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_usage: number | null
          persona_id: string
          revoke_reason: string | null
          revoked_at: string | null
          root_did: string | null
          scope: Database["public"]["Enums"]["entitlement_scope"]
          token_qube_id: string | null
          tx_hash: string | null
          usage_count: number
        }
        Insert: {
          acquired_at?: string
          acquired_via: Database["public"]["Enums"]["entitlement_acquisition"]
          capability_token?: string | null
          chain_id?: number | null
          content_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_usage?: number | null
          persona_id: string
          revoke_reason?: string | null
          revoked_at?: string | null
          root_did?: string | null
          scope: Database["public"]["Enums"]["entitlement_scope"]
          token_qube_id?: string | null
          tx_hash?: string | null
          usage_count?: number
        }
        Update: {
          acquired_at?: string
          acquired_via?: Database["public"]["Enums"]["entitlement_acquisition"]
          capability_token?: string | null
          chain_id?: number | null
          content_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_usage?: number | null
          persona_id?: string
          revoke_reason?: string | null
          revoked_at?: string | null
          root_did?: string | null
          scope?: Database["public"]["Enums"]["entitlement_scope"]
          token_qube_id?: string | null
          tx_hash?: string | null
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_entitlements_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "smart_content_qubes"
            referencedColumns: ["id"]
          },
        ]
      }
      content_library: {
        Row: {
          added_at: string
          completed: boolean
          completed_at: string | null
          content_id: string
          custom_shelf_id: string | null
          id: string
          is_favorite: boolean
          last_accessed_at: string | null
          persona_id: string
          position: number
          progress_percentage: number
          root_did: string | null
          shelf_name: string
          time_spent_seconds: number
          updated_at: string
          user_notes: string | null
          user_rating: number | null
        }
        Insert: {
          added_at?: string
          completed?: boolean
          completed_at?: string | null
          content_id: string
          custom_shelf_id?: string | null
          id?: string
          is_favorite?: boolean
          last_accessed_at?: string | null
          persona_id: string
          position?: number
          progress_percentage?: number
          root_did?: string | null
          shelf_name?: string
          time_spent_seconds?: number
          updated_at?: string
          user_notes?: string | null
          user_rating?: number | null
        }
        Update: {
          added_at?: string
          completed?: boolean
          completed_at?: string | null
          content_id?: string
          custom_shelf_id?: string | null
          id?: string
          is_favorite?: boolean
          last_accessed_at?: string | null
          persona_id?: string
          position?: number
          progress_percentage?: number
          root_did?: string | null
          shelf_name?: string
          time_spent_seconds?: number
          updated_at?: string
          user_notes?: string | null
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_library_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "smart_content_qubes"
            referencedColumns: ["id"]
          },
        ]
      }
      content_progress: {
        Row: {
          content_id: string
          id: string
          modality: Database["public"]["Enums"]["content_modality"]
          persona_id: string
          progress_max: number | null
          progress_type: string
          progress_value: number
          recorded_at: string
          session_duration_seconds: number | null
          session_id: string | null
          session_started_at: string | null
        }
        Insert: {
          content_id: string
          id?: string
          modality: Database["public"]["Enums"]["content_modality"]
          persona_id: string
          progress_max?: number | null
          progress_type: string
          progress_value: number
          recorded_at?: string
          session_duration_seconds?: number | null
          session_id?: string | null
          session_started_at?: string | null
        }
        Update: {
          content_id?: string
          id?: string
          modality?: Database["public"]["Enums"]["content_modality"]
          persona_id?: string
          progress_max?: number | null
          progress_type?: string
          progress_value?: number
          recorded_at?: string
          session_duration_seconds?: number | null
          session_id?: string | null
          session_started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "smart_content_qubes"
            referencedColumns: ["id"]
          },
        ]
      }
      content_revisions: {
        Row: {
          content_id: string | null
          created_at: string | null
          created_by: string | null
          data: Json
          id: string
          version: number
        }
        Insert: {
          content_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data: Json
          id?: string
          version: number
        }
        Update: {
          content_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data?: Json
          id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_revisions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_revisions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "share_analytics_summary"
            referencedColumns: ["article_id"]
          },
        ]
      }
      content_series: {
        Row: {
          app: Database["public"]["Enums"]["smart_content_app"]
          cover_image_uri: string | null
          created_at: string
          creator_root_did: string
          description: string | null
          id: string
          published_count: number
          slug: string
          status: string
          tenant_id: string
          title: string
          total_planned: number | null
          updated_at: string
        }
        Insert: {
          app: Database["public"]["Enums"]["smart_content_app"]
          cover_image_uri?: string | null
          created_at?: string
          creator_root_did: string
          description?: string | null
          id?: string
          published_count?: number
          slug: string
          status?: string
          tenant_id: string
          title: string
          total_planned?: number | null
          updated_at?: string
        }
        Update: {
          app?: Database["public"]["Enums"]["smart_content_app"]
          cover_image_uri?: string | null
          created_at?: string
          creator_root_did?: string
          description?: string | null
          id?: string
          published_count?: number
          slug?: string
          status?: string
          tenant_id?: string
          title?: string
          total_planned?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_admin_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      crm_admin_role_audit: {
        Row: {
          action: string
          admin_role_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          performed_by_admin_role_id: string | null
          performed_by_kybe_did: string | null
          reason: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_role_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          performed_by_admin_role_id?: string | null
          performed_by_kybe_did?: string | null
          reason?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_role_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          performed_by_admin_role_id?: string | null
          performed_by_kybe_did?: string | null
          reason?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_admin_role_audit_admin_role_id_fkey"
            columns: ["admin_role_id"]
            isOneToOne: false
            referencedRelation: "crm_admin_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_admin_role_audit_admin_role_id_fkey"
            columns: ["admin_role_id"]
            isOneToOne: false
            referencedRelation: "crm_admin_roles_expanded"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_admin_role_audit_performed_by_admin_role_id_fkey"
            columns: ["performed_by_admin_role_id"]
            isOneToOne: false
            referencedRelation: "crm_admin_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_admin_role_audit_performed_by_admin_role_id_fkey"
            columns: ["performed_by_admin_role_id"]
            isOneToOne: false
            referencedRelation: "crm_admin_roles_expanded"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_admin_roles: {
        Row: {
          auth_profile_id: string | null
          category_id: string | null
          created_at: string | null
          expires_at: string | null
          franchise_id: string | null
          granted_at: string | null
          granted_by_admin_role_id: string | null
          id: string
          is_active: boolean | null
          kybe_did: string | null
          permissions: Json | null
          platform_account_id: string | null
          role_type: string
          suspended_at: string | null
          suspension_reason: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          auth_profile_id?: string | null
          category_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          franchise_id?: string | null
          granted_at?: string | null
          granted_by_admin_role_id?: string | null
          id?: string
          is_active?: boolean | null
          kybe_did?: string | null
          permissions?: Json | null
          platform_account_id?: string | null
          role_type: string
          suspended_at?: string | null
          suspension_reason?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_profile_id?: string | null
          category_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          franchise_id?: string | null
          granted_at?: string | null
          granted_by_admin_role_id?: string | null
          id?: string
          is_active?: boolean | null
          kybe_did?: string | null
          permissions?: Json | null
          platform_account_id?: string | null
          role_type?: string
          suspended_at?: string | null
          suspension_reason?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_admin_roles_auth_profile_id_fkey"
            columns: ["auth_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_auth_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_admin_roles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "crm_admin_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_admin_roles_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "crm_franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_admin_roles_granted_by_admin_role_id_fkey"
            columns: ["granted_by_admin_role_id"]
            isOneToOne: false
            referencedRelation: "crm_admin_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_admin_roles_granted_by_admin_role_id_fkey"
            columns: ["granted_by_admin_role_id"]
            isOneToOne: false
            referencedRelation: "crm_admin_roles_expanded"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_admin_roles_platform_account_id_fkey"
            columns: ["platform_account_id"]
            isOneToOne: false
            referencedRelation: "crm_platform_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_admin_roles_platform_account_id_fkey"
            columns: ["platform_account_id"]
            isOneToOne: false
            referencedRelation: "crm_user_account_layers"
            referencedColumns: ["platform_account_id"]
          },
          {
            foreignKeyName: "crm_admin_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_admin_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_hierarchy_view"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      crm_audit_logs: {
        Row: {
          action: string
          change_reason: string | null
          changed_by_agent_id: string | null
          changed_by_auth_profile_id: string | null
          changed_by_persona_id: string | null
          changed_fields: string[] | null
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          tenant_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          change_reason?: string | null
          changed_by_agent_id?: string | null
          changed_by_auth_profile_id?: string | null
          changed_by_persona_id?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          tenant_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          change_reason?: string | null
          changed_by_agent_id?: string | null
          changed_by_auth_profile_id?: string | null
          changed_by_persona_id?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          tenant_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_audit_logs_changed_by_auth_profile_id_fkey"
            columns: ["changed_by_auth_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_auth_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_audit_logs_changed_by_persona_id_fkey"
            columns: ["changed_by_persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_audit_logs_changed_by_persona_id_fkey"
            columns: ["changed_by_persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_auth_profile_emails: {
        Row: {
          auth_profile_id: string
          created_at: string
          email: string
          email_normalized: string
          id: string
          is_primary: boolean
          is_verified: boolean
          status: string
          updated_at: string
        }
        Insert: {
          auth_profile_id: string
          created_at?: string
          email: string
          email_normalized: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          auth_profile_id?: string
          created_at?: string
          email?: string
          email_normalized?: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_auth_profile_emails_auth_profile_id_fkey"
            columns: ["auth_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_auth_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_auth_profile_links: {
        Row: {
          active: boolean
          created_at: string
          id: string
          linked_auth_profile_id: string
          owner_auth_profile_id: string
          relationship_mode: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          linked_auth_profile_id: string
          owner_auth_profile_id: string
          relationship_mode?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          linked_auth_profile_id?: string
          owner_auth_profile_id?: string
          relationship_mode?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_auth_profile_links_linked_auth_profile_id_fkey"
            columns: ["linked_auth_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_auth_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_auth_profile_links_owner_auth_profile_id_fkey"
            columns: ["owner_auth_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_auth_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_auth_profile_personas: {
        Row: {
          alias: string | null
          auth_profile_id: string
          created_at: string
          id: string
          is_primary: boolean
          persona_id: string
        }
        Insert: {
          alias?: string | null
          auth_profile_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          persona_id: string
        }
        Update: {
          alias?: string | null
          auth_profile_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          persona_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_auth_profile_personas_auth_profile_id_fkey"
            columns: ["auth_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_auth_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_auth_profile_personas_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_auth_profile_personas_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_auth_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          email_verified: boolean
          id: string
          is_active: boolean
          kybe_did: string | null
          last_login_at: string | null
          oauth_providers: Json | null
          password_hash: string | null
          root_did_proxy_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          email_verified?: boolean
          id?: string
          is_active?: boolean
          kybe_did?: string | null
          last_login_at?: string | null
          oauth_providers?: Json | null
          password_hash?: string | null
          root_did_proxy_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          email_verified?: boolean
          id?: string
          is_active?: boolean
          kybe_did?: string | null
          last_login_at?: string | null
          oauth_providers?: Json | null
          password_hash?: string | null
          root_did_proxy_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_category_defaults: {
        Row: {
          category: string
          default_rep_community: number | null
          default_rep_creative: number | null
          default_rep_data_arch: number | null
          default_rep_entrepreneurial: number | null
          default_rep_technical: number | null
          default_reward_ratio_knyt: number | null
          default_reward_ratio_qct: number | null
          default_reward_ratio_qoyn: number | null
          description: string | null
        }
        Insert: {
          category: string
          default_rep_community?: number | null
          default_rep_creative?: number | null
          default_rep_data_arch?: number | null
          default_rep_entrepreneurial?: number | null
          default_rep_technical?: number | null
          default_reward_ratio_knyt?: number | null
          default_reward_ratio_qct?: number | null
          default_reward_ratio_qoyn?: number | null
          description?: string | null
        }
        Update: {
          category?: string
          default_rep_community?: number | null
          default_rep_creative?: number | null
          default_rep_data_arch?: number | null
          default_rep_entrepreneurial?: number | null
          default_rep_technical?: number | null
          default_reward_ratio_knyt?: number | null
          default_reward_ratio_qct?: number | null
          default_reward_ratio_qoyn?: number | null
          description?: string | null
        }
        Relationships: []
      }
      crm_contributions: {
        Row: {
          artifact_metadata: Json | null
          artifact_url: string | null
          base_pokw_weight: number
          clusterqube_id: string | null
          contribution_type: string
          created_at: string
          final_score: number | null
          id: string
          impact_level: number | null
          notes: string | null
          persona_id: string
          pokw_score: number
          pop_score: number | null
          por_score: number | null
          pos_score: number | null
          quality_score: number | null
          qube_id: string | null
          rejection_reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by_persona_id: string | null
          scoring_breakdown: Json | null
          source: string | null
          status: string | null
          task_template_id: string | null
          tenant_id: string
          trust_score: number | null
          units: number
        }
        Insert: {
          artifact_metadata?: Json | null
          artifact_url?: string | null
          base_pokw_weight?: number
          clusterqube_id?: string | null
          contribution_type: string
          created_at?: string
          final_score?: number | null
          id?: string
          impact_level?: number | null
          notes?: string | null
          persona_id: string
          pokw_score?: number
          pop_score?: number | null
          por_score?: number | null
          pos_score?: number | null
          quality_score?: number | null
          qube_id?: string | null
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by_persona_id?: string | null
          scoring_breakdown?: Json | null
          source?: string | null
          status?: string | null
          task_template_id?: string | null
          tenant_id: string
          trust_score?: number | null
          units?: number
        }
        Update: {
          artifact_metadata?: Json | null
          artifact_url?: string | null
          base_pokw_weight?: number
          clusterqube_id?: string | null
          contribution_type?: string
          created_at?: string
          final_score?: number | null
          id?: string
          impact_level?: number | null
          notes?: string | null
          persona_id?: string
          pokw_score?: number
          pop_score?: number | null
          por_score?: number | null
          pos_score?: number | null
          quality_score?: number | null
          qube_id?: string | null
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by_persona_id?: string | null
          scoring_breakdown?: Json | null
          source?: string | null
          status?: string | null
          task_template_id?: string | null
          tenant_id?: string
          trust_score?: number | null
          units?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_contributions_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contributions_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contributions_reviewed_by_persona_id_fkey"
            columns: ["reviewed_by_persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contributions_reviewed_by_persona_id_fkey"
            columns: ["reviewed_by_persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contributions_task_template_id_fkey"
            columns: ["task_template_id"]
            isOneToOne: false
            referencedRelation: "crm_task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_copilot_history: {
        Row: {
          conversation_id: string | null
          created_at: string
          error_message: string | null
          executed_actions: string[] | null
          execution_time_ms: number | null
          extracted_entities: Json | null
          id: string
          parsed_intent: string | null
          persona_id: string | null
          query_text: string
          result_count: number | null
          result_summary: string | null
          session_id: string | null
          success: boolean
          tenant_id: string | null
          tool_calls: Json | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          executed_actions?: string[] | null
          execution_time_ms?: number | null
          extracted_entities?: Json | null
          id?: string
          parsed_intent?: string | null
          persona_id?: string | null
          query_text: string
          result_count?: number | null
          result_summary?: string | null
          session_id?: string | null
          success?: boolean
          tenant_id?: string | null
          tool_calls?: Json | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          executed_actions?: string[] | null
          execution_time_ms?: number | null
          extracted_entities?: Json | null
          id?: string
          parsed_intent?: string | null
          persona_id?: string | null
          query_text?: string
          result_count?: number | null
          result_summary?: string | null
          session_id?: string | null
          success?: boolean
          tenant_id?: string | null
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_copilot_history_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_copilot_history_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_engagement_events: {
        Row: {
          clusterqube_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          persona_id: string
          pokw_delta: number
          qube_id: string | null
          source: string | null
          tenant_id: string
          weight: number
        }
        Insert: {
          clusterqube_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          persona_id: string
          pokw_delta?: number
          qube_id?: string | null
          source?: string | null
          tenant_id: string
          weight?: number
        }
        Update: {
          clusterqube_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          persona_id?: string
          pokw_delta?: number
          qube_id?: string | null
          source?: string | null
          tenant_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_engagement_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_engagement_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_entitlements: {
        Row: {
          access_level: string
          clusterqube_id: string
          created_at: string
          expires_at: string | null
          id: string
          modality: string
          origin: string
          persona_id: string
          qube_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          access_level?: string
          clusterqube_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          modality: string
          origin?: string
          persona_id: string
          qube_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          access_level?: string
          clusterqube_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          modality?: string
          origin?: string
          persona_id?: string
          qube_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_entitlements_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_entitlements_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_franchises: {
        Row: {
          config: Json | null
          created_at: string
          description: string | null
          hierarchy_level: number | null
          id: string
          is_active: boolean
          is_anchor: boolean | null
          logo_url: string | null
          name: string
          parent_franchise_id: string | null
          primary_color: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          description?: string | null
          hierarchy_level?: number | null
          id?: string
          is_active?: boolean
          is_anchor?: boolean | null
          logo_url?: string | null
          name: string
          parent_franchise_id?: string | null
          primary_color?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          description?: string | null
          hierarchy_level?: number | null
          id?: string
          is_active?: boolean
          is_anchor?: boolean | null
          logo_url?: string | null
          name?: string
          parent_franchise_id?: string | null
          primary_color?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_franchises_parent_franchise_id_fkey"
            columns: ["parent_franchise_id"]
            isOneToOne: false
            referencedRelation: "crm_franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_interest_tags: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_tag_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_tag_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_tag_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_interest_tags_parent_tag_id_fkey"
            columns: ["parent_tag_id"]
            isOneToOne: false
            referencedRelation: "crm_interest_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_persona_access_preferences: {
        Row: {
          access_mode: string
          created_at: string | null
          id: string
          owner_auth_profile_id: string
          persona_id: string
        }
        Insert: {
          access_mode: string
          created_at?: string | null
          id?: string
          owner_auth_profile_id: string
          persona_id: string
        }
        Update: {
          access_mode?: string
          created_at?: string | null
          id?: string
          owner_auth_profile_id?: string
          persona_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_persona_access_preferences_owner_auth_profile_id_fkey"
            columns: ["owner_auth_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_auth_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_persona_access_preferences_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_persona_franchises: {
        Row: {
          created_at: string
          franchise_id: string
          id: string
          joined_at: string
          persona_id: string
          role: string | null
        }
        Insert: {
          created_at?: string
          franchise_id: string
          id?: string
          joined_at?: string
          persona_id: string
          role?: string | null
        }
        Update: {
          created_at?: string
          franchise_id?: string
          id?: string
          joined_at?: string
          persona_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_persona_franchises_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "crm_franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_persona_franchises_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_persona_franchises_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_persona_interests: {
        Row: {
          created_at: string
          id: string
          persona_id: string
          source: string | null
          tag_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          persona_id: string
          source?: string | null
          tag_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          persona_id?: string
          source?: string | null
          tag_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_persona_interests_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_persona_interests_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_persona_interests_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "crm_interest_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_persona_reputation: {
        Row: {
          lifetime_cvs: number | null
          persona_id: string
          rep_community: number | null
          rep_creative: number | null
          rep_data_arch: number | null
          rep_entrepreneurial: number | null
          rep_overall: number | null
          rep_rolling_12m: number | null
          rep_technical: number | null
          rqh_bucket_id: string | null
          rqh_partition_id: string | null
          rqh_synced_at: string | null
          total_tasks_claimed: number | null
          total_tasks_completed: number | null
          updated_at: string | null
        }
        Insert: {
          lifetime_cvs?: number | null
          persona_id: string
          rep_community?: number | null
          rep_creative?: number | null
          rep_data_arch?: number | null
          rep_entrepreneurial?: number | null
          rep_overall?: number | null
          rep_rolling_12m?: number | null
          rep_technical?: number | null
          rqh_bucket_id?: string | null
          rqh_partition_id?: string | null
          rqh_synced_at?: string | null
          total_tasks_claimed?: number | null
          total_tasks_completed?: number | null
          updated_at?: string | null
        }
        Update: {
          lifetime_cvs?: number | null
          persona_id?: string
          rep_community?: number | null
          rep_creative?: number | null
          rep_data_arch?: number | null
          rep_entrepreneurial?: number | null
          rep_overall?: number | null
          rep_rolling_12m?: number | null
          rep_technical?: number | null
          rqh_bucket_id?: string | null
          rqh_partition_id?: string | null
          rqh_synced_at?: string | null
          total_tasks_claimed?: number | null
          total_tasks_completed?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_persona_reputation_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: true
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_persona_reputation_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: true
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_personas: {
        Row: {
          auth_profile_id: string | null
          created_at: string
          display_name: string | null
          email: string | null
          external_user_id: string | null
          id: string
          identity_persona_id: string | null
          kybe_did: string | null
          persona_dataqube_id: string | null
          persona_state: string
          primary_franchise_id: string | null
          primary_wallet_address: string | null
          reputation_bucket: string | null
          reputation_bucket_updated_at: string | null
          reputation_score: number | null
          reputation_updated_at: string | null
          root_did: string | null
          root_did_proxy_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          auth_profile_id?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          external_user_id?: string | null
          id?: string
          identity_persona_id?: string | null
          kybe_did?: string | null
          persona_dataqube_id?: string | null
          persona_state?: string
          primary_franchise_id?: string | null
          primary_wallet_address?: string | null
          reputation_bucket?: string | null
          reputation_bucket_updated_at?: string | null
          reputation_score?: number | null
          reputation_updated_at?: string | null
          root_did?: string | null
          root_did_proxy_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          auth_profile_id?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          external_user_id?: string | null
          id?: string
          identity_persona_id?: string | null
          kybe_did?: string | null
          persona_dataqube_id?: string | null
          persona_state?: string
          primary_franchise_id?: string | null
          primary_wallet_address?: string | null
          reputation_bucket?: string | null
          reputation_bucket_updated_at?: string | null
          reputation_score?: number | null
          reputation_updated_at?: string | null
          root_did?: string | null
          root_did_proxy_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_personas_auth_profile_id_fkey"
            columns: ["auth_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_auth_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_personas_persona_dataqube_id_fkey"
            columns: ["persona_dataqube_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "crm_personas_persona_dataqube_id_fkey"
            columns: ["persona_dataqube_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_personas_persona_dataqube_id_fkey"
            columns: ["persona_dataqube_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_personas_persona_dataqube_id_fkey"
            columns: ["persona_dataqube_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_personas_persona_dataqube_id_fkey"
            columns: ["persona_dataqube_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_personas_primary_franchise_id_fkey"
            columns: ["primary_franchise_id"]
            isOneToOne: false
            referencedRelation: "crm_franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_platform_accounts: {
        Row: {
          account_type: string
          auth_profile_id: string | null
          avatar_url: string | null
          created_at: string | null
          didqube_consent_at: string | null
          didqube_consent_given: boolean | null
          display_name: string | null
          id: string
          is_active: boolean | null
          kybe_did: string | null
          privacy_level: string | null
          settings: Json | null
          suspended_at: string | null
          suspension_reason: string | null
          updated_at: string | null
        }
        Insert: {
          account_type?: string
          auth_profile_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          didqube_consent_at?: string | null
          didqube_consent_given?: boolean | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          kybe_did?: string | null
          privacy_level?: string | null
          settings?: Json | null
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          account_type?: string
          auth_profile_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          didqube_consent_at?: string | null
          didqube_consent_given?: boolean | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          kybe_did?: string | null
          privacy_level?: string | null
          settings?: Json | null
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_platform_accounts_auth_profile_id_fkey"
            columns: ["auth_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_auth_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_platform_franchise_access: {
        Row: {
          access_role: string
          created_at: string | null
          franchise_id: string
          granted_at: string | null
          granted_by_platform_account_id: string | null
          id: string
          platform_account_id: string
        }
        Insert: {
          access_role?: string
          created_at?: string | null
          franchise_id: string
          granted_at?: string | null
          granted_by_platform_account_id?: string | null
          id?: string
          platform_account_id: string
        }
        Update: {
          access_role?: string
          created_at?: string | null
          franchise_id?: string
          granted_at?: string | null
          granted_by_platform_account_id?: string | null
          id?: string
          platform_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_platform_franchise_access_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "crm_franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_platform_franchise_access_granted_by_platform_account__fkey"
            columns: ["granted_by_platform_account_id"]
            isOneToOne: false
            referencedRelation: "crm_platform_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_platform_franchise_access_granted_by_platform_account__fkey"
            columns: ["granted_by_platform_account_id"]
            isOneToOne: false
            referencedRelation: "crm_user_account_layers"
            referencedColumns: ["platform_account_id"]
          },
          {
            foreignKeyName: "crm_platform_franchise_access_platform_account_id_fkey"
            columns: ["platform_account_id"]
            isOneToOne: false
            referencedRelation: "crm_platform_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_platform_franchise_access_platform_account_id_fkey"
            columns: ["platform_account_id"]
            isOneToOne: false
            referencedRelation: "crm_user_account_layers"
            referencedColumns: ["platform_account_id"]
          },
        ]
      }
      crm_registry_persona_links: {
        Row: {
          id: string
          is_primary_for_tenant: boolean | null
          last_synced_at: string | null
          linked_at: string | null
          persona_id: string
          registry_profile_id: string
          reputation_bucket: number | null
          reputation_score: number | null
          tenant_id: string
        }
        Insert: {
          id?: string
          is_primary_for_tenant?: boolean | null
          last_synced_at?: string | null
          linked_at?: string | null
          persona_id: string
          registry_profile_id: string
          reputation_bucket?: number | null
          reputation_score?: number | null
          tenant_id: string
        }
        Update: {
          id?: string
          is_primary_for_tenant?: boolean | null
          last_synced_at?: string | null
          linked_at?: string | null
          persona_id?: string
          registry_profile_id?: string
          reputation_bucket?: number | null
          reputation_score?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_registry_persona_links_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_registry_persona_links_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_registry_persona_links_registry_profile_id_fkey"
            columns: ["registry_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_registry_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_registry_persona_links_registry_profile_id_fkey"
            columns: ["registry_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_registry_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_registry_persona_links_registry_profile_id_fkey"
            columns: ["registry_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_user_account_layers"
            referencedColumns: ["registry_profile_id"]
          },
          {
            foreignKeyName: "crm_registry_persona_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_registry_persona_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_hierarchy_view"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      crm_registry_profiles: {
        Row: {
          auth_profile_id: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          kybe_did: string
          origin_franchise_id: string | null
          origin_layer: string
          origin_tenant_id: string | null
          platform_account_id: string | null
          reputation_bucket: string | null
          reputation_score_cached: number | null
          reputation_updated_at: string | null
          total_contributions_all_tenants: number | null
          total_pokw_all_tenants: number | null
          total_rewards_earned: Json | null
          updated_at: string | null
          visibility_level: string | null
        }
        Insert: {
          auth_profile_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          kybe_did: string
          origin_franchise_id?: string | null
          origin_layer: string
          origin_tenant_id?: string | null
          platform_account_id?: string | null
          reputation_bucket?: string | null
          reputation_score_cached?: number | null
          reputation_updated_at?: string | null
          total_contributions_all_tenants?: number | null
          total_pokw_all_tenants?: number | null
          total_rewards_earned?: Json | null
          updated_at?: string | null
          visibility_level?: string | null
        }
        Update: {
          auth_profile_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          kybe_did?: string
          origin_franchise_id?: string | null
          origin_layer?: string
          origin_tenant_id?: string | null
          platform_account_id?: string | null
          reputation_bucket?: string | null
          reputation_score_cached?: number | null
          reputation_updated_at?: string | null
          total_contributions_all_tenants?: number | null
          total_pokw_all_tenants?: number | null
          total_rewards_earned?: Json | null
          updated_at?: string | null
          visibility_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_registry_profiles_auth_profile_id_fkey"
            columns: ["auth_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_auth_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_registry_profiles_origin_franchise_id_fkey"
            columns: ["origin_franchise_id"]
            isOneToOne: false
            referencedRelation: "crm_franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_registry_profiles_origin_tenant_id_fkey"
            columns: ["origin_tenant_id"]
            isOneToOne: false
            referencedRelation: "crm_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_registry_profiles_origin_tenant_id_fkey"
            columns: ["origin_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_hierarchy_view"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "crm_registry_profiles_platform_account_id_fkey"
            columns: ["platform_account_id"]
            isOneToOne: false
            referencedRelation: "crm_platform_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_registry_profiles_platform_account_id_fkey"
            columns: ["platform_account_id"]
            isOneToOne: false
            referencedRelation: "crm_user_account_layers"
            referencedColumns: ["platform_account_id"]
          },
        ]
      }
      crm_reputation_events: {
        Row: {
          cohort_id: string | null
          created_at: string
          created_by_persona_id: string | null
          cvs: number | null
          delta_community: number | null
          delta_creative: number | null
          delta_data_arch: number | null
          delta_entrepreneurial: number | null
          delta_overall: number | null
          delta_technical: number | null
          event_type: string
          final_score_snapshot: number | null
          id: string
          is_anonymized: boolean
          metadata: Json | null
          persona_id: string
          previous_bucket: string | null
          reason: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          reputation_bucket: string | null
          source: string | null
          source_id: string | null
          source_type: string | null
          task_template_id: string | null
          tenant_id: string
        }
        Insert: {
          cohort_id?: string | null
          created_at?: string
          created_by_persona_id?: string | null
          cvs?: number | null
          delta_community?: number | null
          delta_creative?: number | null
          delta_data_arch?: number | null
          delta_entrepreneurial?: number | null
          delta_overall?: number | null
          delta_technical?: number | null
          event_type: string
          final_score_snapshot?: number | null
          id?: string
          is_anonymized?: boolean
          metadata?: Json | null
          persona_id: string
          previous_bucket?: string | null
          reason?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          reputation_bucket?: string | null
          source?: string | null
          source_id?: string | null
          source_type?: string | null
          task_template_id?: string | null
          tenant_id: string
        }
        Update: {
          cohort_id?: string | null
          created_at?: string
          created_by_persona_id?: string | null
          cvs?: number | null
          delta_community?: number | null
          delta_creative?: number | null
          delta_data_arch?: number | null
          delta_entrepreneurial?: number | null
          delta_overall?: number | null
          delta_technical?: number | null
          event_type?: string
          final_score_snapshot?: number | null
          id?: string
          is_anonymized?: boolean
          metadata?: Json | null
          persona_id?: string
          previous_bucket?: string | null
          reason?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          reputation_bucket?: string | null
          source?: string | null
          source_id?: string | null
          source_type?: string | null
          task_template_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_reputation_events_created_by_persona_id_fkey"
            columns: ["created_by_persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_reputation_events_created_by_persona_id_fkey"
            columns: ["created_by_persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_reputation_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_reputation_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_reputation_events_task_template_id_fkey"
            columns: ["task_template_id"]
            isOneToOne: false
            referencedRelation: "crm_task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_rewards: {
        Row: {
          amount: number
          chain_id: string | null
          contribution_id: string | null
          created_at: string
          id: string
          notes: string | null
          period_end: string
          period_start: string
          persona_id: string
          pillar: string | null
          pokw_score_used: number
          reputation_bucket: number | null
          reputation_multiplier: number | null
          status: string
          task_template_id: string | null
          tenant_id: string
          token_type: string
          tx_hash: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          chain_id?: string | null
          contribution_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          persona_id: string
          pillar?: string | null
          pokw_score_used: number
          reputation_bucket?: number | null
          reputation_multiplier?: number | null
          status?: string
          task_template_id?: string | null
          tenant_id: string
          token_type: string
          tx_hash?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          chain_id?: string | null
          contribution_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          persona_id?: string
          pillar?: string | null
          pokw_score_used?: number
          reputation_bucket?: number | null
          reputation_multiplier?: number | null
          status?: string
          task_template_id?: string | null
          tenant_id?: string
          token_type?: string
          tx_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_rewards_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "crm_contributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_rewards_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_rewards_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_rewards_task_template_id_fkey"
            columns: ["task_template_id"]
            isOneToOne: false
            referencedRelation: "crm_task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_segment_members: {
        Row: {
          created_at: string
          id: string
          persona_id: string
          segment_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          persona_id: string
          segment_id: string
        }
        Update: {
          created_at?: string
          id?: string
          persona_id?: string
          segment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_segment_members_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_segment_members_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_segment_members_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "crm_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_segments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_dynamic: boolean
          name: string
          rule_definition: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_dynamic?: boolean
          name: string
          rule_definition?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_dynamic?: boolean
          name?: string
          rule_definition?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_task_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by_persona_id: string | null
          current_claims: number | null
          description: string | null
          difficulty_level: number | null
          expected_impact_level: number | null
          expires_at: string | null
          id: string
          impact_enabled: boolean | null
          impact_lookback_days: number | null
          impact_multiplier_max: number | null
          is_active: boolean | null
          is_compute_pillar: boolean | null
          is_knowledge_pillar: boolean | null
          max_claims: number | null
          metadata: Json | null
          rep_weight_community: number | null
          rep_weight_creative: number | null
          rep_weight_data_arch: number | null
          rep_weight_entrepreneurial: number | null
          rep_weight_technical: number | null
          reward_knyt: number | null
          reward_qct: number | null
          reward_qoyn: number | null
          schema_json: Json | null
          slug: string
          tenant_id: string
          title: string
          updated_at: string | null
          verification_config: Json | null
          verification_mode: string
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by_persona_id?: string | null
          current_claims?: number | null
          description?: string | null
          difficulty_level?: number | null
          expected_impact_level?: number | null
          expires_at?: string | null
          id?: string
          impact_enabled?: boolean | null
          impact_lookback_days?: number | null
          impact_multiplier_max?: number | null
          is_active?: boolean | null
          is_compute_pillar?: boolean | null
          is_knowledge_pillar?: boolean | null
          max_claims?: number | null
          metadata?: Json | null
          rep_weight_community?: number | null
          rep_weight_creative?: number | null
          rep_weight_data_arch?: number | null
          rep_weight_entrepreneurial?: number | null
          rep_weight_technical?: number | null
          reward_knyt?: number | null
          reward_qct?: number | null
          reward_qoyn?: number | null
          schema_json?: Json | null
          slug: string
          tenant_id: string
          title: string
          updated_at?: string | null
          verification_config?: Json | null
          verification_mode?: string
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by_persona_id?: string | null
          current_claims?: number | null
          description?: string | null
          difficulty_level?: number | null
          expected_impact_level?: number | null
          expires_at?: string | null
          id?: string
          impact_enabled?: boolean | null
          impact_lookback_days?: number | null
          impact_multiplier_max?: number | null
          is_active?: boolean | null
          is_compute_pillar?: boolean | null
          is_knowledge_pillar?: boolean | null
          max_claims?: number | null
          metadata?: Json | null
          rep_weight_community?: number | null
          rep_weight_creative?: number | null
          rep_weight_data_arch?: number | null
          rep_weight_entrepreneurial?: number | null
          rep_weight_technical?: number | null
          reward_knyt?: number | null
          reward_qct?: number | null
          reward_qoyn?: number | null
          schema_json?: Json | null
          slug?: string
          tenant_id?: string
          title?: string
          updated_at?: string | null
          verification_config?: Json | null
          verification_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_task_templates_created_by_persona_id_fkey"
            columns: ["created_by_persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_task_templates_created_by_persona_id_fkey"
            columns: ["created_by_persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tenants: {
        Row: {
          config: Json | null
          created_at: string
          default_modalities: string[] | null
          description: string | null
          domain: string | null
          franchise_id: string
          id: string
          is_active: boolean
          name: string
          slug: string
          supported_tokens: string[] | null
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          default_modalities?: string[] | null
          description?: string | null
          domain?: string | null
          franchise_id: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          supported_tokens?: string[] | null
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          default_modalities?: string[] | null
          description?: string | null
          domain?: string | null
          franchise_id?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          supported_tokens?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tenants_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "crm_franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_wallet_events: {
        Row: {
          amount: number | null
          block_number: number | null
          chain_id: string
          counterparty_address: string | null
          counterparty_persona_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          nft_metadata: Json | null
          nft_token_id: string | null
          persona_id: string
          source: string | null
          status: string
          tenant_id: string
          token_address: string | null
          token_type: string | null
          tx_hash: string | null
          wallet_address: string
        }
        Insert: {
          amount?: number | null
          block_number?: number | null
          chain_id: string
          counterparty_address?: string | null
          counterparty_persona_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          nft_metadata?: Json | null
          nft_token_id?: string | null
          persona_id: string
          source?: string | null
          status?: string
          tenant_id: string
          token_address?: string | null
          token_type?: string | null
          tx_hash?: string | null
          wallet_address: string
        }
        Update: {
          amount?: number | null
          block_number?: number | null
          chain_id?: string
          counterparty_address?: string | null
          counterparty_persona_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          nft_metadata?: Json | null
          nft_token_id?: string | null
          persona_id?: string
          source?: string | null
          status?: string
          tenant_id?: string
          token_address?: string | null
          token_type?: string | null
          tx_hash?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_wallet_events_counterparty_persona_id_fkey"
            columns: ["counterparty_persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_wallet_events_counterparty_persona_id_fkey"
            columns: ["counterparty_persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_wallet_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_wallet_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
        ]
      }
      custody_events: {
        Row: {
          created_at: string | null
          from_did: string
          id: string
          iqube_id: string
          meta: Json | null
          rights: string[] | null
          to_did: string
        }
        Insert: {
          created_at?: string | null
          from_did: string
          id?: string
          iqube_id: string
          meta?: Json | null
          rights?: string[] | null
          to_did: string
        }
        Update: {
          created_at?: string | null
          from_did?: string
          id?: string
          iqube_id?: string
          meta?: Json | null
          rights?: string[] | null
          to_did?: string
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          blak_uri: string | null
          created_at: string
          hashes: Json | null
          id: string
          message_id: string | null
          meta_cid: string | null
          pod_proof: Json | null
          status: string
          user_id: string | null
        }
        Insert: {
          blak_uri?: string | null
          created_at?: string
          hashes?: Json | null
          id?: string
          message_id?: string | null
          meta_cid?: string | null
          pod_proof?: Json | null
          status?: string
          user_id?: string | null
        }
        Update: {
          blak_uri?: string | null
          created_at?: string
          hashes?: Json | null
          id?: string
          message_id?: string | null
          meta_cid?: string | null
          pod_proof?: Json | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "x402_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      did_binding: {
        Row: {
          alias_commitment: string
          cohort_id: string | null
          created_at: string | null
          escrow_expiry: string | null
          id: string
          persona_id: string | null
          state_type: string | null
        }
        Insert: {
          alias_commitment: string
          cohort_id?: string | null
          created_at?: string | null
          escrow_expiry?: string | null
          id?: string
          persona_id?: string | null
          state_type?: string | null
        }
        Update: {
          alias_commitment?: string
          cohort_id?: string | null
          created_at?: string | null
          escrow_expiry?: string | null
          id?: string
          persona_id?: string | null
          state_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "did_binding_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "did_binding_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "did_binding_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "did_binding_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "did_binding_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
        ]
      }
      did_identities: {
        Row: {
          agent_handle: string | null
          created_at: string | null
          did: string
          id: string
          kybe_did: string | null
        }
        Insert: {
          agent_handle?: string | null
          created_at?: string | null
          did: string
          id?: string
          kybe_did?: string | null
        }
        Update: {
          agent_handle?: string | null
          created_at?: string | null
          did?: string
          id?: string
          kybe_did?: string | null
        }
        Relationships: []
      }
      digital_episode_pricing: {
        Row: {
          available_from: string | null
          available_until: string | null
          created_at: string | null
          currency: string | null
          episode_number: number
          is_active: boolean | null
          price_canonical_knyt: number | null
          price_knyt: number
          series: string | null
          updated_at: string | null
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          currency?: string | null
          episode_number: number
          is_active?: boolean | null
          price_canonical_knyt?: number | null
          price_knyt: number
          series?: string | null
          updated_at?: string | null
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          currency?: string | null
          episode_number?: number
          is_active?: boolean | null
          price_canonical_knyt?: number | null
          price_knyt?: number
          series?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dvn_attestations: {
        Row: {
          created_at: string | null
          dvn_root: string
          id: string
          message_id: string
          proof: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dvn_root: string
          id?: string
          message_id: string
          proof?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dvn_root?: string
          id?: string
          message_id?: string
          proof?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      engagement_events: {
        Row: {
          content_id: string | null
          content_type: string | null
          created_at: string | null
          duration_seconds: number | null
          event_type: string
          id: string
          metadata: Json | null
          persona_id: string
          reward_amount: number | null
          streak_count: number | null
        }
        Insert: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          event_type: string
          id?: string
          metadata?: Json | null
          persona_id: string
          reward_amount?: number | null
          streak_count?: number | null
        }
        Update: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          event_type?: string
          id?: string
          metadata?: Json | null
          persona_id?: string
          reward_amount?: number | null
          streak_count?: number | null
        }
        Relationships: []
      }
      entitlements: {
        Row: {
          asset_id: string
          created_at: string | null
          expires_at: string | null
          holder_did: string
          id: string
          rights: string[]
          tokenqube_id: string | null
          x402_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          expires_at?: string | null
          holder_did: string
          id?: string
          rights: string[]
          tokenqube_id?: string | null
          x402_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          expires_at?: string | null
          holder_did?: string
          id?: string
          rights?: string[]
          tokenqube_id?: string | null
          x402_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "content_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entitlements_x402_id_fkey"
            columns: ["x402_id"]
            isOneToOne: false
            referencedRelation: "x402_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_engagement_events: {
        Row: {
          created_at: string
          episode_id: string
          event_type: string
          id: string
          metadata: Json | null
          persona_id: string
          progress_percent: number | null
          time_spent_seconds: number | null
        }
        Insert: {
          created_at?: string
          episode_id: string
          event_type: string
          id?: string
          metadata?: Json | null
          persona_id: string
          progress_percent?: number | null
          time_spent_seconds?: number | null
        }
        Update: {
          created_at?: string
          episode_id?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          persona_id?: string
          progress_percent?: number | null
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "episode_engagement_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "episode_engagement_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_engagement_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_engagement_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_engagement_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_metadata: {
        Row: {
          artist: string | null
          colorist: string | null
          created_at: string
          display_number: string | null
          editor: string | null
          episode_number: number
          extra_metadata: Json | null
          id: string
          is_current: boolean
          key_events: Json | null
          letterer: string | null
          locations: Json | null
          main_characters: Json | null
          release_date: string | null
          series: string
          subtitle: string | null
          supporting_characters: Json | null
          synopsis: string | null
          themes: Json | null
          title: string
          updated_at: string
          version: number
          writer: string | null
        }
        Insert: {
          artist?: string | null
          colorist?: string | null
          created_at?: string
          display_number?: string | null
          editor?: string | null
          episode_number: number
          extra_metadata?: Json | null
          id?: string
          is_current?: boolean
          key_events?: Json | null
          letterer?: string | null
          locations?: Json | null
          main_characters?: Json | null
          release_date?: string | null
          series?: string
          subtitle?: string | null
          supporting_characters?: Json | null
          synopsis?: string | null
          themes?: Json | null
          title: string
          updated_at?: string
          version?: number
          writer?: string | null
        }
        Update: {
          artist?: string | null
          colorist?: string | null
          created_at?: string
          display_number?: string | null
          editor?: string | null
          episode_number?: number
          extra_metadata?: Json | null
          id?: string
          is_current?: boolean
          key_events?: Json | null
          letterer?: string | null
          locations?: Json | null
          main_characters?: Json | null
          release_date?: string | null
          series?: string
          subtitle?: string | null
          supporting_characters?: Json | null
          synopsis?: string | null
          themes?: Json | null
          title?: string
          updated_at?: string
          version?: number
          writer?: string | null
        }
        Relationships: []
      }
      event_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          event_type: string
          id: string
          persona_id: string | null
          severity: string
          tenant_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          persona_id?: string | null
          severity?: string
          tenant_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          persona_id?: string | null
          severity?: string
          tenant_id?: string
        }
        Relationships: []
      }
      execution_receipts: {
        Row: {
          created_at: string
          dvn_message_id: string | null
          dvn_submitted_at: string | null
          from_agent_id: string | null
          id: string
          metadata: Json
          pipeline_run_id: string | null
          policy_evaluation: Json
          receipt_type: string
          result_data: Json
          status: string
          task_completed: string | null
          tenant_id: string
          to_agent_id: string | null
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          created_at?: string
          dvn_message_id?: string | null
          dvn_submitted_at?: string | null
          from_agent_id?: string | null
          id?: string
          metadata?: Json
          pipeline_run_id?: string | null
          policy_evaluation?: Json
          receipt_type?: string
          result_data?: Json
          status?: string
          task_completed?: string | null
          tenant_id: string
          to_agent_id?: string | null
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          created_at?: string
          dvn_message_id?: string | null
          dvn_submitted_at?: string | null
          from_agent_id?: string | null
          id?: string
          metadata?: Json
          pipeline_run_id?: string | null
          policy_evaluation?: Json
          receipt_type?: string
          result_data?: Json
          status?: string
          task_completed?: string | null
          tenant_id?: string
          to_agent_id?: string | null
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "execution_receipts_pipeline_run_id_fkey"
            columns: ["pipeline_run_id"]
            isOneToOne: false
            referencedRelation: "pipeline_runs"
            referencedColumns: ["pipeline_run_id"]
          },
          {
            foreignKeyName: "execution_receipts_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      executions: {
        Row: {
          avg_price: number
          capture_bps: number | null
          chain: string
          execution_venue: string | null
          id: string
          intent_id: string | null
          metadata: Json | null
          qty_filled: number
          side: string
          timestamp: string
          user_id: string
        }
        Insert: {
          avg_price: number
          capture_bps?: number | null
          chain: string
          execution_venue?: string | null
          id?: string
          intent_id?: string | null
          metadata?: Json | null
          qty_filled: number
          side: string
          timestamp?: string
          user_id: string
        }
        Update: {
          avg_price?: number
          capture_bps?: number | null
          chain?: string
          execution_venue?: string | null
          id?: string
          intent_id?: string | null
          metadata?: Json | null
          qty_filled?: number
          side?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "executions_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: false
            referencedRelation: "trading_intents"
            referencedColumns: ["intent_id"]
          },
        ]
      }
      experience_goals: {
        Row: {
          created_at: string | null
          goal_type: string
          id: string
          persona_id: string | null
          strategy_id: string | null
          success_status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          goal_type?: string
          id?: string
          persona_id?: string | null
          strategy_id?: string | null
          success_status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          goal_type?: string
          id?: string
          persona_id?: string | null
          strategy_id?: string | null
          success_status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_goals_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "experience_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_matrices: {
        Row: {
          created_at: string | null
          depth_ladder: string[] | null
          id: string
          model_id: string | null
          stage: string
        }
        Insert: {
          created_at?: string | null
          depth_ladder?: string[] | null
          id?: string
          model_id?: string | null
          stage: string
        }
        Update: {
          created_at?: string | null
          depth_ladder?: string[] | null
          id?: string
          model_id?: string | null
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_matrices_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "experience_models"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_models: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          stages: string[] | null
          strategy_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          stages?: string[] | null
          strategy_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          stages?: string[] | null
          strategy_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_models_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "experience_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_strategies: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          target_segments: string[] | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          target_segments?: string[] | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          target_segments?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_aggregates: {
        Row: {
          avg_daily_surplus: number | null
          cash_buffer_days: number | null
          closing_balance: number | null
          computed_at: string
          confidence_score: number | null
          created_at: string
          id: string
          surplus_volatility: number | null
          top_categories: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_daily_surplus?: number | null
          cash_buffer_days?: number | null
          closing_balance?: number | null
          computed_at?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          surplus_volatility?: number | null
          top_categories?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_daily_surplus?: number | null
          cash_buffer_days?: number | null
          closing_balance?: number | null
          computed_at?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          surplus_volatility?: number | null
          top_categories?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fio_cache: {
        Row: {
          expires_at: string | null
          handle: string
          owner_pubkey: string | null
          raw_response: Json | null
        }
        Insert: {
          expires_at?: string | null
          handle: string
          owner_pubkey?: string | null
          raw_response?: Json | null
        }
        Update: {
          expires_at?: string | null
          handle?: string
          owner_pubkey?: string | null
          raw_response?: Json | null
        }
        Relationships: []
      }
      franchise_admins: {
        Row: {
          created_at: string
          franchise_id: string
          id: string
          persona_id: string
          role: string
        }
        Insert: {
          created_at?: string
          franchise_id: string
          id?: string
          persona_id: string
          role: string
        }
        Update: {
          created_at?: string
          franchise_id?: string
          id?: string
          persona_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "franchise_admins_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_admins_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "franchise_admins_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_admins_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_admins_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchise_admins_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
        ]
      }
      franchise_config: {
        Row: {
          created_at: string
          franchise_id: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          franchise_id: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          franchise_id?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "franchise_config_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      franchises: {
        Row: {
          active: boolean
          chains: string[] | null
          created_at: string
          description: string | null
          id: string
          kb_endpoint: string | null
          name: string
          slug: string
          ui_url: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          chains?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          kb_endpoint?: string | null
          name: string
          slug: string
          ui_url?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          chains?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          kb_endpoint?: string | null
          name?: string
          slug?: string
          ui_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hcp_profile: {
        Row: {
          persona_id: string
          preference_ptr: string | null
          revocation: Json | null
          scopes: Json | null
          updated_at: string | null
        }
        Insert: {
          persona_id: string
          preference_ptr?: string | null
          revocation?: Json | null
          scopes?: Json | null
          updated_at?: string | null
        }
        Update: {
          persona_id?: string
          preference_ptr?: string | null
          revocation?: Json | null
          scopes?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hcp_profile_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: true
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "hcp_profile_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: true
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hcp_profile_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: true
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hcp_profile_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: true
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hcp_profile_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: true
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_aliases: {
        Row: {
          alias_type: string
          alias_value: string
          entity_did: string
          expires_at: string | null
          id: string
          last_verified_at: string | null
          proof_ref: string | null
          updated_at: string
          user_id: string | null
          verified: boolean
        }
        Insert: {
          alias_type: string
          alias_value: string
          entity_did: string
          expires_at?: string | null
          id?: string
          last_verified_at?: string | null
          proof_ref?: string | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          alias_type?: string
          alias_value?: string
          entity_did?: string
          expires_at?: string | null
          id?: string
          last_verified_at?: string | null
          proof_ref?: string | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      iq_blak_qubes: {
        Row: {
          checksum: string | null
          created_at: string | null
          encryption_alg: string
          encryption_auth_tag: string | null
          encryption_iv: string
          id: string
          payload_pointer: string
          payload_provider: string
          payload_size: number | null
          payload_type: string
        }
        Insert: {
          checksum?: string | null
          created_at?: string | null
          encryption_alg?: string
          encryption_auth_tag?: string | null
          encryption_iv: string
          id?: string
          payload_pointer: string
          payload_provider?: string
          payload_size?: number | null
          payload_type: string
        }
        Update: {
          checksum?: string | null
          created_at?: string | null
          encryption_alg?: string
          encryption_auth_tag?: string | null
          encryption_iv?: string
          id?: string
          payload_pointer?: string
          payload_provider?: string
          payload_size?: number | null
          payload_type?: string
        }
        Relationships: []
      }
      iq_meta_qubes: {
        Row: {
          created_at: string | null
          description: string | null
          episode_number: number | null
          id: string
          metadata: Json | null
          name: string
          preview_url: string | null
          qube_type: string
          series: string | null
          slug: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          episode_number?: number | null
          id?: string
          metadata?: Json | null
          name: string
          preview_url?: string | null
          qube_type: string
          series?: string | null
          slug?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          episode_number?: number | null
          id?: string
          metadata?: Json | null
          name?: string
          preview_url?: string | null
          qube_type?: string
          series?: string | null
          slug?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      iq_token_qubes: {
        Row: {
          access_policy: Json | null
          created_at: string | null
          id: string
          key_ciphertext: string
          key_type: string | null
          key_wrapping_alg: string
          wrapped_by: string | null
        }
        Insert: {
          access_policy?: Json | null
          created_at?: string | null
          id?: string
          key_ciphertext: string
          key_type?: string | null
          key_wrapping_alg?: string
          wrapped_by?: string | null
        }
        Update: {
          access_policy?: Json | null
          created_at?: string | null
          id?: string
          key_ciphertext?: string
          key_type?: string | null
          key_wrapping_alg?: string
          wrapped_by?: string | null
        }
        Relationships: []
      }
      iqube_access_list: {
        Row: {
          address: string
          granted_at: string
          granted_by: string
          id: number
          token_id: number
        }
        Insert: {
          address: string
          granted_at?: string
          granted_by: string
          id?: number
          token_id: number
        }
        Update: {
          address?: string
          granted_at?: string
          granted_by?: string
          id?: number
          token_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "iqube_access_list_token_fk"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "iqubes"
            referencedColumns: ["token_id"]
          },
        ]
      }
      iqube_capabilities: {
        Row: {
          acl_delta_sig: string | null
          audience_alias: Json | null
          audience_did: string
          created_at: string
          id: string
          iqube_ref: string
          scope: Json
          state: string
          ttl: string | null
          user_id: string | null
        }
        Insert: {
          acl_delta_sig?: string | null
          audience_alias?: Json | null
          audience_did: string
          created_at?: string
          id?: string
          iqube_ref: string
          scope: Json
          state?: string
          ttl?: string | null
          user_id?: string | null
        }
        Update: {
          acl_delta_sig?: string | null
          audience_alias?: Json | null
          audience_did?: string
          created_at?: string
          id?: string
          iqube_ref?: string
          scope?: Json
          state?: string
          ttl?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      iqube_events: {
        Row: {
          created_at: string
          id: string
          identity_snapshot: Json | null
          iqube_ref: string
          state_proof: Json | null
          type: string
          user_id: string | null
          x402_message_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          identity_snapshot?: Json | null
          iqube_ref: string
          state_proof?: Json | null
          type: string
          user_id?: string | null
          x402_message_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          identity_snapshot?: Json | null
          iqube_ref?: string
          state_proof?: Json | null
          type?: string
          user_id?: string | null
          x402_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iqube_events_x402_message_id_fkey"
            columns: ["x402_message_id"]
            isOneToOne: false
            referencedRelation: "x402_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      iqube_shares: {
        Row: {
          access_level: string
          consent_given_at: string
          created_at: string
          id: string
          iqube_id: string
          owner_persona_id: string | null
          revoked_at: string | null
          shared_with_persona_id: string | null
          shared_with_tenant_id: string | null
        }
        Insert: {
          access_level: string
          consent_given_at?: string
          created_at?: string
          id?: string
          iqube_id: string
          owner_persona_id?: string | null
          revoked_at?: string | null
          shared_with_persona_id?: string | null
          shared_with_tenant_id?: string | null
        }
        Update: {
          access_level?: string
          consent_given_at?: string
          created_at?: string
          id?: string
          iqube_id?: string
          owner_persona_id?: string | null
          revoked_at?: string | null
          shared_with_persona_id?: string | null
          shared_with_tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iqube_shares_owner_persona_id_fkey"
            columns: ["owner_persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "iqube_shares_owner_persona_id_fkey"
            columns: ["owner_persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iqube_shares_owner_persona_id_fkey"
            columns: ["owner_persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iqube_shares_owner_persona_id_fkey"
            columns: ["owner_persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iqube_shares_owner_persona_id_fkey"
            columns: ["owner_persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iqube_shares_shared_with_persona_id_fkey"
            columns: ["shared_with_persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "iqube_shares_shared_with_persona_id_fkey"
            columns: ["shared_with_persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iqube_shares_shared_with_persona_id_fkey"
            columns: ["shared_with_persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iqube_shares_shared_with_persona_id_fkey"
            columns: ["shared_with_persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iqube_shares_shared_with_persona_id_fkey"
            columns: ["shared_with_persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iqube_shares_shared_with_tenant_id_fkey"
            columns: ["shared_with_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      iqube_templates: {
        Row: {
          accuracy_score: number
          blakqube_labels: string[] | null
          business_model: string | null
          created_at: string
          description: string
          id: string
          instance_type: string | null
          iqube_type: string | null
          metaqube_extras: Json | null
          name: string
          owner: string | null
          parent_template_id: string | null
          price: number | null
          provenance: number | null
          public_read: boolean
          risk_score: number
          sensitivity_score: number | null
          tenant_id: string | null
          updated_at: string
          user_id: string | null
          verifiability_score: number
          version: number | null
          visibility: string | null
        }
        Insert: {
          accuracy_score: number
          blakqube_labels?: string[] | null
          business_model?: string | null
          created_at?: string
          description?: string
          id?: string
          instance_type?: string | null
          iqube_type?: string | null
          metaqube_extras?: Json | null
          name: string
          owner?: string | null
          parent_template_id?: string | null
          price?: number | null
          provenance?: number | null
          public_read?: boolean
          risk_score: number
          sensitivity_score?: number | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
          verifiability_score: number
          version?: number | null
          visibility?: string | null
        }
        Update: {
          accuracy_score?: number
          blakqube_labels?: string[] | null
          business_model?: string | null
          created_at?: string
          description?: string
          id?: string
          instance_type?: string | null
          iqube_type?: string | null
          metaqube_extras?: Json | null
          name?: string
          owner?: string | null
          parent_template_id?: string | null
          price?: number | null
          provenance?: number | null
          public_read?: boolean
          risk_score?: number
          sensitivity_score?: number | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string | null
          verifiability_score?: number
          version?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iqube_templates_parent_template_id_fkey"
            columns: ["parent_template_id"]
            isOneToOne: false
            referencedRelation: "iqube_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iqube_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      iqube_wrapped_keys: {
        Row: {
          created_at: string
          encrypted_key: string | null
          ipfs_hash: string | null
          key_encryption_iv: string | null
          key_encryption_scheme: string
          minter_address: string
          token_id: number
          wrapped_key: string | null
        }
        Insert: {
          created_at?: string
          encrypted_key?: string | null
          ipfs_hash?: string | null
          key_encryption_iv?: string | null
          key_encryption_scheme?: string
          minter_address: string
          token_id: number
          wrapped_key?: string | null
        }
        Update: {
          created_at?: string
          encrypted_key?: string | null
          ipfs_hash?: string | null
          key_encryption_iv?: string | null
          key_encryption_scheme?: string
          minter_address?: string
          token_id?: number
          wrapped_key?: string | null
        }
        Relationships: []
      }
      iqubes: {
        Row: {
          access_policy: string
          allowed_addresses: Json | null
          business_model: string
          category: string
          created_at: string | null
          description: string | null
          ipfs_hash: string
          ipfs_url: string
          iqube_type: string
          is_encrypted: boolean
          minter_address: string
          owner_address: string
          price: string | null
          risk_score: number
          title: string
          token_id: number
          tx_hash: string
          visibility: string
        }
        Insert: {
          access_policy?: string
          allowed_addresses?: Json | null
          business_model?: string
          category: string
          created_at?: string | null
          description?: string | null
          ipfs_hash: string
          ipfs_url: string
          iqube_type: string
          is_encrypted?: boolean
          minter_address: string
          owner_address: string
          price?: string | null
          risk_score?: number
          title: string
          token_id: number
          tx_hash: string
          visibility?: string
        }
        Update: {
          access_policy?: string
          allowed_addresses?: Json | null
          business_model?: string
          category?: string
          created_at?: string | null
          description?: string | null
          ipfs_hash?: string
          ipfs_url?: string
          iqube_type?: string
          is_encrypted?: boolean
          minter_address?: string
          owner_address?: string
          price?: string | null
          risk_score?: number
          title?: string
          token_id?: number
          tx_hash?: string
          visibility?: string
        }
        Relationships: []
      }
      journey_states: {
        Row: {
          active_at: string | null
          completed_experience_ids: string[] | null
          created_at: string | null
          current_experience_id: string | null
          depth: string
          id: string
          persona_id: string
          stage: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          active_at?: string | null
          completed_experience_ids?: string[] | null
          created_at?: string | null
          current_experience_id?: string | null
          depth?: string
          id?: string
          persona_id: string
          stage?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active_at?: string | null
          completed_experience_ids?: string[] | null
          created_at?: string | null
          current_experience_id?: string | null
          depth?: string
          id?: string
          persona_id?: string
          stage?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          doc_type: string | null
          embedding: string | null
          id: string
          is_root: boolean | null
          metadata: Json | null
          source: string | null
          tags: string[] | null
          tenant_id: string | null
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          doc_type?: string | null
          embedding?: string | null
          id?: string
          is_root?: boolean | null
          metadata?: Json | null
          source?: string | null
          tags?: string[] | null
          tenant_id?: string | null
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          doc_type?: string | null
          embedding?: string | null
          id?: string
          is_root?: boolean | null
          metadata?: Json | null
          source?: string | null
          tags?: string[] | null
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      knyt_ballots: {
        Row: {
          cast_at: string
          election_id: string
          id: string
          persona_id: string
          proof: string | null
          reward_knyt: number | null
          reward_settled: boolean
          reward_tx: string | null
          settled_at: string | null
          voted_for: string[]
          wallet_task_id: string | null
        }
        Insert: {
          cast_at?: string
          election_id: string
          id?: string
          persona_id: string
          proof?: string | null
          reward_knyt?: number | null
          reward_settled?: boolean
          reward_tx?: string | null
          settled_at?: string | null
          voted_for: string[]
          wallet_task_id?: string | null
        }
        Update: {
          cast_at?: string
          election_id?: string
          id?: string
          persona_id?: string
          proof?: string | null
          reward_knyt?: number | null
          reward_settled?: boolean
          reward_tx?: string | null
          settled_at?: string | null
          voted_for?: string[]
          wallet_task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knyt_ballots_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "knyt_elections"
            referencedColumns: ["id"]
          },
        ]
      }
      knyt_elections: {
        Row: {
          autodrive_cid: string | null
          branch: Database["public"]["Enums"]["knyt_canon_branch"]
          candidate_ids: string[]
          closes_at: string
          created_at: string
          description: string | null
          id: string
          min_reputation_bucket: number
          opens_at: string
          per_voter_reward_knyt: number
          required_entitlements: string[]
          settled_at: string | null
          settled_pool_knyt: number | null
          status: Database["public"]["Enums"]["knyt_election_status"]
          title: string
          total_ballots_cast: number
          updated_at: string
          votable_type: Database["public"]["Enums"]["knyt_votable_type"]
          winner_ids: string[] | null
          world_id: string
        }
        Insert: {
          autodrive_cid?: string | null
          branch: Database["public"]["Enums"]["knyt_canon_branch"]
          candidate_ids?: string[]
          closes_at: string
          created_at?: string
          description?: string | null
          id?: string
          min_reputation_bucket?: number
          opens_at: string
          per_voter_reward_knyt?: number
          required_entitlements?: string[]
          settled_at?: string | null
          settled_pool_knyt?: number | null
          status?: Database["public"]["Enums"]["knyt_election_status"]
          title: string
          total_ballots_cast?: number
          updated_at?: string
          votable_type: Database["public"]["Enums"]["knyt_votable_type"]
          winner_ids?: string[] | null
          world_id?: string
        }
        Update: {
          autodrive_cid?: string | null
          branch?: Database["public"]["Enums"]["knyt_canon_branch"]
          candidate_ids?: string[]
          closes_at?: string
          created_at?: string
          description?: string | null
          id?: string
          min_reputation_bucket?: number
          opens_at?: string
          per_voter_reward_knyt?: number
          required_entitlements?: string[]
          settled_at?: string | null
          settled_pool_knyt?: number | null
          status?: Database["public"]["Enums"]["knyt_election_status"]
          title?: string
          total_ballots_cast?: number
          updated_at?: string
          votable_type?: Database["public"]["Enums"]["knyt_votable_type"]
          winner_ids?: string[] | null
          world_id?: string
        }
        Relationships: []
      }
      knyt_followup_queue: {
        Row: {
          current_state: string | null
          display_name: string | null
          email: string | null
          entity_type: string
          id: string
          investor_id: string | null
          last_computed_at: string
          partner_id: string | null
          priority_score: number
          queue_reason: string | null
          recommended_channel: string | null
          recommended_message_angle: string | null
          recommended_next_action: string | null
        }
        Insert: {
          current_state?: string | null
          display_name?: string | null
          email?: string | null
          entity_type: string
          id?: string
          investor_id?: string | null
          last_computed_at?: string
          partner_id?: string | null
          priority_score?: number
          queue_reason?: string | null
          recommended_channel?: string | null
          recommended_message_angle?: string | null
          recommended_next_action?: string | null
        }
        Update: {
          current_state?: string | null
          display_name?: string | null
          email?: string | null
          entity_type?: string
          id?: string
          investor_id?: string | null
          last_computed_at?: string
          partner_id?: string | null
          priority_score?: number
          queue_reason?: string | null
          recommended_channel?: string | null
          recommended_message_angle?: string | null
          recommended_next_action?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knyt_followup_queue_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "nakamoto_knyt_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knyt_followup_queue_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_outreach"
            referencedColumns: ["id"]
          },
        ]
      }
      knyt_order_milestones: {
        Row: {
          achieved_at: string
          autodrive_cid: string | null
          id: string
          persona_id: string
          reward_grant_id: string | null
          reward_granted: boolean
          tier: string
        }
        Insert: {
          achieved_at?: string
          autodrive_cid?: string | null
          id?: string
          persona_id: string
          reward_grant_id?: string | null
          reward_granted?: boolean
          tier: string
        }
        Update: {
          achieved_at?: string
          autodrive_cid?: string | null
          id?: string
          persona_id?: string
          reward_grant_id?: string | null
          reward_granted?: boolean
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "knyt_order_milestones_reward_grant_id_fkey"
            columns: ["reward_grant_id"]
            isOneToOne: false
            referencedRelation: "knyt_reward_grants"
            referencedColumns: ["id"]
          },
        ]
      }
      knyt_persona_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          metadata: Json | null
          persona_id: string
          revoked_at: string | null
          role: string
          world_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          metadata?: Json | null
          persona_id: string
          revoked_at?: string | null
          role: string
          world_id?: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          metadata?: Json | null
          persona_id?: string
          revoked_at?: string | null
          role?: string
          world_id?: string
        }
        Relationships: []
      }
      knyt_publication_state_log: {
        Row: {
          actor_persona: string
          autodrive_cid: string | null
          created_at: string
          from_state:
            | Database["public"]["Enums"]["knyt_publication_state"]
            | null
          id: string
          publication_id: string
          reason: string | null
          to_state: Database["public"]["Enums"]["knyt_publication_state"]
        }
        Insert: {
          actor_persona: string
          autodrive_cid?: string | null
          created_at?: string
          from_state?:
            | Database["public"]["Enums"]["knyt_publication_state"]
            | null
          id?: string
          publication_id: string
          reason?: string | null
          to_state: Database["public"]["Enums"]["knyt_publication_state"]
        }
        Update: {
          actor_persona?: string
          autodrive_cid?: string | null
          created_at?: string
          from_state?:
            | Database["public"]["Enums"]["knyt_publication_state"]
            | null
          id?: string
          publication_id?: string
          reason?: string | null
          to_state?: Database["public"]["Enums"]["knyt_publication_state"]
        }
        Relationships: [
          {
            foreignKeyName: "knyt_publication_state_log_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "knyt_publication_states"
            referencedColumns: ["id"]
          },
        ]
      }
      knyt_publication_states: {
        Row: {
          autodrive_cid: string | null
          autodrive_tx: string | null
          branch: Database["public"]["Enums"]["knyt_canon_branch"]
          created_at: string
          elevated_at: string | null
          elevated_by: string | null
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          state: Database["public"]["Enums"]["knyt_publication_state"]
          subject_id: string
          subject_type: string
          updated_at: string
        }
        Insert: {
          autodrive_cid?: string | null
          autodrive_tx?: string | null
          branch?: Database["public"]["Enums"]["knyt_canon_branch"]
          created_at?: string
          elevated_at?: string | null
          elevated_by?: string | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state?: Database["public"]["Enums"]["knyt_publication_state"]
          subject_id: string
          subject_type: string
          updated_at?: string
        }
        Update: {
          autodrive_cid?: string | null
          autodrive_tx?: string | null
          branch?: Database["public"]["Enums"]["knyt_canon_branch"]
          created_at?: string
          elevated_at?: string | null
          elevated_by?: string | null
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state?: Database["public"]["Enums"]["knyt_publication_state"]
          subject_id?: string
          subject_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      knyt_reactions: {
        Row: {
          created_at: string
          id: string
          persona_id: string
          publication_id: string
          reaction_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          persona_id: string
          publication_id: string
          reaction_type: string
        }
        Update: {
          created_at?: string
          id?: string
          persona_id?: string
          publication_id?: string
          reaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "knyt_reactions_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "knyt_publication_states"
            referencedColumns: ["id"]
          },
        ]
      }
      knyt_reward_grants: {
        Row: {
          amount_knyt: number
          base_amount_knyt: number
          created_at: string
          id: string
          metadata: Json | null
          persona_id: string
          rep_multiplier: number
          settled: boolean
          settled_at: string | null
          source_event_id: string | null
          task_type: string
          tx_hash: string | null
        }
        Insert: {
          amount_knyt?: number
          base_amount_knyt?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          persona_id: string
          rep_multiplier?: number
          settled?: boolean
          settled_at?: string | null
          source_event_id?: string | null
          task_type: string
          tx_hash?: string | null
        }
        Update: {
          amount_knyt?: number
          base_amount_knyt?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          persona_id?: string
          rep_multiplier?: number
          settled?: boolean
          settled_at?: string | null
          source_event_id?: string | null
          task_type?: string
          tx_hash?: string | null
        }
        Relationships: []
      }
      knyt_signals: {
        Row: {
          content_id: string
          created_at: string | null
          id: string
          note: string | null
          persona_id: string
          signal_type: string
          wallet_task_id: string | null
        }
        Insert: {
          content_id: string
          created_at?: string | null
          id?: string
          note?: string | null
          persona_id: string
          signal_type: string
          wallet_task_id?: string | null
        }
        Update: {
          content_id?: string
          created_at?: string | null
          id?: string
          note?: string | null
          persona_id?: string
          signal_type?: string
          wallet_task_id?: string | null
        }
        Relationships: []
      }
      knyt_tracking_click_events: {
        Row: {
          clicked_at: string
          id: string
          investor_id: string | null
          ip_address: string | null
          link_tag: string | null
          partner_slug: string | null
          resolved_ks_url: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          investor_id?: string | null
          ip_address?: string | null
          link_tag?: string | null
          partner_slug?: string | null
          resolved_ks_url?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          investor_id?: string | null
          ip_address?: string | null
          link_tag?: string | null
          partner_slug?: string | null
          resolved_ks_url?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knyt_tracking_click_events_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "nakamoto_knyt_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knyt_tracking_click_events_link_tag_fkey"
            columns: ["link_tag"]
            isOneToOne: false
            referencedRelation: "knyt_tracking_link_registry"
            referencedColumns: ["tag_name"]
          },
        ]
      }
      knyt_tracking_link_registry: {
        Row: {
          campaign_slug: string
          channel: string
          click_count: number
          created_at: string
          id: string
          is_active: boolean
          kickstarter_ref_tag: string
          notes: string | null
          owner_key: string | null
          owner_name: string | null
          owner_type: string
          tag_name: string
          updated_at: string
          utm_campaign: string
          utm_content: string | null
          utm_medium: string
          utm_source: string
          utm_term: string | null
        }
        Insert: {
          campaign_slug?: string
          channel: string
          click_count?: number
          created_at?: string
          id?: string
          is_active?: boolean
          kickstarter_ref_tag?: string
          notes?: string | null
          owner_key?: string | null
          owner_name?: string | null
          owner_type: string
          tag_name: string
          updated_at?: string
          utm_campaign?: string
          utm_content?: string | null
          utm_medium?: string
          utm_source?: string
          utm_term?: string | null
        }
        Update: {
          campaign_slug?: string
          channel?: string
          click_count?: number
          created_at?: string
          id?: string
          is_active?: boolean
          kickstarter_ref_tag?: string
          notes?: string | null
          owner_key?: string | null
          owner_name?: string | null
          owner_type?: string
          tag_name?: string
          updated_at?: string
          utm_campaign?: string
          utm_content?: string | null
          utm_medium?: string
          utm_source?: string
          utm_term?: string | null
        }
        Relationships: []
      }
      knyt_treasury_ledger: {
        Row: {
          amount_knyt: number
          autodrive_cid: string | null
          balance_after: number
          created_at: string
          direction: string
          event_type: string
          id: string
          namespace_id: string
          notes: string | null
          persona_id: string | null
          settled: boolean
          settled_at: string | null
          source_id: string | null
          source_type: string | null
        }
        Insert: {
          amount_knyt: number
          autodrive_cid?: string | null
          balance_after: number
          created_at?: string
          direction: string
          event_type: string
          id?: string
          namespace_id: string
          notes?: string | null
          persona_id?: string | null
          settled?: boolean
          settled_at?: string | null
          source_id?: string | null
          source_type?: string | null
        }
        Update: {
          amount_knyt?: number
          autodrive_cid?: string | null
          balance_after?: number
          created_at?: string
          direction?: string
          event_type?: string
          id?: string
          namespace_id?: string
          notes?: string | null
          persona_id?: string | null
          settled?: boolean
          settled_at?: string | null
          source_id?: string | null
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knyt_treasury_ledger_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "knyt_treasury_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      knyt_treasury_namespaces: {
        Row: {
          active: boolean
          asset_code: string
          autodrive_cid: string | null
          balance: number
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
          world_id: string | null
        }
        Insert: {
          active?: boolean
          asset_code?: string
          autodrive_cid?: string | null
          balance?: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
          world_id?: string | null
        }
        Update: {
          active?: boolean
          asset_code?: string
          autodrive_cid?: string | null
          balance?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
          world_id?: string | null
        }
        Relationships: []
      }
      ks_backers_staging: {
        Row: {
          bounce_count: number
          campaign_cohort: string | null
          campaign_id: string
          campaign_state: string | null
          canonical_dataset: boolean
          canonical_persona_id: string | null
          canonized_at: string | null
          canonized_by: string | null
          cohort_id: string
          crm_persona_id: string | null
          dedup_status: string
          deliverability_status: string
          display_name: string | null
          email: string
          engagement_status: string
          enrichment_status: string
          fio_handle: string | null
          first_name: string | null
          id: string
          imported_at: string
          imported_by: string
          investment_amount_band: string | null
          knyt_id: string | null
          ks_backer: boolean | null
          last_clicked_at: string | null
          last_event_at: string | null
          last_name: string | null
          last_opened_at: string | null
          last_sent_at: string | null
          matrix_y_stage: string | null
          normalized_email: string | null
          offer_fit: string | null
          "OM-Tier-Status": string | null
          order_tier: string | null
          seed_source: string
          storage_tier: string
          suppression_status: string
          "Total-Invested": number | null
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          bounce_count?: number
          campaign_cohort?: string | null
          campaign_id?: string
          campaign_state?: string | null
          canonical_dataset?: boolean
          canonical_persona_id?: string | null
          canonized_at?: string | null
          canonized_by?: string | null
          cohort_id?: string
          crm_persona_id?: string | null
          dedup_status?: string
          deliverability_status?: string
          display_name?: string | null
          email: string
          engagement_status?: string
          enrichment_status?: string
          fio_handle?: string | null
          first_name?: string | null
          id?: string
          imported_at?: string
          imported_by?: string
          investment_amount_band?: string | null
          knyt_id?: string | null
          ks_backer?: boolean | null
          last_clicked_at?: string | null
          last_event_at?: string | null
          last_name?: string | null
          last_opened_at?: string | null
          last_sent_at?: string | null
          matrix_y_stage?: string | null
          normalized_email?: string | null
          offer_fit?: string | null
          "OM-Tier-Status"?: string | null
          order_tier?: string | null
          seed_source?: string
          storage_tier?: string
          suppression_status?: string
          "Total-Invested"?: number | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          bounce_count?: number
          campaign_cohort?: string | null
          campaign_id?: string
          campaign_state?: string | null
          canonical_dataset?: boolean
          canonical_persona_id?: string | null
          canonized_at?: string | null
          canonized_by?: string | null
          cohort_id?: string
          crm_persona_id?: string | null
          dedup_status?: string
          deliverability_status?: string
          display_name?: string | null
          email?: string
          engagement_status?: string
          enrichment_status?: string
          fio_handle?: string | null
          first_name?: string | null
          id?: string
          imported_at?: string
          imported_by?: string
          investment_amount_band?: string | null
          knyt_id?: string | null
          ks_backer?: boolean | null
          last_clicked_at?: string | null
          last_event_at?: string | null
          last_name?: string | null
          last_opened_at?: string | null
          last_sent_at?: string | null
          matrix_y_stage?: string | null
          normalized_email?: string | null
          offer_fit?: string | null
          "OM-Tier-Status"?: string | null
          order_tier?: string | null
          seed_source?: string
          storage_tier?: string
          suppression_status?: string
          "Total-Invested"?: number | null
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ks_backers_staging_canonical_persona_id_fkey"
            columns: ["canonical_persona_id"]
            isOneToOne: false
            referencedRelation: "nakamoto_knyt_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ks_backers_staging_crm_persona_id_fkey"
            columns: ["crm_persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ks_backers_staging_crm_persona_id_fkey"
            columns: ["crm_persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["id"]
          },
        ]
      }
      kybe_identity: {
        Row: {
          encrypted_soul_key: string | null
          id: string
          issued_at: string | null
          kybe_did: string
          state: string | null
          updated_at: string | null
        }
        Insert: {
          encrypted_soul_key?: string | null
          id?: string
          issued_at?: string | null
          kybe_did: string
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          encrypted_soul_key?: string | null
          id?: string
          issued_at?: string | null
          kybe_did?: string
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      launch_audience_segments: {
        Row: {
          audience_type: Database["public"]["Enums"]["lo_audience_type"]
          code: string
          created_at: string
          id: string
          metadata: Json
          name: string
          program_id: string
          size_estimate: number | null
          updated_at: string
        }
        Insert: {
          audience_type: Database["public"]["Enums"]["lo_audience_type"]
          code: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          program_id: string
          size_estimate?: number | null
          updated_at?: string
        }
        Update: {
          audience_type?: Database["public"]["Enums"]["lo_audience_type"]
          code?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          program_id?: string
          size_estimate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_audience_segments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_audience_segments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_audience_segments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
        ]
      }
      launch_channel_metrics: {
        Row: {
          channel_name: Database["public"]["Enums"]["lo_channel_name"]
          click_rate: number | null
          created_at: string
          engaged_comment_count: number
          follow_count: number
          growth_rate: number | null
          id: string
          open_rate: number | null
          post_count: number
          program_id: string
          reply_rate: number | null
          report_id: string | null
          save_count: number
          sent_count: number
          share_count: number
          updated_at: string
        }
        Insert: {
          channel_name: Database["public"]["Enums"]["lo_channel_name"]
          click_rate?: number | null
          created_at?: string
          engaged_comment_count?: number
          follow_count?: number
          growth_rate?: number | null
          id?: string
          open_rate?: number | null
          post_count?: number
          program_id: string
          reply_rate?: number | null
          report_id?: string | null
          save_count?: number
          sent_count?: number
          share_count?: number
          updated_at?: string
        }
        Update: {
          channel_name?: Database["public"]["Enums"]["lo_channel_name"]
          click_rate?: number | null
          created_at?: string
          engaged_comment_count?: number
          follow_count?: number
          growth_rate?: number | null
          id?: string
          open_rate?: number | null
          post_count?: number
          program_id?: string
          reply_rate?: number | null
          report_id?: string | null
          save_count?: number
          sent_count?: number
          share_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_channel_metrics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_channel_metrics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_channel_metrics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_channel_metrics_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "launch_weekly_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_channels: {
        Row: {
          channel_name: Database["public"]["Enums"]["lo_channel_name"]
          channel_role: Database["public"]["Enums"]["lo_channel_role"]
          created_at: string
          id: string
          is_active: boolean
          metadata: Json
          program_id: string
          updated_at: string
        }
        Insert: {
          channel_name: Database["public"]["Enums"]["lo_channel_name"]
          channel_role: Database["public"]["Enums"]["lo_channel_role"]
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          program_id: string
          updated_at?: string
        }
        Update: {
          channel_name?: Database["public"]["Enums"]["lo_channel_name"]
          channel_role?: Database["public"]["Enums"]["lo_channel_role"]
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          program_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_channels_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_channels_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_channels_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
        ]
      }
      launch_commercial_metrics: {
        Row: {
          aov_cents: number | null
          conversion_rate: number | null
          created_at: string
          id: string
          offer_id: string | null
          orders: number
          program_id: string
          report_id: string | null
          revenue_cents: number
          segment_id: string | null
          updated_at: string
        }
        Insert: {
          aov_cents?: number | null
          conversion_rate?: number | null
          created_at?: string
          id?: string
          offer_id?: string | null
          orders?: number
          program_id: string
          report_id?: string | null
          revenue_cents?: number
          segment_id?: string | null
          updated_at?: string
        }
        Update: {
          aov_cents?: number | null
          conversion_rate?: number | null
          created_at?: string
          id?: string
          offer_id?: string | null
          orders?: number
          program_id?: string
          report_id?: string | null
          revenue_cents?: number
          segment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_commercial_metrics_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "launch_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_commercial_metrics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_commercial_metrics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_commercial_metrics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_commercial_metrics_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "launch_weekly_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_commercial_metrics_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "launch_audience_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_objectives: {
        Row: {
          code: string
          created_at: string
          id: string
          metadata: Json
          metric_type: Database["public"]["Enums"]["lo_metric_type"]
          objective_type: Database["public"]["Enums"]["lo_objective_type"]
          program_id: string
          sort_order: number
          target_type: Database["public"]["Enums"]["lo_target_type"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          metadata?: Json
          metric_type: Database["public"]["Enums"]["lo_metric_type"]
          objective_type: Database["public"]["Enums"]["lo_objective_type"]
          program_id: string
          sort_order?: number
          target_type: Database["public"]["Enums"]["lo_target_type"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          metadata?: Json
          metric_type?: Database["public"]["Enums"]["lo_metric_type"]
          objective_type?: Database["public"]["Enums"]["lo_objective_type"]
          program_id?: string
          sort_order?: number
          target_type?: Database["public"]["Enums"]["lo_target_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_objectives_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_objectives_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_objectives_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
        ]
      }
      launch_offers: {
        Row: {
          code: string
          created_at: string
          goal: Database["public"]["Enums"]["lo_offer_goal"]
          id: string
          is_active: boolean
          metadata: Json
          name: string
          offer_type: Database["public"]["Enums"]["lo_offer_type"]
          price_cents: number | null
          program_id: string
          tier: Database["public"]["Enums"]["lo_offer_tier"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          goal: Database["public"]["Enums"]["lo_offer_goal"]
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          offer_type: Database["public"]["Enums"]["lo_offer_type"]
          price_cents?: number | null
          program_id: string
          tier: Database["public"]["Enums"]["lo_offer_tier"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          goal?: Database["public"]["Enums"]["lo_offer_goal"]
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          offer_type?: Database["public"]["Enums"]["lo_offer_type"]
          price_cents?: number | null
          program_id?: string
          tier?: Database["public"]["Enums"]["lo_offer_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_offers_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_offers_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_offers_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
        ]
      }
      launch_program_members: {
        Row: {
          can_write: boolean
          created_at: string
          id: string
          program_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_write?: boolean
          created_at?: string
          id?: string
          program_id: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_write?: boolean
          created_at?: string
          id?: string
          program_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_program_members_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_program_members_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_program_members_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
        ]
      }
      launch_programs: {
        Row: {
          created_at: string
          decision_rule: Database["public"]["Enums"]["lo_decision_rule"]
          id: string
          metadata: Json
          name: string
          owner: Database["public"]["Enums"]["lo_owner_role"]
          priority: Database["public"]["Enums"]["lo_priority"]
          slug: string
          status: Database["public"]["Enums"]["lo_program_status"]
          status_color: Database["public"]["Enums"]["lo_status_color"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          decision_rule?: Database["public"]["Enums"]["lo_decision_rule"]
          id?: string
          metadata?: Json
          name: string
          owner?: Database["public"]["Enums"]["lo_owner_role"]
          priority?: Database["public"]["Enums"]["lo_priority"]
          slug: string
          status?: Database["public"]["Enums"]["lo_program_status"]
          status_color?: Database["public"]["Enums"]["lo_status_color"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          decision_rule?: Database["public"]["Enums"]["lo_decision_rule"]
          id?: string
          metadata?: Json
          name?: string
          owner?: Database["public"]["Enums"]["lo_owner_role"]
          priority?: Database["public"]["Enums"]["lo_priority"]
          slug?: string
          status?: Database["public"]["Enums"]["lo_program_status"]
          status_color?: Database["public"]["Enums"]["lo_status_color"]
          updated_at?: string
        }
        Relationships: []
      }
      launch_proof_assets: {
        Row: {
          asset_type: Database["public"]["Enums"]["lo_proof_asset_type"]
          asset_url: string | null
          body: string | null
          created_at: string
          id: string
          is_approved: boolean
          metadata: Json
          program_id: string
          source_channel: Database["public"]["Enums"]["lo_channel_name"] | null
          source_offer_id: string | null
          source_segment_id: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          asset_type: Database["public"]["Enums"]["lo_proof_asset_type"]
          asset_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          metadata?: Json
          program_id: string
          source_channel?: Database["public"]["Enums"]["lo_channel_name"] | null
          source_offer_id?: string | null
          source_segment_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          asset_type?: Database["public"]["Enums"]["lo_proof_asset_type"]
          asset_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          metadata?: Json
          program_id?: string
          source_channel?: Database["public"]["Enums"]["lo_channel_name"] | null
          source_offer_id?: string | null
          source_segment_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_proof_assets_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_proof_assets_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_proof_assets_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_proof_assets_source_offer_id_fkey"
            columns: ["source_offer_id"]
            isOneToOne: false
            referencedRelation: "launch_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_proof_assets_source_segment_id_fkey"
            columns: ["source_segment_id"]
            isOneToOne: false
            referencedRelation: "launch_audience_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_readiness_scores: {
        Row: {
          bucket: Database["public"]["Enums"]["lo_readiness_bucket"]
          created_at: string
          id: string
          notes: string | null
          program_id: string
          report_id: string | null
          score: Database["public"]["Enums"]["lo_readiness_score"]
          updated_at: string
        }
        Insert: {
          bucket: Database["public"]["Enums"]["lo_readiness_bucket"]
          created_at?: string
          id?: string
          notes?: string | null
          program_id: string
          report_id?: string | null
          score?: Database["public"]["Enums"]["lo_readiness_score"]
          updated_at?: string
        }
        Update: {
          bucket?: Database["public"]["Enums"]["lo_readiness_bucket"]
          created_at?: string
          id?: string
          notes?: string | null
          program_id?: string
          report_id?: string | null
          score?: Database["public"]["Enums"]["lo_readiness_score"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_readiness_scores_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_readiness_scores_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_readiness_scores_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_readiness_scores_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "launch_weekly_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_sprint_tasks: {
        Row: {
          code: string
          created_at: string
          due_date: string | null
          id: string
          metadata: Json
          owner: Database["public"]["Enums"]["lo_owner_role"]
          priority: Database["public"]["Enums"]["lo_priority"]
          program_id: string
          sort_order: number
          status: Database["public"]["Enums"]["lo_task_status"]
          status_color: Database["public"]["Enums"]["lo_status_color"]
          task_type: Database["public"]["Enums"]["lo_task_type"]
          title: string
          updated_at: string
          week_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          due_date?: string | null
          id?: string
          metadata?: Json
          owner: Database["public"]["Enums"]["lo_owner_role"]
          priority?: Database["public"]["Enums"]["lo_priority"]
          program_id: string
          sort_order?: number
          status?: Database["public"]["Enums"]["lo_task_status"]
          status_color?: Database["public"]["Enums"]["lo_status_color"]
          task_type: Database["public"]["Enums"]["lo_task_type"]
          title: string
          updated_at?: string
          week_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          due_date?: string | null
          id?: string
          metadata?: Json
          owner?: Database["public"]["Enums"]["lo_owner_role"]
          priority?: Database["public"]["Enums"]["lo_priority"]
          program_id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["lo_task_status"]
          status_color?: Database["public"]["Enums"]["lo_status_color"]
          task_type?: Database["public"]["Enums"]["lo_task_type"]
          title?: string
          updated_at?: string
          week_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "launch_sprint_tasks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_sprint_tasks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_sprint_tasks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_sprint_tasks_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "launch_sprint_weeks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_sprint_tasks_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "v_week_progress_summary"
            referencedColumns: ["week_id"]
          },
        ]
      }
      launch_sprint_weeks: {
        Row: {
          created_at: string
          goal: string | null
          id: string
          label: string
          program_id: string
          status: Database["public"]["Enums"]["lo_task_status"]
          status_color: Database["public"]["Enums"]["lo_status_color"]
          updated_at: string
          week_number: number
        }
        Insert: {
          created_at?: string
          goal?: string | null
          id?: string
          label: string
          program_id: string
          status?: Database["public"]["Enums"]["lo_task_status"]
          status_color?: Database["public"]["Enums"]["lo_status_color"]
          updated_at?: string
          week_number: number
        }
        Update: {
          created_at?: string
          goal?: string | null
          id?: string
          label?: string
          program_id?: string
          status?: Database["public"]["Enums"]["lo_task_status"]
          status_color?: Database["public"]["Enums"]["lo_status_color"]
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "launch_sprint_weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_sprint_weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_sprint_weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
        ]
      }
      launch_weekly_reports: {
        Row: {
          best_messages: Json
          created_at: string
          id: string
          next_week_priorities: Json
          program_id: string
          recommendation: Database["public"]["Enums"]["lo_recommendation"]
          recommendation_reason: string | null
          status: Database["public"]["Enums"]["lo_task_status"]
          status_color: Database["public"]["Enums"]["lo_status_color"]
          summary: string | null
          top_losses: Json
          top_objections: Json
          top_wins: Json
          updated_at: string
          week_number: number
        }
        Insert: {
          best_messages?: Json
          created_at?: string
          id?: string
          next_week_priorities?: Json
          program_id: string
          recommendation?: Database["public"]["Enums"]["lo_recommendation"]
          recommendation_reason?: string | null
          status?: Database["public"]["Enums"]["lo_task_status"]
          status_color?: Database["public"]["Enums"]["lo_status_color"]
          summary?: string | null
          top_losses?: Json
          top_objections?: Json
          top_wins?: Json
          updated_at?: string
          week_number: number
        }
        Update: {
          best_messages?: Json
          created_at?: string
          id?: string
          next_week_priorities?: Json
          program_id?: string
          recommendation?: Database["public"]["Enums"]["lo_recommendation"]
          recommendation_reason?: string | null
          status?: Database["public"]["Enums"]["lo_task_status"]
          status_color?: Database["public"]["Enums"]["lo_status_color"]
          summary?: string | null
          top_losses?: Json
          top_objections?: Json
          top_wins?: Json
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "launch_weekly_reports_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_weekly_reports_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_weekly_reports_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
        ]
      }
      mailbox: {
        Row: {
          created_at: string | null
          last_pull: string | null
          mailbox_id: string
          relay_hint: string | null
        }
        Insert: {
          created_at?: string | null
          last_pull?: string | null
          mailbox_id: string
          relay_hint?: string | null
        }
        Update: {
          created_at?: string | null
          last_pull?: string | null
          mailbox_id?: string
          relay_hint?: string | null
        }
        Relationships: []
      }
      master_content_qubes: {
        Row: {
          auto_drive_cid: string
          blak_qube_id: string | null
          content_type: Database["public"]["Enums"]["master_content_type"]
          cover_thumb_url: string | null
          created_at: string | null
          edition_tier: string | null
          encryption_alg: string
          encryption_auth_tag: string | null
          encryption_iv: string
          episode_number: number
          file_size: number | null
          id: string
          meta_qube_id: string | null
          mime_type: string
          page_count: number | null
          pages_count: number | null
          pages_ready: boolean | null
          pdf_lite_url: string | null
          series: string
          status: string | null
          title: string
          token_qube_id: string | null
          updated_at: string | null
        }
        Insert: {
          auto_drive_cid: string
          blak_qube_id?: string | null
          content_type: Database["public"]["Enums"]["master_content_type"]
          cover_thumb_url?: string | null
          created_at?: string | null
          edition_tier?: string | null
          encryption_alg?: string
          encryption_auth_tag?: string | null
          encryption_iv: string
          episode_number: number
          file_size?: number | null
          id: string
          meta_qube_id?: string | null
          mime_type: string
          page_count?: number | null
          pages_count?: number | null
          pages_ready?: boolean | null
          pdf_lite_url?: string | null
          series?: string
          status?: string | null
          title: string
          token_qube_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_drive_cid?: string
          blak_qube_id?: string | null
          content_type?: Database["public"]["Enums"]["master_content_type"]
          cover_thumb_url?: string | null
          created_at?: string | null
          edition_tier?: string | null
          encryption_alg?: string
          encryption_auth_tag?: string | null
          encryption_iv?: string
          episode_number?: number
          file_size?: number | null
          id?: string
          meta_qube_id?: string | null
          mime_type?: string
          page_count?: number | null
          pages_count?: number | null
          pages_ready?: boolean | null
          pdf_lite_url?: string | null
          series?: string
          status?: string | null
          title?: string
          token_qube_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_content_qubes_blak_qube_id_fkey"
            columns: ["blak_qube_id"]
            isOneToOne: false
            referencedRelation: "iq_blak_qubes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_content_qubes_meta_qube_id_fkey"
            columns: ["meta_qube_id"]
            isOneToOne: false
            referencedRelation: "iq_meta_qubes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_content_qubes_token_qube_id_fkey"
            columns: ["token_qube_id"]
            isOneToOne: false
            referencedRelation: "iq_token_qubes"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt_text: string | null
          asset_type: string
          created_at: string
          creator_root_did: string | null
          deleted_at: string | null
          duration_seconds: number | null
          file_name: string | null
          height: number | null
          id: string
          mime_type: string
          size_bytes: number | null
          storage_bucket: string | null
          storage_provider: Database["public"]["Enums"]["storage_provider"]
          storage_uri: string
          tenant_id: string
          thumbnail_storage_provider:
            | Database["public"]["Enums"]["storage_provider"]
            | null
          thumbnail_uri: string | null
          updated_at: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          asset_type: string
          created_at?: string
          creator_root_did?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          file_name?: string | null
          height?: number | null
          id?: string
          mime_type: string
          size_bytes?: number | null
          storage_bucket?: string | null
          storage_provider?: Database["public"]["Enums"]["storage_provider"]
          storage_uri: string
          tenant_id: string
          thumbnail_storage_provider?:
            | Database["public"]["Enums"]["storage_provider"]
            | null
          thumbnail_uri?: string | null
          updated_at?: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          asset_type?: string
          created_at?: string
          creator_root_did?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          file_name?: string | null
          height?: number | null
          id?: string
          mime_type?: string
          size_bytes?: number | null
          storage_bucket?: string | null
          storage_provider?: Database["public"]["Enums"]["storage_provider"]
          storage_uri?: string
          tenant_id?: string
          thumbnail_storage_provider?:
            | Database["public"]["Enums"]["storage_provider"]
            | null
          thumbnail_uri?: string | null
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      nakamoto_agent_branches: {
        Row: {
          agent_site_id: string
          audience: string | null
          created_at: string
          display_name: string
          id: string
          kind: string
          long_context_md: string | null
          safety_notes_md: string | null
          short_summary: string | null
          system_prompt_template_md: string | null
          tone: string | null
          updated_at: string
          values_json: Json
        }
        Insert: {
          agent_site_id: string
          audience?: string | null
          created_at?: string
          display_name: string
          id?: string
          kind: string
          long_context_md?: string | null
          safety_notes_md?: string | null
          short_summary?: string | null
          system_prompt_template_md?: string | null
          tone?: string | null
          updated_at?: string
          values_json: Json
        }
        Update: {
          agent_site_id?: string
          audience?: string | null
          created_at?: string
          display_name?: string
          id?: string
          kind?: string
          long_context_md?: string | null
          safety_notes_md?: string | null
          short_summary?: string | null
          system_prompt_template_md?: string | null
          tone?: string | null
          updated_at?: string
          values_json?: Json
        }
        Relationships: []
      }
      nakamoto_agent_sites: {
        Row: {
          brand_identity: Json | null
          branding_json: Json
          created_at: string
          display_name: string
          id: string
          is_master: boolean | null
          owner_user_id: string
          seed_status: string | null
          seeded_at: string | null
          site_slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          brand_identity?: Json | null
          branding_json: Json
          created_at?: string
          display_name: string
          id?: string
          is_master?: boolean | null
          owner_user_id: string
          seed_status?: string | null
          seeded_at?: string | null
          site_slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          brand_identity?: Json | null
          branding_json?: Json
          created_at?: string
          display_name?: string
          id?: string
          is_master?: boolean | null
          owner_user_id?: string
          seed_status?: string | null
          seeded_at?: string | null
          site_slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      nakamoto_aigents: {
        Row: {
          agent_kind: string
          agent_site_id: string
          created_at: string
          id: string
          is_mutable: boolean
          is_system_agent: boolean
          name: string
          runtime_prefs_json: Json
          system_prompt_md: string
          updated_at: string
        }
        Insert: {
          agent_kind?: string
          agent_site_id: string
          created_at?: string
          id?: string
          is_mutable?: boolean
          is_system_agent?: boolean
          name: string
          runtime_prefs_json: Json
          system_prompt_md?: string
          updated_at?: string
        }
        Update: {
          agent_kind?: string
          agent_site_id?: string
          created_at?: string
          id?: string
          is_mutable?: boolean
          is_system_agent?: boolean
          name?: string
          runtime_prefs_json?: Json
          system_prompt_md?: string
          updated_at?: string
        }
        Relationships: []
      }
      nakamoto_asset_policies: {
        Row: {
          asset_id: string
          created_at: string
          id: string
          pay_to_did: string
          price_amount: number | null
          price_asset: string | null
          rights: string[]
          tokenqube_template: string | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
          pay_to_did: string
          price_amount?: number | null
          price_asset?: string | null
          rights: string[]
          tokenqube_template?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
          pay_to_did?: string
          price_amount?: number | null
          price_asset?: string | null
          rights?: string[]
          tokenqube_template?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: []
      }
      nakamoto_audit_logs: {
        Row: {
          action: string
          agent_site_id: string | null
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          agent_site_id?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          agent_site_id?: string | null
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      nakamoto_blak_qubes: {
        Row: {
          Address: string | null
          Age: string | null
          "BTC-Public-Key": string
          "Chain-IDs": string[]
          "Characters-Owned": string | null
          created_at: string
          "Digital-Comics-Owned": string | null
          "Discord-Handle": string | null
          Email: string
          "EVM-Public-Key": string
          "Facebook-ID": string | null
          "First-Name": string | null
          "GitHub-Handle": string | null
          id: string
          "Instagram-Handle": string | null
          "KNYT-Cards-Owned": string | null
          "KNYT-COYN-Owned": string | null
          "KNYT-ID": string | null
          "KNYT-Posters-Owned": string | null
          "Last-Name": string | null
          "LinkedIn-ID": string | null
          "LinkedIn-Profile-URL": string | null
          "Local-City": string
          "Metaiye-Shares-Owned": string | null
          "MetaKeep-Public-Key": string | null
          "Motion-Comics-Owned": string | null
          "OM-Member-Since": string | null
          "OM-Tier-Status": string | null
          "Paper-Comics-Owned": string | null
          "Phone-Number": string | null
          Profession: string
          "Qrypto-ID": string | null
          "Telegram-Handle": string | null
          "ThirdWeb-Public-Key": string | null
          "TikTok-Handle": string | null
          "Tokens-of-Interest": string[]
          "Twitter-Handle": string | null
          updated_at: string
          user_id: string
          "Wallets-of-Interest": string[]
          "Web3-Interests": string[]
          "YouTube-ID": string | null
        }
        Insert: {
          Address?: string | null
          Age?: string | null
          "BTC-Public-Key"?: string
          "Chain-IDs": string[]
          "Characters-Owned"?: string | null
          created_at?: string
          "Digital-Comics-Owned"?: string | null
          "Discord-Handle"?: string | null
          Email?: string
          "EVM-Public-Key"?: string
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          "GitHub-Handle"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "KNYT-Cards-Owned"?: string | null
          "KNYT-COYN-Owned"?: string | null
          "KNYT-ID"?: string | null
          "KNYT-Posters-Owned"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string
          "Metaiye-Shares-Owned"?: string | null
          "MetaKeep-Public-Key"?: string | null
          "Motion-Comics-Owned"?: string | null
          "OM-Member-Since"?: string | null
          "OM-Tier-Status"?: string | null
          "Paper-Comics-Owned"?: string | null
          "Phone-Number"?: string | null
          Profession?: string
          "Qrypto-ID"?: string | null
          "Telegram-Handle"?: string | null
          "ThirdWeb-Public-Key"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest": string[]
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id: string
          "Wallets-of-Interest": string[]
          "Web3-Interests": string[]
          "YouTube-ID"?: string | null
        }
        Update: {
          Address?: string | null
          Age?: string | null
          "BTC-Public-Key"?: string
          "Chain-IDs"?: string[]
          "Characters-Owned"?: string | null
          created_at?: string
          "Digital-Comics-Owned"?: string | null
          "Discord-Handle"?: string | null
          Email?: string
          "EVM-Public-Key"?: string
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          "GitHub-Handle"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "KNYT-Cards-Owned"?: string | null
          "KNYT-COYN-Owned"?: string | null
          "KNYT-ID"?: string | null
          "KNYT-Posters-Owned"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string
          "Metaiye-Shares-Owned"?: string | null
          "MetaKeep-Public-Key"?: string | null
          "Motion-Comics-Owned"?: string | null
          "OM-Member-Since"?: string | null
          "OM-Tier-Status"?: string | null
          "Paper-Comics-Owned"?: string | null
          "Phone-Number"?: string | null
          Profession?: string
          "Qrypto-ID"?: string | null
          "Telegram-Handle"?: string | null
          "ThirdWeb-Public-Key"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[]
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id?: string
          "Wallets-of-Interest"?: string[]
          "Web3-Interests"?: string[]
          "YouTube-ID"?: string | null
        }
        Relationships: []
      }
      nakamoto_chat_sessions: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          session_data: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          session_data?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          session_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      nakamoto_content_categories: {
        Row: {
          agent_site_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          order_index: number | null
          pillar_id: string | null
          slug: string
          strand: string
          updated_at: string | null
        }
        Insert: {
          agent_site_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
          pillar_id?: string | null
          slug: string
          strand: string
          updated_at?: string | null
        }
        Update: {
          agent_site_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
          pillar_id?: string | null
          slug?: string
          strand?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      nakamoto_content_items: {
        Row: {
          accessibility_json: Json
          agent_site_id: string | null
          analytics_json: Json
          category_id: string | null
          completions_count: number | null
          content_qube_id: string | null
          contentqube_id: string | null
          cover_image_id: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          has_captions: boolean | null
          has_transcript: boolean | null
          id: string
          iqube_policy_json: Json | null
          l2e_cta_label: string | null
          l2e_cta_url: string | null
          l2e_points: number | null
          l2e_quiz_url: string | null
          og_json: Json | null
          owner_id: string
          pillar_id: string | null
          pinned: boolean | null
          publish_at: string | null
          slug: string
          social_embed_html: string | null
          social_source: string | null
          social_url: string | null
          status: string | null
          strand: string
          tags: string[] | null
          title: string
          token_qube_ref: string | null
          tokenqube_ref: string | null
          type: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          accessibility_json: Json
          agent_site_id?: string | null
          analytics_json: Json
          category_id?: string | null
          completions_count?: number | null
          content_qube_id?: string | null
          contentqube_id?: string | null
          cover_image_id?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          has_captions?: boolean | null
          has_transcript?: boolean | null
          id?: string
          iqube_policy_json?: Json | null
          l2e_cta_label?: string | null
          l2e_cta_url?: string | null
          l2e_points?: number | null
          l2e_quiz_url?: string | null
          og_json?: Json | null
          owner_id: string
          pillar_id?: string | null
          pinned?: boolean | null
          publish_at?: string | null
          slug: string
          social_embed_html?: string | null
          social_source?: string | null
          social_url?: string | null
          status?: string | null
          strand: string
          tags?: string[] | null
          title: string
          token_qube_ref?: string | null
          tokenqube_ref?: string | null
          type: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          accessibility_json?: Json
          agent_site_id?: string | null
          analytics_json?: Json
          category_id?: string | null
          completions_count?: number | null
          content_qube_id?: string | null
          contentqube_id?: string | null
          cover_image_id?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          has_captions?: boolean | null
          has_transcript?: boolean | null
          id?: string
          iqube_policy_json?: Json | null
          l2e_cta_label?: string | null
          l2e_cta_url?: string | null
          l2e_points?: number | null
          l2e_quiz_url?: string | null
          og_json?: Json | null
          owner_id?: string
          pillar_id?: string | null
          pinned?: boolean | null
          publish_at?: string | null
          slug?: string
          social_embed_html?: string | null
          social_source?: string | null
          social_url?: string | null
          status?: string | null
          strand?: string
          tags?: string[] | null
          title?: string
          token_qube_ref?: string | null
          tokenqube_ref?: string | null
          type?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      nakamoto_conversation_summaries: {
        Row: {
          conversation_type: string
          created_at: string
          id: string
          included_interaction_ids: string[]
          summary_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_type: string
          created_at?: string
          id?: string
          included_interaction_ids: string[]
          summary_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_type?: string
          created_at?: string
          id?: string
          included_interaction_ids?: string[]
          summary_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nakamoto_crm_interactions: {
        Row: {
          agent_site_id: string
          data_json: Json
          id: string
          item_id: string | null
          kind: string
          occurred_at: string
          pillar_id: string | null
          profile_id: string | null
          score_delta: number
        }
        Insert: {
          agent_site_id: string
          data_json: Json
          id?: string
          item_id?: string | null
          kind: string
          occurred_at?: string
          pillar_id?: string | null
          profile_id?: string | null
          score_delta?: number
        }
        Update: {
          agent_site_id?: string
          data_json?: Json
          id?: string
          item_id?: string | null
          kind?: string
          occurred_at?: string
          pillar_id?: string | null
          profile_id?: string | null
          score_delta?: number
        }
        Relationships: []
      }
      nakamoto_crm_profiles: {
        Row: {
          agent_site_id: string
          consents_json: Json
          created_at: string
          email: string | null
          handle: string | null
          id: string
          metadata_json: Json
          segments: string[]
          user_id: string | null
        }
        Insert: {
          agent_site_id: string
          consents_json: Json
          created_at?: string
          email?: string | null
          handle?: string | null
          id?: string
          metadata_json: Json
          segments: string[]
          user_id?: string | null
        }
        Update: {
          agent_site_id?: string
          consents_json?: Json
          created_at?: string
          email?: string | null
          handle?: string | null
          id?: string
          metadata_json?: Json
          segments?: string[]
          user_id?: string | null
        }
        Relationships: []
      }
      nakamoto_did_identities: {
        Row: {
          agent_handle: string | null
          created_at: string
          did: string
          id: string
          kybe_did: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_handle?: string | null
          created_at?: string
          did: string
          id?: string
          kybe_did?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_handle?: string | null
          created_at?: string
          did?: string
          id?: string
          kybe_did?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      nakamoto_email_batches: {
        Row: {
          batch_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          emails_failed: number
          emails_sent: number
          id: string
          started_at: string | null
          status: string
          total_emails: number
        }
        Insert: {
          batch_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          emails_failed?: number
          emails_sent?: number
          id?: string
          started_at?: string | null
          status?: string
          total_emails: number
        }
        Update: {
          batch_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          emails_failed?: number
          emails_sent?: number
          id?: string
          started_at?: string | null
          status?: string
          total_emails?: number
        }
        Relationships: []
      }
      nakamoto_entitlements: {
        Row: {
          asset_id: string
          created_at: string
          expires_at: string | null
          holder_did: string
          holder_user_id: string | null
          id: string
          rights: string[]
          tokenqube_id: string | null
          x402_id: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string
          expires_at?: string | null
          holder_did: string
          holder_user_id?: string | null
          id?: string
          rights: string[]
          tokenqube_id?: string | null
          x402_id?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string
          expires_at?: string | null
          holder_did?: string
          holder_user_id?: string | null
          id?: string
          rights?: string[]
          tokenqube_id?: string | null
          x402_id?: string | null
        }
        Relationships: []
      }
      nakamoto_invitation_signup_stats: {
        Row: {
          completed_signups: number | null
          conversion_rate_percent: number | null
          emails_sent: number | null
          invitation_date: string | null
          pending_signups: number | null
          persona_type: string | null
          total_invitations: number | null
        }
        Insert: {
          completed_signups?: number | null
          conversion_rate_percent?: number | null
          emails_sent?: number | null
          invitation_date?: string | null
          pending_signups?: number | null
          persona_type?: string | null
          total_invitations?: number | null
        }
        Update: {
          completed_signups?: number | null
          conversion_rate_percent?: number | null
          emails_sent?: number | null
          invitation_date?: string | null
          pending_signups?: number | null
          persona_type?: string | null
          total_invitations?: number | null
        }
        Relationships: []
      }
      nakamoto_invited_users: {
        Row: {
          batch_id: string | null
          completed_at: string | null
          email: string
          email_sent: boolean
          email_sent_at: string | null
          expires_at: string
          id: string
          invitation_token: string
          invited_at: string
          invited_by: string | null
          persona_data: Json
          persona_type: string
          send_attempts: number
          signup_completed: boolean
        }
        Insert: {
          batch_id?: string | null
          completed_at?: string | null
          email: string
          email_sent?: boolean
          email_sent_at?: string | null
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_at?: string
          invited_by?: string | null
          persona_data: Json
          persona_type: string
          send_attempts?: number
          signup_completed?: boolean
        }
        Update: {
          batch_id?: string | null
          completed_at?: string | null
          email?: string
          email_sent?: boolean
          email_sent_at?: string | null
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_at?: string
          invited_by?: string | null
          persona_data?: Json
          persona_type?: string
          send_attempts?: number
          signup_completed?: boolean
        }
        Relationships: []
      }
      nakamoto_knyt_persona_rewards: {
        Row: {
          created_at: string
          data_completed: boolean | null
          id: string
          linkedin_connected: boolean | null
          metamask_connected: boolean | null
          reward_amount: number | null
          reward_claimed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_completed?: boolean | null
          id?: string
          linkedin_connected?: boolean | null
          metamask_connected?: boolean | null
          reward_amount?: number | null
          reward_claimed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_completed?: boolean | null
          id?: string
          linkedin_connected?: boolean | null
          metamask_connected?: boolean | null
          reward_amount?: number | null
          reward_claimed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nakamoto_knyt_personas: {
        Row: {
          Address: string | null
          Age: string | null
          "BTC-Public-Key": string | null
          campaign_cohort: string | null
          campaign_notes: string | null
          campaign_state: string | null
          campaign_tags: string[] | null
          "Chain-IDs": string[] | null
          "Characters-Owned": string | null
          community_role: string | null
          content_contribution_count: number
          created_at: string
          csv_first_committed_date: string | null
          csv_investment_status: string | null
          csv_last_disbursed_date: string | null
          csv_metaknyt_nfts: string | null
          csv_other_nfts: string | null
          csv_transaction_count: number | null
          csv_transfer_methods: string | null
          "Digital-Comics-Owned": string | null
          "Discord-Handle": string | null
          Email: string | null
          "EVM-Public-Key": string | null
          "Facebook-ID": string | null
          "First-Name": string | null
          id: string
          "Instagram-Handle": string | null
          investment_amount_band: string | null
          investor_priority_band: string | null
          is_content_creator: boolean
          is_franchisee: boolean
          is_remixer: boolean
          is_steward: boolean
          kickstarter_backed_at: string | null
          kickstarter_clicked_at: string | null
          "KNYT-Cards-Owned": string | null
          "KNYT-COYN-Owned": string | null
          "KNYT-ID": string | null
          "KNYT-Posters-Owned": string | null
          ks_backer: boolean
          last_campaign_sent_at: string | null
          last_campaign_sequence: string | null
          "Last-Name": string | null
          "LinkedIn-ID": string | null
          "LinkedIn-Profile-URL": string | null
          "Local-City": string | null
          matrix_y_stage: string | null
          message_angle: string | null
          "Metaiye-Shares-Owned": string | null
          "MetaKeep-Public-Key": string | null
          "Motion-Comics-Owned": string | null
          offer_fit: string | null
          "OM-Member-Since": string | null
          "OM-Tier-Status": string | null
          "Paper-Comics-Owned": string | null
          "Phone-Number": string | null
          platform_activated_at: string | null
          platform_auth_profile_id: string | null
          platform_engagement_score: number
          preferred_channel_primary: string | null
          preferred_channel_secondary: string | null
          Profession: string | null
          profile_image_url: string | null
          reactivation_potential: string | null
          remix_count: number
          "Telegram-Handle": string | null
          "ThirdWeb-Public-Key": string | null
          "TikTok-Handle": string | null
          "Tokens-of-Interest": string[] | null
          "Total-Invested": string | null
          "Twitter-Handle": string | null
          updated_at: string
          user_id: string | null
          "Wallets-of-Interest": string[] | null
          "Web3-Interests": string[] | null
          "YouTube-ID": string | null
        }
        Insert: {
          Address?: string | null
          Age?: string | null
          "BTC-Public-Key"?: string | null
          campaign_cohort?: string | null
          campaign_notes?: string | null
          campaign_state?: string | null
          campaign_tags?: string[] | null
          "Chain-IDs"?: string[] | null
          "Characters-Owned"?: string | null
          community_role?: string | null
          content_contribution_count?: number
          created_at?: string
          csv_first_committed_date?: string | null
          csv_investment_status?: string | null
          csv_last_disbursed_date?: string | null
          csv_metaknyt_nfts?: string | null
          csv_other_nfts?: string | null
          csv_transaction_count?: number | null
          csv_transfer_methods?: string | null
          "Digital-Comics-Owned"?: string | null
          "Discord-Handle"?: string | null
          Email?: string | null
          "EVM-Public-Key"?: string | null
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          investment_amount_band?: string | null
          investor_priority_band?: string | null
          is_content_creator?: boolean
          is_franchisee?: boolean
          is_remixer?: boolean
          is_steward?: boolean
          kickstarter_backed_at?: string | null
          kickstarter_clicked_at?: string | null
          "KNYT-Cards-Owned"?: string | null
          "KNYT-COYN-Owned"?: string | null
          "KNYT-ID"?: string | null
          "KNYT-Posters-Owned"?: string | null
          ks_backer?: boolean
          last_campaign_sent_at?: string | null
          last_campaign_sequence?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string | null
          matrix_y_stage?: string | null
          message_angle?: string | null
          "Metaiye-Shares-Owned"?: string | null
          "MetaKeep-Public-Key"?: string | null
          "Motion-Comics-Owned"?: string | null
          offer_fit?: string | null
          "OM-Member-Since"?: string | null
          "OM-Tier-Status"?: string | null
          "Paper-Comics-Owned"?: string | null
          "Phone-Number"?: string | null
          platform_activated_at?: string | null
          platform_auth_profile_id?: string | null
          platform_engagement_score?: number
          preferred_channel_primary?: string | null
          preferred_channel_secondary?: string | null
          Profession?: string | null
          profile_image_url?: string | null
          reactivation_potential?: string | null
          remix_count?: number
          "Telegram-Handle"?: string | null
          "ThirdWeb-Public-Key"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[] | null
          "Total-Invested"?: string | null
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id?: string | null
          "Wallets-of-Interest"?: string[] | null
          "Web3-Interests"?: string[] | null
          "YouTube-ID"?: string | null
        }
        Update: {
          Address?: string | null
          Age?: string | null
          "BTC-Public-Key"?: string | null
          campaign_cohort?: string | null
          campaign_notes?: string | null
          campaign_state?: string | null
          campaign_tags?: string[] | null
          "Chain-IDs"?: string[] | null
          "Characters-Owned"?: string | null
          community_role?: string | null
          content_contribution_count?: number
          created_at?: string
          csv_first_committed_date?: string | null
          csv_investment_status?: string | null
          csv_last_disbursed_date?: string | null
          csv_metaknyt_nfts?: string | null
          csv_other_nfts?: string | null
          csv_transaction_count?: number | null
          csv_transfer_methods?: string | null
          "Digital-Comics-Owned"?: string | null
          "Discord-Handle"?: string | null
          Email?: string | null
          "EVM-Public-Key"?: string | null
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          investment_amount_band?: string | null
          investor_priority_band?: string | null
          is_content_creator?: boolean
          is_franchisee?: boolean
          is_remixer?: boolean
          is_steward?: boolean
          kickstarter_backed_at?: string | null
          kickstarter_clicked_at?: string | null
          "KNYT-Cards-Owned"?: string | null
          "KNYT-COYN-Owned"?: string | null
          "KNYT-ID"?: string | null
          "KNYT-Posters-Owned"?: string | null
          ks_backer?: boolean
          last_campaign_sent_at?: string | null
          last_campaign_sequence?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string | null
          matrix_y_stage?: string | null
          message_angle?: string | null
          "Metaiye-Shares-Owned"?: string | null
          "MetaKeep-Public-Key"?: string | null
          "Motion-Comics-Owned"?: string | null
          offer_fit?: string | null
          "OM-Member-Since"?: string | null
          "OM-Tier-Status"?: string | null
          "Paper-Comics-Owned"?: string | null
          "Phone-Number"?: string | null
          platform_activated_at?: string | null
          platform_auth_profile_id?: string | null
          platform_engagement_score?: number
          preferred_channel_primary?: string | null
          preferred_channel_secondary?: string | null
          Profession?: string | null
          profile_image_url?: string | null
          reactivation_potential?: string | null
          remix_count?: number
          "Telegram-Handle"?: string | null
          "ThirdWeb-Public-Key"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[] | null
          "Total-Invested"?: string | null
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id?: string | null
          "Wallets-of-Interest"?: string[] | null
          "Web3-Interests"?: string[] | null
          "YouTube-ID"?: string | null
        }
        Relationships: []
      }
      nakamoto_master_site_updates: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string
          entity_data: Json
          entity_id: string
          id: string
          notes: string | null
          pushed_at: string | null
          source_site_id: string
          status: string
          target_sites: string[] | null
          update_type: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by: string
          entity_data: Json
          entity_id: string
          id?: string
          notes?: string | null
          pushed_at?: string | null
          source_site_id: string
          status?: string
          target_sites?: string[] | null
          update_type: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string
          entity_data?: Json
          entity_id?: string
          id?: string
          notes?: string | null
          pushed_at?: string | null
          source_site_id?: string
          status?: string
          target_sites?: string[] | null
          update_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      nakamoto_media_assets: {
        Row: {
          caption_path: string | null
          checksum: string | null
          content_item_id: string
          created_at: string | null
          duration_seconds: number | null
          external_url: string | null
          filesize_bytes: number | null
          height: number | null
          id: string
          kind: string
          mime_type: string | null
          oembed_html: string | null
          storage_path: string | null
          transcript_path: string | null
          width: number | null
        }
        Insert: {
          caption_path?: string | null
          checksum?: string | null
          content_item_id: string
          created_at?: string | null
          duration_seconds?: number | null
          external_url?: string | null
          filesize_bytes?: number | null
          height?: number | null
          id?: string
          kind: string
          mime_type?: string | null
          oembed_html?: string | null
          storage_path?: string | null
          transcript_path?: string | null
          width?: number | null
        }
        Update: {
          caption_path?: string | null
          checksum?: string | null
          content_item_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          external_url?: string | null
          filesize_bytes?: number | null
          height?: number | null
          id?: string
          kind?: string
          mime_type?: string | null
          oembed_html?: string | null
          storage_path?: string | null
          transcript_path?: string | null
          width?: number | null
        }
        Relationships: []
      }
      nakamoto_media_content: {
        Row: {
          category: string
          content_type: string
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level: number | null
          duration: number | null
          file_url: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          metadata: Json | null
          reward_points: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          duration?: number | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          metadata?: Json | null
          reward_points?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          duration?: number | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          metadata?: Json | null
          reward_points?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      nakamoto_mission_pillars: {
        Row: {
          agent_site_id: string
          contentqube_id: string | null
          created_at: string
          default_utilities_json: Json
          display_name: string
          goals_json: Json
          id: string
          iqube_policy_json: Json | null
          kpis_json: Json
          long_context_md: string | null
          short_summary: string | null
          tokenqube_ref: string | null
          updated_at: string
        }
        Insert: {
          agent_site_id: string
          contentqube_id?: string | null
          created_at?: string
          default_utilities_json: Json
          display_name: string
          goals_json: Json
          id?: string
          iqube_policy_json?: Json | null
          kpis_json: Json
          long_context_md?: string | null
          short_summary?: string | null
          tokenqube_ref?: string | null
          updated_at?: string
        }
        Update: {
          agent_site_id?: string
          contentqube_id?: string | null
          created_at?: string
          default_utilities_json?: Json
          display_name?: string
          goals_json?: Json
          id?: string
          iqube_policy_json?: Json | null
          kpis_json?: Json
          long_context_md?: string | null
          short_summary?: string | null
          tokenqube_ref?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      nakamoto_mm_super_admins: {
        Row: {
          created_at: string | null
          email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      nakamoto_profiles: {
        Row: {
          avatar_url: string | null
          civic_status: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          level: number | null
          preferences: Json | null
          total_points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          civic_status?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          level?: number | null
          preferences?: Json | null
          total_points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          civic_status?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          level?: number | null
          preferences?: Json | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nakamoto_qripto_personas: {
        Row: {
          "BTC-Public-Key": string | null
          "Chain-IDs": string[] | null
          created_at: string
          "Discord-Handle": string | null
          Email: string | null
          "EVM-Public-Key": string | null
          "Facebook-ID": string | null
          "First-Name": string | null
          "GitHub-Handle": string | null
          id: string
          "Instagram-Handle": string | null
          "Last-Name": string | null
          "LinkedIn-ID": string | null
          "LinkedIn-Profile-URL": string | null
          "Local-City": string | null
          Profession: string | null
          profile_image_url: string | null
          "Qripto-ID": string | null
          "Telegram-Handle": string | null
          "TikTok-Handle": string | null
          "Tokens-of-Interest": string[] | null
          "Twitter-Handle": string | null
          updated_at: string
          user_id: string
          "Wallets-of-Interest": string[] | null
          "Web3-Interests": string[] | null
          "YouTube-ID": string | null
        }
        Insert: {
          "BTC-Public-Key"?: string | null
          "Chain-IDs"?: string[] | null
          created_at?: string
          "Discord-Handle"?: string | null
          Email?: string | null
          "EVM-Public-Key"?: string | null
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          "GitHub-Handle"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string | null
          Profession?: string | null
          profile_image_url?: string | null
          "Qripto-ID"?: string | null
          "Telegram-Handle"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[] | null
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id: string
          "Wallets-of-Interest"?: string[] | null
          "Web3-Interests"?: string[] | null
          "YouTube-ID"?: string | null
        }
        Update: {
          "BTC-Public-Key"?: string | null
          "Chain-IDs"?: string[] | null
          created_at?: string
          "Discord-Handle"?: string | null
          Email?: string | null
          "EVM-Public-Key"?: string | null
          "Facebook-ID"?: string | null
          "First-Name"?: string | null
          "GitHub-Handle"?: string | null
          id?: string
          "Instagram-Handle"?: string | null
          "Last-Name"?: string | null
          "LinkedIn-ID"?: string | null
          "LinkedIn-Profile-URL"?: string | null
          "Local-City"?: string | null
          Profession?: string | null
          profile_image_url?: string | null
          "Qripto-ID"?: string | null
          "Telegram-Handle"?: string | null
          "TikTok-Handle"?: string | null
          "Tokens-of-Interest"?: string[] | null
          "Twitter-Handle"?: string | null
          updated_at?: string
          user_id?: string
          "Wallets-of-Interest"?: string[] | null
          "Web3-Interests"?: string[] | null
          "YouTube-ID"?: string | null
        }
        Relationships: []
      }
      nakamoto_role_audit_log: {
        Row: {
          action: string
          agent_site_id: string | null
          created_at: string
          details: Json | null
          id: string
          role: string
          target_user_id: string
          user_id: string
        }
        Insert: {
          action: string
          agent_site_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          role: string
          target_user_id: string
          user_id: string
        }
        Update: {
          action?: string
          agent_site_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          role?: string
          target_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      nakamoto_security_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      nakamoto_setup_drafts: {
        Row: {
          created_at: string
          current_step: number
          id: string
          setup_state: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          id?: string
          setup_state: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: number
          id?: string
          setup_state?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nakamoto_social_connections: {
        Row: {
          account_handle: string | null
          connected: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          oauth_meta: Json | null
          provider: string
          updated_at: string | null
        }
        Insert: {
          account_handle?: string | null
          connected?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          oauth_meta?: Json | null
          provider: string
          updated_at?: string | null
        }
        Update: {
          account_handle?: string | null
          connected?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          oauth_meta?: Json | null
          provider?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      nakamoto_user_connections: {
        Row: {
          connected_at: string
          connection_data: Json | null
          created_at: string
          id: string
          service: string
          user_id: string
        }
        Insert: {
          connected_at?: string
          connection_data?: Json | null
          created_at?: string
          id?: string
          service: string
          user_id: string
        }
        Update: {
          connected_at?: string
          connection_data?: Json | null
          created_at?: string
          id?: string
          service?: string
          user_id?: string
        }
        Relationships: []
      }
      nakamoto_user_content_progress: {
        Row: {
          completed_at: string | null
          content_item_id: string
          created_at: string | null
          id: string
          progress_percentage: number | null
          score: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content_item_id: string
          created_at?: string | null
          id?: string
          progress_percentage?: number | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content_item_id?: string
          created_at?: string | null
          id?: string
          progress_percentage?: number | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nakamoto_user_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          metadata: Json | null
          query: string
          response: string
          summarized: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          metadata?: Json | null
          query: string
          response: string
          summarized?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          metadata?: Json | null
          query?: string
          response?: string
          summarized?: boolean
          user_id?: string
        }
        Relationships: []
      }
      nakamoto_user_name_preferences: {
        Row: {
          created_at: string
          custom_first_name: string | null
          custom_last_name: string | null
          id: string
          invitation_first_name: string | null
          invitation_last_name: string | null
          linkedin_first_name: string | null
          linkedin_last_name: string | null
          name_source: string
          persona_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_first_name?: string | null
          custom_last_name?: string | null
          id?: string
          invitation_first_name?: string | null
          invitation_last_name?: string | null
          linkedin_first_name?: string | null
          linkedin_last_name?: string | null
          name_source: string
          persona_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_first_name?: string | null
          custom_last_name?: string | null
          id?: string
          invitation_first_name?: string | null
          invitation_last_name?: string | null
          linkedin_first_name?: string | null
          linkedin_last_name?: string | null
          name_source?: string
          persona_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nakamoto_user_progress: {
        Row: {
          completed_at: string | null
          content_id: string
          created_at: string
          id: string
          progress_percentage: number | null
          quiz_scores: Json | null
          rewards_earned: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content_id: string
          created_at?: string
          id?: string
          progress_percentage?: number | null
          quiz_scores?: Json | null
          rewards_earned?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content_id?: string
          created_at?: string
          id?: string
          progress_percentage?: number | null
          quiz_scores?: Json | null
          rewards_earned?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nakamoto_user_roles: {
        Row: {
          agent_site_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          agent_site_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          agent_site_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      nakamoto_user_sessions: {
        Row: {
          active: boolean
          created_at: string
          device_info: Json | null
          id: string
          session_end: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          device_info?: Json | null
          id?: string
          session_end?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          device_info?: Json | null
          id?: string
          session_end?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nakamoto_utilities_config: {
        Row: {
          agent_site_id: string
          commercial_on: boolean
          commercial_opts_json: Json
          content_creation_on: boolean
          created_at: string
          id: string
          social_on: boolean
          social_opts_json: Json
          teaching_on: boolean
          teaching_opts_json: Json
          updated_at: string
        }
        Insert: {
          agent_site_id: string
          commercial_on?: boolean
          commercial_opts_json: Json
          content_creation_on?: boolean
          created_at?: string
          id?: string
          social_on?: boolean
          social_opts_json: Json
          teaching_on?: boolean
          teaching_opts_json: Json
          updated_at?: string
        }
        Update: {
          agent_site_id?: string
          commercial_on?: boolean
          commercial_opts_json?: Json
          content_creation_on?: boolean
          created_at?: string
          id?: string
          social_on?: boolean
          social_opts_json?: Json
          teaching_on?: boolean
          teaching_opts_json?: Json
          updated_at?: string
        }
        Relationships: []
      }
      nakamoto_x402_transactions: {
        Row: {
          amount: number
          asset_id: string
          asset_symbol: string
          buyer_did: string
          created_at: string
          dest_chain: string | null
          facilitator_ref: string | null
          id: string
          request_id: string
          seller_did: string
          src_chain: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          asset_id: string
          asset_symbol: string
          buyer_did: string
          created_at?: string
          dest_chain?: string | null
          facilitator_ref?: string | null
          id?: string
          request_id: string
          seller_did: string
          src_chain?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          asset_id?: string
          asset_symbol?: string
          buyer_did?: string
          created_at?: string
          dest_chain?: string | null
          facilitator_ref?: string | null
          id?: string
          request_id?: string
          seller_did?: string
          src_chain?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      nbe_plans: {
        Row: {
          created_at: string | null
          disposition: string
          experience_id: string | null
          expires_at: string | null
          id: string
          next_experience_depth: string | null
          persona_id: string
          rationale: string | null
        }
        Insert: {
          created_at?: string | null
          disposition?: string
          experience_id?: string | null
          expires_at?: string | null
          id?: string
          next_experience_depth?: string | null
          persona_id: string
          rationale?: string | null
        }
        Update: {
          created_at?: string | null
          disposition?: string
          experience_id?: string | null
          expires_at?: string | null
          id?: string
          next_experience_depth?: string | null
          persona_id?: string
          rationale?: string | null
        }
        Relationships: []
      }
      orchestration_events: {
        Row: {
          active_cartridge: string | null
          created_at: string | null
          event_id: string
          event_type: string
          from_role: string
          id: string
          journey_stage: string | null
          metadata: Json | null
          reason: string | null
          receipt_eligible: boolean | null
          to_role: string
        }
        Insert: {
          active_cartridge?: string | null
          created_at?: string | null
          event_id: string
          event_type: string
          from_role: string
          id?: string
          journey_stage?: string | null
          metadata?: Json | null
          reason?: string | null
          receipt_eligible?: boolean | null
          to_role: string
        }
        Update: {
          active_cartridge?: string | null
          created_at?: string | null
          event_id?: string
          event_type?: string
          from_role?: string
          id?: string
          journey_stage?: string | null
          metadata?: Json | null
          reason?: string | null
          receipt_eligible?: boolean | null
          to_role?: string
        }
        Relationships: []
      }
      orgqube_policies: {
        Row: {
          active: boolean | null
          allowed_agents: string[] | null
          allowed_cartridges: string[] | null
          allowed_skills: string[] | null
          authority_classes: Json | null
          created_at: string | null
          escalation_behavior: Json | null
          id: string
          native_asset_exposure: string | null
          org_id: string
          policy_name: string | null
          required_receipts: string[] | null
          skill_budget_posture: string | null
          targets: Json | null
          trust_threshold_min: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          allowed_agents?: string[] | null
          allowed_cartridges?: string[] | null
          allowed_skills?: string[] | null
          authority_classes?: Json | null
          created_at?: string | null
          escalation_behavior?: Json | null
          id?: string
          native_asset_exposure?: string | null
          org_id: string
          policy_name?: string | null
          required_receipts?: string[] | null
          skill_budget_posture?: string | null
          targets?: Json | null
          trust_threshold_min?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          allowed_agents?: string[] | null
          allowed_cartridges?: string[] | null
          allowed_skills?: string[] | null
          authority_classes?: Json | null
          created_at?: string | null
          escalation_behavior?: Json | null
          id?: string
          native_asset_exposure?: string | null
          org_id?: string
          policy_name?: string | null
          required_receipts?: string[] | null
          skill_budget_posture?: string | null
          targets?: Json | null
          trust_threshold_min?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      partner_outreach: {
        Row: {
          committed: boolean | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          first_contact_at: string | null
          follow_up_at: string | null
          id: string
          last_contact_at: string | null
          notes: string | null
          outreach_channel: string | null
          outreach_status: string | null
          partner_name: string
          platform: string | null
          updated_at: string | null
        }
        Insert: {
          committed?: boolean | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          first_contact_at?: string | null
          follow_up_at?: string | null
          id?: string
          last_contact_at?: string | null
          notes?: string | null
          outreach_channel?: string | null
          outreach_status?: string | null
          partner_name: string
          platform?: string | null
          updated_at?: string | null
        }
        Update: {
          committed?: boolean | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          first_contact_at?: string | null
          follow_up_at?: string | null
          id?: string
          last_contact_at?: string | null
          notes?: string | null
          outreach_channel?: string | null
          outreach_status?: string | null
          partner_name?: string
          platform?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          amount: number
          asset: string
          chain_id: number
          created_at: string | null
          expires_at: string
          id: string
          memo: string | null
          paid_at: string | null
          payer_address: string | null
          payer_fio: string | null
          payer_id: string
          payer_notified: boolean | null
          rejected_at: string | null
          rejection_reason: string | null
          requester_address: string
          requester_fio: string | null
          requester_id: string
          requester_notified: boolean | null
          status: string
          tx_hash: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          asset?: string
          chain_id?: number
          created_at?: string | null
          expires_at?: string
          id?: string
          memo?: string | null
          paid_at?: string | null
          payer_address?: string | null
          payer_fio?: string | null
          payer_id: string
          payer_notified?: boolean | null
          rejected_at?: string | null
          rejection_reason?: string | null
          requester_address: string
          requester_fio?: string | null
          requester_id: string
          requester_notified?: boolean | null
          status?: string
          tx_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          asset?: string
          chain_id?: number
          created_at?: string | null
          expires_at?: string
          id?: string
          memo?: string | null
          paid_at?: string | null
          payer_address?: string | null
          payer_fio?: string | null
          payer_id?: string
          payer_notified?: boolean | null
          rejected_at?: string | null
          rejection_reason?: string | null
          requester_address?: string
          requester_fio?: string | null
          requester_id?: string
          requester_notified?: boolean | null
          status?: string
          tx_hash?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pdf_page_manifests: {
        Row: {
          auto_drive_cid: string
          base_path: string
          bucket: string
          created_at: string | null
          id: string
          pages_count: number
          source_pdf_lite_url: string
          width: number
        }
        Insert: {
          auto_drive_cid: string
          base_path: string
          bucket: string
          created_at?: string | null
          id?: string
          pages_count: number
          source_pdf_lite_url: string
          width: number
        }
        Update: {
          auto_drive_cid?: string
          base_path?: string
          bucket?: string
          created_at?: string | null
          id?: string
          pages_count?: number
          source_pdf_lite_url?: string
          width?: number
        }
        Relationships: []
      }
      persona_agent_binding: {
        Row: {
          agent_id: string
          created_at: string | null
          is_primary: boolean | null
          persona_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          is_primary?: boolean | null
          persona_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          is_primary?: boolean | null
          persona_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "persona_agent_binding_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "persona_agent_binding_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_agent_binding_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_agent_binding_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_agent_binding_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
        ]
      }
      persona_legacy_20260125: {
        Row: {
          app_origin: string | null
          bio: string | null
          btc_address: string | null
          created_at: string | null
          default_identity_state: string
          evm_address: string | null
          fio_handle: string | null
          fio_handle_expiration: string | null
          fio_handle_verified: boolean | null
          fio_last_verified_at: string | null
          fio_public_key: string | null
          fio_registered_at: string | null
          fio_registration_status: string | null
          fio_tx_id: string | null
          first_paid_purchase_at: string | null
          franchise_id: string | null
          id: string
          ref_campaign_id: string | null
          referred_by_persona_id: string | null
          referrer_persona_id: string | null
          root_id: string | null
          sol_address: string | null
          tenant_id: string | null
          world_id_status: string | null
        }
        Insert: {
          app_origin?: string | null
          bio?: string | null
          btc_address?: string | null
          created_at?: string | null
          default_identity_state?: string
          evm_address?: string | null
          fio_handle?: string | null
          fio_handle_expiration?: string | null
          fio_handle_verified?: boolean | null
          fio_last_verified_at?: string | null
          fio_public_key?: string | null
          fio_registered_at?: string | null
          fio_registration_status?: string | null
          fio_tx_id?: string | null
          first_paid_purchase_at?: string | null
          franchise_id?: string | null
          id?: string
          ref_campaign_id?: string | null
          referred_by_persona_id?: string | null
          referrer_persona_id?: string | null
          root_id?: string | null
          sol_address?: string | null
          tenant_id?: string | null
          world_id_status?: string | null
        }
        Update: {
          app_origin?: string | null
          bio?: string | null
          btc_address?: string | null
          created_at?: string | null
          default_identity_state?: string
          evm_address?: string | null
          fio_handle?: string | null
          fio_handle_expiration?: string | null
          fio_handle_verified?: boolean | null
          fio_last_verified_at?: string | null
          fio_public_key?: string | null
          fio_registered_at?: string | null
          fio_registration_status?: string | null
          fio_tx_id?: string | null
          first_paid_purchase_at?: string | null
          franchise_id?: string | null
          id?: string
          ref_campaign_id?: string | null
          referred_by_persona_id?: string | null
          referrer_persona_id?: string | null
          root_id?: string | null
          sol_address?: string | null
          tenant_id?: string | null
          world_id_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persona_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_root_id_fkey"
            columns: ["root_id"]
            isOneToOne: false
            referencedRelation: "root_identity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      persona_metame_settings: {
        Row: {
          budget_posture: string
          created_at: string
          curated_skills_only: boolean
          explanation_first: boolean
          guardian_mode: boolean
          id: string
          lead_agent: string
          persona_id: string
          receipt_visibility: boolean
          updated_at: string
        }
        Insert: {
          budget_posture?: string
          created_at?: string
          curated_skills_only?: boolean
          explanation_first?: boolean
          guardian_mode?: boolean
          id?: string
          lead_agent?: string
          persona_id: string
          receipt_visibility?: boolean
          updated_at?: string
        }
        Update: {
          budget_posture?: string
          created_at?: string
          curated_skills_only?: boolean
          explanation_first?: boolean
          guardian_mode?: boolean
          id?: string
          lead_agent?: string
          persona_id?: string
          receipt_visibility?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      personas: {
        Row: {
          app_origin: string | null
          auth_profile_id: string | null
          avatar_uri: string | null
          badges: string[]
          bio: string | null
          btc_address: string | null
          chain_addresses: Json
          created_at: string
          default_identity_state: string | null
          discoverable_within_tenant: boolean
          display_name: string
          evm_address: string | null
          evm_key: Json | null
          fio_domain: string
          fio_handle: string
          fio_handle_expiration: string | null
          fio_handle_verified: boolean | null
          fio_last_verified_at: string | null
          fio_public_key: string | null
          fio_registered_at: string | null
          fio_registration: Json | null
          fio_registration_status: string | null
          fio_tx_id: string | null
          first_paid_purchase_at: string | null
          id: string
          metadata: Json | null
          order_tier: Database["public"]["Enums"]["order_tier"] | null
          ref_campaign_id: string | null
          referral_identifier: string | null
          referral_locked_at: string | null
          referral_method: string | null
          referred_by_persona_id: string | null
          referrer_persona_id: string | null
          reputation_bucket: number
          reputation_score: number
          reputation_tier: Database["public"]["Enums"]["reputation_tier"] | null
          root_did: string
          root_id: string | null
          sol_address: string | null
          status: string
          tenant_id: string
          type: string
          updated_at: string
          world_id_status: string | null
        }
        Insert: {
          app_origin?: string | null
          auth_profile_id?: string | null
          avatar_uri?: string | null
          badges?: string[]
          bio?: string | null
          btc_address?: string | null
          chain_addresses?: Json
          created_at?: string
          default_identity_state?: string | null
          discoverable_within_tenant?: boolean
          display_name: string
          evm_address?: string | null
          evm_key?: Json | null
          fio_domain: string
          fio_handle: string
          fio_handle_expiration?: string | null
          fio_handle_verified?: boolean | null
          fio_last_verified_at?: string | null
          fio_public_key?: string | null
          fio_registered_at?: string | null
          fio_registration?: Json | null
          fio_registration_status?: string | null
          fio_tx_id?: string | null
          first_paid_purchase_at?: string | null
          id?: string
          metadata?: Json | null
          order_tier?: Database["public"]["Enums"]["order_tier"] | null
          ref_campaign_id?: string | null
          referral_identifier?: string | null
          referral_locked_at?: string | null
          referral_method?: string | null
          referred_by_persona_id?: string | null
          referrer_persona_id?: string | null
          reputation_bucket?: number
          reputation_score?: number
          reputation_tier?:
            | Database["public"]["Enums"]["reputation_tier"]
            | null
          root_did: string
          root_id?: string | null
          sol_address?: string | null
          status?: string
          tenant_id: string
          type?: string
          updated_at?: string
          world_id_status?: string | null
        }
        Update: {
          app_origin?: string | null
          auth_profile_id?: string | null
          avatar_uri?: string | null
          badges?: string[]
          bio?: string | null
          btc_address?: string | null
          chain_addresses?: Json
          created_at?: string
          default_identity_state?: string | null
          discoverable_within_tenant?: boolean
          display_name?: string
          evm_address?: string | null
          evm_key?: Json | null
          fio_domain?: string
          fio_handle?: string
          fio_handle_expiration?: string | null
          fio_handle_verified?: boolean | null
          fio_last_verified_at?: string | null
          fio_public_key?: string | null
          fio_registered_at?: string | null
          fio_registration?: Json | null
          fio_registration_status?: string | null
          fio_tx_id?: string | null
          first_paid_purchase_at?: string | null
          id?: string
          metadata?: Json | null
          order_tier?: Database["public"]["Enums"]["order_tier"] | null
          ref_campaign_id?: string | null
          referral_identifier?: string | null
          referral_locked_at?: string | null
          referral_method?: string | null
          referred_by_persona_id?: string | null
          referrer_persona_id?: string | null
          reputation_bucket?: number
          reputation_score?: number
          reputation_tier?:
            | Database["public"]["Enums"]["reputation_tier"]
            | null
          root_did?: string
          root_id?: string | null
          sol_address?: string | null
          status?: string
          tenant_id?: string
          type?: string
          updated_at?: string
          world_id_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personas_referrer_persona_id_fkey"
            columns: ["referrer_persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_run_events: {
        Row: {
          data: Json | null
          event_type: string
          id: string
          run_id: string
          stage: string | null
          ts: string
        }
        Insert: {
          data?: Json | null
          event_type: string
          id?: string
          run_id: string
          stage?: string | null
          ts?: string
        }
        Update: {
          data?: Json | null
          event_type?: string
          id?: string
          run_id?: string
          stage?: string | null
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_run_events_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "pipeline_runs"
            referencedColumns: ["pipeline_run_id"]
          },
        ]
      }
      pipeline_runs: {
        Row: {
          completed_at: string | null
          current_stage: string
          failure_reason: string | null
          identity_envelope: Json
          initiated_by: string
          initiated_via: string
          pipeline_run_id: string
          receipt_refs: Json
          stage_history: Json
          started_at: string
          status: string
          template_ref: string | null
          tenant_id: string
          updated_at: string
          workflow_ref: string | null
        }
        Insert: {
          completed_at?: string | null
          current_stage: string
          failure_reason?: string | null
          identity_envelope?: Json
          initiated_by: string
          initiated_via: string
          pipeline_run_id: string
          receipt_refs?: Json
          stage_history?: Json
          started_at?: string
          status?: string
          template_ref?: string | null
          tenant_id: string
          updated_at?: string
          workflow_ref?: string | null
        }
        Update: {
          completed_at?: string | null
          current_stage?: string
          failure_reason?: string | null
          identity_envelope?: Json
          initiated_by?: string
          initiated_via?: string
          pipeline_run_id?: string
          receipt_refs?: Json
          stage_history?: Json
          started_at?: string
          status?: string
          template_ref?: string | null
          tenant_id?: string
          updated_at?: string
          workflow_ref?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          asset_ids: string[] | null
          base_knyt_price: number
          created_at: string
          description: string | null
          duration_days: number | null
          entitlement_tier: Database["public"]["Enums"]["entitlement_tier"]
          entitlement_type: Database["public"]["Enums"]["entitlement_type"]
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          product_type: string
          updated_at: string
        }
        Insert: {
          asset_ids?: string[] | null
          base_knyt_price: number
          created_at?: string
          description?: string | null
          duration_days?: number | null
          entitlement_tier?: Database["public"]["Enums"]["entitlement_tier"]
          entitlement_type?: Database["public"]["Enums"]["entitlement_type"]
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          product_type: string
          updated_at?: string
        }
        Update: {
          asset_ids?: string[] | null
          base_knyt_price?: number
          created_at?: string
          description?: string | null
          duration_days?: number | null
          entitlement_tier?: Database["public"]["Enums"]["entitlement_tier"]
          entitlement_type?: Database["public"]["Enums"]["entitlement_type"]
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          product_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          persona_id: string | null
          trading_preferences: Json | null
          updated_at: string | null
          wallet_addresses: Json | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          persona_id?: string | null
          trading_preferences?: Json | null
          updated_at?: string | null
          wallet_addresses?: Json | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          persona_id?: string | null
          trading_preferences?: Json | null
          updated_at?: string | null
          wallet_addresses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "profiles_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_records: {
        Row: {
          amount: string | null
          business_model: string
          buyer_address: string
          created_at: string
          id: number
          seller_address: string
          token_id: number
          tx_hash: string | null
        }
        Insert: {
          amount?: string | null
          business_model: string
          buyer_address: string
          created_at?: string
          id?: number
          seller_address: string
          token_id: number
          tx_hash?: string | null
        }
        Update: {
          amount?: string | null
          business_model?: string
          buyer_address?: string
          created_at?: string
          id?: number
          seller_address?: string
          token_id?: number
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_records_token_fk"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "iqubes"
            referencedColumns: ["token_id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          payment_rail: string
          payment_reference: string | null
          persona_id: string
          product_id: string | null
          product_type: string
          status: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency: string
          id?: string
          metadata?: Json | null
          payment_rail: string
          payment_reference?: string | null
          persona_id: string
          product_id?: string | null
          product_type: string
          status?: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_rail?: string
          payment_reference?: string | null
          persona_id?: string
          product_id?: string | null
          product_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      qc_balances: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          persona_id: string
          source: string | null
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          persona_id: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          persona_id?: string
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qc_balances_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "qc_balances_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_balances_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_balances_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qc_balances_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
        ]
      }
      qc_events: {
        Row: {
          action_type: string
          amount_qc: number
          cartridge_id: string | null
          created_at: string
          direction: string
          event_id: string
          finalized_at: string | null
          metadata: Json
          persona_id: string
          provisional: boolean
          receipt_id: string | null
          reward_grant_id: string | null
          skill_id: string | null
        }
        Insert: {
          action_type: string
          amount_qc?: number
          cartridge_id?: string | null
          created_at?: string
          direction: string
          event_id?: string
          finalized_at?: string | null
          metadata?: Json
          persona_id: string
          provisional?: boolean
          receipt_id?: string | null
          reward_grant_id?: string | null
          skill_id?: string | null
        }
        Update: {
          action_type?: string
          amount_qc?: number
          cartridge_id?: string | null
          created_at?: string
          direction?: string
          event_id?: string
          finalized_at?: string | null
          metadata?: Json
          persona_id?: string
          provisional?: boolean
          receipt_id?: string | null
          reward_grant_id?: string | null
          skill_id?: string | null
        }
        Relationships: []
      }
      qubetalk_channels: {
        Row: {
          channel_id: string
          created_at: string | null
          participants: string[]
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          participants?: string[]
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          participants?: string[]
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      qubetalk_delegations: {
        Row: {
          channel_id: string
          context: Json | null
          created_at: string | null
          delegation_id: string
          from_agent: Json
          receipt_ref: string | null
          request_id: string
          result: Json | null
          status: string
          task: Json
          tenant_id: string
          to_agent: Json
          updated_at: string | null
        }
        Insert: {
          channel_id: string
          context?: Json | null
          created_at?: string | null
          delegation_id: string
          from_agent: Json
          receipt_ref?: string | null
          request_id: string
          result?: Json | null
          status?: string
          task: Json
          tenant_id: string
          to_agent: Json
          updated_at?: string | null
        }
        Update: {
          channel_id?: string
          context?: Json | null
          created_at?: string | null
          delegation_id?: string
          from_agent?: Json
          receipt_ref?: string | null
          request_id?: string
          result?: Json | null
          status?: string
          task?: Json
          tenant_id?: string
          to_agent?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qubetalk_delegations_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "qubetalk_channels"
            referencedColumns: ["channel_id"]
          },
        ]
      }
      qubetalk_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string | null
          from_agent: Json
          in_reply_to: string | null
          iqube_refs: string[] | null
          message_id: string
          metadata: Json | null
          receipt_ref: string | null
          type: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string | null
          from_agent: Json
          in_reply_to?: string | null
          iqube_refs?: string[] | null
          message_id: string
          metadata?: Json | null
          receipt_ref?: string | null
          type?: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string | null
          from_agent?: Json
          in_reply_to?: string | null
          iqube_refs?: string[] | null
          message_id?: string
          metadata?: Json | null
          receipt_ref?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "qubetalk_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "qubetalk_channels"
            referencedColumns: ["channel_id"]
          },
          {
            foreignKeyName: "qubetalk_messages_in_reply_to_fkey"
            columns: ["in_reply_to"]
            isOneToOne: false
            referencedRelation: "qubetalk_messages"
            referencedColumns: ["message_id"]
          },
        ]
      }
      quotes: {
        Row: {
          ask: number | null
          bid: number | null
          extra: Json | null
          id: string
          mid: number | null
          source: string | null
          symbol: string
          tenant_id: string
          ts: string
        }
        Insert: {
          ask?: number | null
          bid?: number | null
          extra?: Json | null
          id?: string
          mid?: number | null
          source?: string | null
          symbol: string
          tenant_id: string
          ts?: string
        }
        Update: {
          ask?: number | null
          bid?: number | null
          extra?: Json | null
          id?: string
          mid?: number | null
          source?: string | null
          symbol?: string
          tenant_id?: string
          ts?: string
        }
        Relationships: []
      }
      recommendation_history: {
        Row: {
          confidence_score: number | null
          created_at: string
          daily_loss_limit_bps: number | null
          id: string
          inventory_max: number | null
          inventory_min: number | null
          max_notional_usd: number | null
          min_edge_bps: number | null
          reasoning: string | null
          recommendation_id: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          daily_loss_limit_bps?: number | null
          id?: string
          inventory_max?: number | null
          inventory_min?: number | null
          max_notional_usd?: number | null
          min_edge_bps?: number | null
          reasoning?: string | null
          recommendation_id?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          daily_loss_limit_bps?: number | null
          id?: string
          inventory_max?: number | null
          inventory_min?: number | null
          max_notional_usd?: number | null
          min_edge_bps?: number | null
          reasoning?: string | null
          recommendation_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_history_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "trading_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          referee_persona_id: string
          referrer_persona_id: string
          reward_amount: number | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          referee_persona_id: string
          referrer_persona_id: string
          reward_amount?: number | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          referee_persona_id?: string
          referrer_persona_id?: string
          reward_amount?: number | null
        }
        Relationships: []
      }
      registry_asset_tags: {
        Row: {
          asset_id: string
          tag_id: string
        }
        Insert: {
          asset_id: string
          tag_id: string
        }
        Update: {
          asset_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registry_asset_tags_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "registry_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "registry_asset_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "registry_tags"
            referencedColumns: ["tag_id"]
          },
        ]
      }
      registry_asset_versions: {
        Row: {
          asset_id: string
          changelog: string | null
          content_hash: string | null
          created_at: string
          created_by: string
          deprecated_at: string | null
          deprecated_by: string | null
          interface_schema: Json
          is_current: boolean
          version: string
          version_id: string
          wrapper_config: Json
        }
        Insert: {
          asset_id: string
          changelog?: string | null
          content_hash?: string | null
          created_at?: string
          created_by: string
          deprecated_at?: string | null
          deprecated_by?: string | null
          interface_schema?: Json
          is_current?: boolean
          version: string
          version_id: string
          wrapper_config?: Json
        }
        Update: {
          asset_id?: string
          changelog?: string | null
          content_hash?: string | null
          created_at?: string
          created_by?: string
          deprecated_at?: string | null
          deprecated_by?: string | null
          interface_schema?: Json
          is_current?: boolean
          version?: string
          version_id?: string
          wrapper_config?: Json
        }
        Relationships: [
          {
            foreignKeyName: "registry_asset_versions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "registry_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      registry_assets: {
        Row: {
          asset_class: string
          asset_id: string
          capabilities: Json
          created_at: string
          created_by: string
          current_version: string
          description: string | null
          icon_url: string | null
          intake_id: string | null
          interface_schema: Json
          metadata: Json
          name: string
          policy_class: string
          publication_status: string
          slug: string
          source_id: string | null
          tags: Json
          tenant_id: string
          trust_band: string
          updated_at: string
          wrapper_strategy: string
        }
        Insert: {
          asset_class: string
          asset_id: string
          capabilities?: Json
          created_at?: string
          created_by: string
          current_version?: string
          description?: string | null
          icon_url?: string | null
          intake_id?: string | null
          interface_schema?: Json
          metadata?: Json
          name: string
          policy_class?: string
          publication_status?: string
          slug: string
          source_id?: string | null
          tags?: Json
          tenant_id: string
          trust_band?: string
          updated_at?: string
          wrapper_strategy?: string
        }
        Update: {
          asset_class?: string
          asset_id?: string
          capabilities?: Json
          created_at?: string
          created_by?: string
          current_version?: string
          description?: string | null
          icon_url?: string | null
          intake_id?: string | null
          interface_schema?: Json
          metadata?: Json
          name?: string
          policy_class?: string
          publication_status?: string
          slug?: string
          source_id?: string | null
          tags?: Json
          tenant_id?: string
          trust_band?: string
          updated_at?: string
          wrapper_strategy?: string
        }
        Relationships: [
          {
            foreignKeyName: "registry_assets_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "registry_intakes"
            referencedColumns: ["intake_id"]
          },
          {
            foreignKeyName: "registry_assets_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "registry_sources"
            referencedColumns: ["source_id"]
          },
        ]
      }
      registry_dependencies: {
        Row: {
          asset_id: string
          created_at: string
          dep_id: string
          dep_ref: string
          dep_type: string
          notes: string | null
          risk_level: string | null
          version_constraint: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string
          dep_id: string
          dep_ref: string
          dep_type: string
          notes?: string | null
          risk_level?: string | null
          version_constraint?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string
          dep_id?: string
          dep_ref?: string
          dep_type?: string
          notes?: string | null
          risk_level?: string | null
          version_constraint?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registry_dependencies_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "registry_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      registry_intakes: {
        Row: {
          asset_id: string | null
          created_at: string
          current_stage: string
          failure_reason: string | null
          intake_id: string
          source_payload: Json
          source_type: string
          source_uri: string | null
          stage_history: Json
          status: string
          submitted_by: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          current_stage?: string
          failure_reason?: string | null
          intake_id: string
          source_payload?: Json
          source_type: string
          source_uri?: string | null
          stage_history?: Json
          status?: string
          submitted_by: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          current_stage?: string
          failure_reason?: string | null
          intake_id?: string
          source_payload?: Json
          source_type?: string
          source_uri?: string | null
          stage_history?: Json
          status?: string
          submitted_by?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      registry_invocations: {
        Row: {
          asset_id: string
          completed_at: string | null
          duration_ms: number | null
          error_message: string | null
          input_hash: string | null
          invocation_id: string
          invoked_at: string
          invoked_by: string
          output_hash: string | null
          policy_class: string
          receipt_id: string | null
          status: string
          tenant_id: string
          version_id: string | null
          wrapper_strategy: string
        }
        Insert: {
          asset_id: string
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          input_hash?: string | null
          invocation_id: string
          invoked_at?: string
          invoked_by: string
          output_hash?: string | null
          policy_class: string
          receipt_id?: string | null
          status?: string
          tenant_id: string
          version_id?: string | null
          wrapper_strategy: string
        }
        Update: {
          asset_id?: string
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          input_hash?: string | null
          invocation_id?: string
          invoked_at?: string
          invoked_by?: string
          output_hash?: string | null
          policy_class?: string
          receipt_id?: string | null
          status?: string
          tenant_id?: string
          version_id?: string | null
          wrapper_strategy?: string
        }
        Relationships: [
          {
            foreignKeyName: "registry_invocations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "registry_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "registry_invocations_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "registry_asset_versions"
            referencedColumns: ["version_id"]
          },
        ]
      }
      registry_policies: {
        Row: {
          allowed_hosts: Json
          allowed_paths: Json
          approval_timeout_s: number
          asset_id: string
          created_at: string
          created_by: string
          custom_rules: Json
          max_exec_seconds: number
          max_output_bytes: number
          policy_class: string
          policy_id: string
          requires_human_approval: boolean
          secret_refs: Json
          updated_at: string
        }
        Insert: {
          allowed_hosts?: Json
          allowed_paths?: Json
          approval_timeout_s?: number
          asset_id: string
          created_at?: string
          created_by: string
          custom_rules?: Json
          max_exec_seconds?: number
          max_output_bytes?: number
          policy_class: string
          policy_id: string
          requires_human_approval?: boolean
          secret_refs?: Json
          updated_at?: string
        }
        Update: {
          allowed_hosts?: Json
          allowed_paths?: Json
          approval_timeout_s?: number
          asset_id?: string
          created_at?: string
          created_by?: string
          custom_rules?: Json
          max_exec_seconds?: number
          max_output_bytes?: number
          policy_class?: string
          policy_id?: string
          requires_human_approval?: boolean
          secret_refs?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registry_policies_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "registry_assets"
            referencedColumns: ["asset_id"]
          },
        ]
      }
      registry_publications: {
        Row: {
          asset_id: string
          created_at: string
          notes: string | null
          policy_class: string
          publication_id: string
          published_at: string | null
          published_by: string
          receipt_id: string | null
          revoke_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          score_id: string | null
          status: string
          trust_band: string
          validation_id: string | null
          version_id: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string
          notes?: string | null
          policy_class: string
          publication_id: string
          published_at?: string | null
          published_by: string
          receipt_id?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          score_id?: string | null
          status?: string
          trust_band: string
          validation_id?: string | null
          version_id?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string
          notes?: string | null
          policy_class?: string
          publication_id?: string
          published_at?: string | null
          published_by?: string
          receipt_id?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          score_id?: string | null
          status?: string
          trust_band?: string
          validation_id?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registry_publications_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "registry_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "registry_publications_score_id_fkey"
            columns: ["score_id"]
            isOneToOne: false
            referencedRelation: "registry_trust_scores"
            referencedColumns: ["score_id"]
          },
          {
            foreignKeyName: "registry_publications_validation_id_fkey"
            columns: ["validation_id"]
            isOneToOne: false
            referencedRelation: "registry_validations"
            referencedColumns: ["validation_id"]
          },
          {
            foreignKeyName: "registry_publications_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "registry_asset_versions"
            referencedColumns: ["version_id"]
          },
        ]
      }
      registry_receipts: {
        Row: {
          actor_id: string
          asset_id: string | null
          content_hash: string | null
          created_at: string
          dispute_status: string
          dvn_message_id: string | null
          dvn_submitted_at: string | null
          event_type: string
          finalized_at: string | null
          intake_id: string | null
          invocation_id: string | null
          lineage: Json | null
          payload: Json
          policy_snapshot: Json | null
          provisional: boolean
          receipt_id: string
          tenant_id: string
        }
        Insert: {
          actor_id: string
          asset_id?: string | null
          content_hash?: string | null
          created_at?: string
          dispute_status?: string
          dvn_message_id?: string | null
          dvn_submitted_at?: string | null
          event_type: string
          finalized_at?: string | null
          intake_id?: string | null
          invocation_id?: string | null
          lineage?: Json | null
          payload?: Json
          policy_snapshot?: Json | null
          provisional?: boolean
          receipt_id: string
          tenant_id: string
        }
        Update: {
          actor_id?: string
          asset_id?: string | null
          content_hash?: string | null
          created_at?: string
          dispute_status?: string
          dvn_message_id?: string | null
          dvn_submitted_at?: string | null
          event_type?: string
          finalized_at?: string | null
          intake_id?: string | null
          invocation_id?: string | null
          lineage?: Json | null
          payload?: Json
          policy_snapshot?: Json | null
          provisional?: boolean
          receipt_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registry_receipts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "registry_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "registry_receipts_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "registry_intakes"
            referencedColumns: ["intake_id"]
          },
          {
            foreignKeyName: "registry_receipts_invocation_id_fkey"
            columns: ["invocation_id"]
            isOneToOne: false
            referencedRelation: "registry_invocations"
            referencedColumns: ["invocation_id"]
          },
        ]
      }
      registry_reviews: {
        Row: {
          asset_id: string
          created_at: string
          decided_at: string | null
          decision: string | null
          evidence_refs: Json
          notes: string | null
          requested_trust_band: string | null
          review_id: string
          reviewer_id: string
          reviewer_type: string
          validation_id: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string
          decided_at?: string | null
          decision?: string | null
          evidence_refs?: Json
          notes?: string | null
          requested_trust_band?: string | null
          review_id: string
          reviewer_id: string
          reviewer_type?: string
          validation_id?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string
          decided_at?: string | null
          decision?: string | null
          evidence_refs?: Json
          notes?: string | null
          requested_trust_band?: string | null
          review_id?: string
          reviewer_id?: string
          reviewer_type?: string
          validation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registry_reviews_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "registry_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "registry_reviews_validation_id_fkey"
            columns: ["validation_id"]
            isOneToOne: false
            referencedRelation: "registry_validations"
            referencedColumns: ["validation_id"]
          },
        ]
      }
      registry_sources: {
        Row: {
          content_hash: string | null
          content_size: number | null
          created_at: string
          fetch_status: string
          fetched_at: string | null
          intake_id: string
          manifest: Json
          raw_refs: Json
          source_id: string
          source_type: string
          uri: string | null
        }
        Insert: {
          content_hash?: string | null
          content_size?: number | null
          created_at?: string
          fetch_status?: string
          fetched_at?: string | null
          intake_id: string
          manifest?: Json
          raw_refs?: Json
          source_id: string
          source_type: string
          uri?: string | null
        }
        Update: {
          content_hash?: string | null
          content_size?: number | null
          created_at?: string
          fetch_status?: string
          fetched_at?: string | null
          intake_id?: string
          manifest?: Json
          raw_refs?: Json
          source_id?: string
          source_type?: string
          uri?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registry_sources_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "registry_intakes"
            referencedColumns: ["intake_id"]
          },
        ]
      }
      registry_tags: {
        Row: {
          category: string | null
          created_at: string
          name: string
          tag_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          name: string
          tag_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          name?: string
          tag_id?: string
        }
        Relationships: []
      }
      registry_trust_scores: {
        Row: {
          asset_id: string
          computed_by: string
          created_at: string
          explanation: string | null
          factors: Json
          numeric_score: number
          score_id: string
          trust_band: string
          validation_id: string | null
        }
        Insert: {
          asset_id: string
          computed_by?: string
          created_at?: string
          explanation?: string | null
          factors?: Json
          numeric_score: number
          score_id: string
          trust_band: string
          validation_id?: string | null
        }
        Update: {
          asset_id?: string
          computed_by?: string
          created_at?: string
          explanation?: string | null
          factors?: Json
          numeric_score?: number
          score_id?: string
          trust_band?: string
          validation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registry_trust_scores_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "registry_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "registry_trust_scores_validation_id_fkey"
            columns: ["validation_id"]
            isOneToOne: false
            referencedRelation: "registry_validations"
            referencedColumns: ["validation_id"]
          },
        ]
      }
      registry_validation_artifacts: {
        Row: {
          artifact_id: string
          artifact_type: string
          cap_trust_band: string | null
          content: Json
          content_hash: string | null
          created_at: string
          passed: boolean | null
          stage: string
          validation_id: string
        }
        Insert: {
          artifact_id: string
          artifact_type: string
          cap_trust_band?: string | null
          content?: Json
          content_hash?: string | null
          created_at?: string
          passed?: boolean | null
          stage: string
          validation_id: string
        }
        Update: {
          artifact_id?: string
          artifact_type?: string
          cap_trust_band?: string | null
          content?: Json
          content_hash?: string | null
          created_at?: string
          passed?: boolean | null
          stage?: string
          validation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registry_validation_artifacts_validation_id_fkey"
            columns: ["validation_id"]
            isOneToOne: false
            referencedRelation: "registry_validations"
            referencedColumns: ["validation_id"]
          },
        ]
      }
      registry_validations: {
        Row: {
          asset_id: string
          completed_at: string | null
          created_at: string
          overall_result: string | null
          stages_completed: Json
          started_at: string
          status: string
          summary: string | null
          triggered_by: string
          trust_band_cap: string | null
          validation_id: string
          version_id: string | null
        }
        Insert: {
          asset_id: string
          completed_at?: string | null
          created_at?: string
          overall_result?: string | null
          stages_completed?: Json
          started_at?: string
          status?: string
          summary?: string | null
          triggered_by: string
          trust_band_cap?: string | null
          validation_id: string
          version_id?: string | null
        }
        Update: {
          asset_id?: string
          completed_at?: string | null
          created_at?: string
          overall_result?: string | null
          stages_completed?: Json
          started_at?: string
          status?: string
          summary?: string | null
          triggered_by?: string
          trust_band_cap?: string | null
          validation_id?: string
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registry_validations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "registry_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "registry_validations_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "registry_asset_versions"
            referencedColumns: ["version_id"]
          },
        ]
      }
      relationship_qubes: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          direction: string
          id: string
          metadata: Json
          relationship_data: Json
          relationship_type: Database["public"]["Enums"]["relationship_type"]
          source_id: string
          source_type: Database["public"]["Enums"]["relationship_entity_type"]
          status: string
          target_id: string
          target_type: Database["public"]["Enums"]["relationship_entity_type"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          direction?: string
          id?: string
          metadata?: Json
          relationship_data: Json
          relationship_type: Database["public"]["Enums"]["relationship_type"]
          source_id: string
          source_type: Database["public"]["Enums"]["relationship_entity_type"]
          status?: string
          target_id: string
          target_type: Database["public"]["Enums"]["relationship_entity_type"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          direction?: string
          id?: string
          metadata?: Json
          relationship_data?: Json
          relationship_type?: Database["public"]["Enums"]["relationship_type"]
          source_id?: string
          source_type?: Database["public"]["Enums"]["relationship_entity_type"]
          status?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["relationship_entity_type"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reputation_bucket: {
        Row: {
          bucket_level: number | null
          created_at: string | null
          evidence_count: number | null
          id: string
          last_synced_at: string | null
          partition_id: string
          persona_id: string | null
          rqh_bucket_id: string | null
          score: number | null
          skill_category: string
          updated_at: string | null
        }
        Insert: {
          bucket_level?: number | null
          created_at?: string | null
          evidence_count?: number | null
          id?: string
          last_synced_at?: string | null
          partition_id: string
          persona_id?: string | null
          rqh_bucket_id?: string | null
          score?: number | null
          skill_category: string
          updated_at?: string | null
        }
        Update: {
          bucket_level?: number | null
          created_at?: string | null
          evidence_count?: number | null
          id?: string
          last_synced_at?: string | null
          partition_id?: string
          persona_id?: string | null
          rqh_bucket_id?: string | null
          score?: number | null
          skill_category?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reputation_bucket_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "reputation_bucket_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reputation_bucket_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reputation_bucket_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reputation_bucket_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
        ]
      }
      reputation_events: {
        Row: {
          created_at: string
          event_source: string | null
          event_type: string
          id: string
          metadata: Json | null
          persona_id: string
          points_delta: number | null
        }
        Insert: {
          created_at?: string
          event_source?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          persona_id: string
          points_delta?: number | null
        }
        Update: {
          created_at?: string
          event_source?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          persona_id?: string
          points_delta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reputation_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "reputation_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reputation_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reputation_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reputation_events_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
        ]
      }
      reputation_evidence: {
        Row: {
          created_at: string | null
          evidence_data: Json | null
          evidence_type: string
          id: string
          reputation_bucket_id: string | null
          rqh_evidence_id: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          evidence_data?: Json | null
          evidence_type: string
          id?: string
          reputation_bucket_id?: string | null
          rqh_evidence_id?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          evidence_data?: Json | null
          evidence_type?: string
          id?: string
          reputation_bucket_id?: string | null
          rqh_evidence_id?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reputation_evidence_reputation_bucket_id_fkey"
            columns: ["reputation_bucket_id"]
            isOneToOne: false
            referencedRelation: "reputation_bucket"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_grants: {
        Row: {
          amount_knyt: number
          base_amount_knyt: number
          created_at: string
          id: string
          metadata: Json | null
          persona_id: string
          rep_multiplier: number
          source_event_id: string | null
          task_type: Database["public"]["Enums"]["reward_task_type"]
        }
        Insert: {
          amount_knyt: number
          base_amount_knyt: number
          created_at?: string
          id?: string
          metadata?: Json | null
          persona_id: string
          rep_multiplier?: number
          source_event_id?: string | null
          task_type: Database["public"]["Enums"]["reward_task_type"]
        }
        Update: {
          amount_knyt?: number
          base_amount_knyt?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          persona_id?: string
          rep_multiplier?: number
          source_event_id?: string | null
          task_type?: Database["public"]["Enums"]["reward_task_type"]
        }
        Relationships: [
          {
            foreignKeyName: "reward_grants_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "reward_grants_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_grants_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_grants_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_grants_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_ledger: {
        Row: {
          amount: number
          created_at: string | null
          dvn_transaction_id: string | null
          id: string
          metadata: Json | null
          persona_id: string
          reward_type: string
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          dvn_transaction_id?: string | null
          id?: string
          metadata?: Json | null
          persona_id: string
          reward_type: string
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          dvn_transaction_id?: string | null
          id?: string
          metadata?: Json | null
          persona_id?: string
          reward_type?: string
          status?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      root_identity: {
        Row: {
          created_at: string | null
          did_uri: string
          id: string
          kybe_hash: string | null
          kybe_id: string | null
          kyc_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          did_uri: string
          id?: string
          kybe_hash?: string | null
          kybe_id?: string | null
          kyc_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          did_uri?: string
          id?: string
          kybe_hash?: string | null
          kybe_id?: string | null
          kyc_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "root_identity_kybe_id_fkey"
            columns: ["kybe_id"]
            isOneToOne: false
            referencedRelation: "kybe_identity"
            referencedColumns: ["id"]
          },
        ]
      }
      root_prompts: {
        Row: {
          applicable_to: string[] | null
          created_at: string | null
          id: string
          is_active: boolean | null
          prompt_content: string
          prompt_name: string
          updated_at: string | null
          version: string
        }
        Insert: {
          applicable_to?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          prompt_content: string
          prompt_name: string
          updated_at?: string | null
          version: string
        }
        Update: {
          applicable_to?: string[] | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          prompt_content?: string
          prompt_name?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      share_analytics: {
        Row: {
          article_id: string
          created_at: string | null
          deep_link: string
          id: string
          ip_address: string | null
          persona_id: string | null
          platform: string
          referrer: string | null
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          article_id: string
          created_at?: string | null
          deep_link: string
          id?: string
          ip_address?: string | null
          persona_id?: string | null
          platform: string
          referrer?: string | null
          timestamp: string
          user_agent?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string | null
          deep_link?: string
          id?: string
          ip_address?: string | null
          persona_id?: string | null
          platform?: string
          referrer?: string | null
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "share_analytics_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_analytics_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "share_analytics_summary"
            referencedColumns: ["article_id"]
          },
        ]
      }
      share_clicks: {
        Row: {
          created_at: string
          id: string
          ip_hash: string | null
          referrer: string | null
          share_link_id: string
          user_agent: string | null
          visitor_fingerprint: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          share_link_id: string
          user_agent?: string | null
          visitor_fingerprint?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          share_link_id?: string
          user_agent?: string | null
          visitor_fingerprint?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "share_clicks_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      share_links: {
        Row: {
          campaign: string | null
          created_at: string
          id: string
          metadata: Json | null
          persona_id: string
          share_id: string
          target_url: string
        }
        Insert: {
          campaign?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          persona_id: string
          share_id: string
          target_url: string
        }
        Update: {
          campaign?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          persona_id?: string
          share_id?: string
          target_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_links_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "share_links_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_links_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_links_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_links_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
        ]
      }
      share_signups: {
        Row: {
          converted_to_paying: boolean | null
          created_at: string
          id: string
          new_persona_id: string | null
          share_link_id: string
        }
        Insert: {
          converted_to_paying?: boolean | null
          created_at?: string
          id?: string
          new_persona_id?: string | null
          share_link_id: string
        }
        Update: {
          converted_to_paying?: boolean | null
          created_at?: string
          id?: string
          new_persona_id?: string | null
          share_link_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_signups_new_persona_id_fkey"
            columns: ["new_persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "share_signups_new_persona_id_fkey"
            columns: ["new_persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_signups_new_persona_id_fkey"
            columns: ["new_persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_signups_new_persona_id_fkey"
            columns: ["new_persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_signups_new_persona_id_fkey"
            columns: ["new_persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_signups_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          created_at: string
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_content_qubes: {
        Row: {
          access_policy: Json
          app: Database["public"]["Enums"]["smart_content_app"]
          content_qube_id: string | null
          cover_image_uri: string | null
          created_at: string
          creator_root_did: string
          deleted_at: string | null
          description: string | null
          id: string
          identity_requirements: Json
          layout_hints: Json
          library_metadata: Json
          menu_integration: Json
          meta_qube_cid: string | null
          modalities: Json
          pricing_model: Json
          published_at: string | null
          reputation_requirements: Json
          reward_outcomes: Json
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          structure_data: Json | null
          structure_kind:
            | Database["public"]["Enums"]["content_structure_kind"]
            | null
          tenant_id: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          access_policy?: Json
          app: Database["public"]["Enums"]["smart_content_app"]
          content_qube_id?: string | null
          cover_image_uri?: string | null
          created_at?: string
          creator_root_did: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          identity_requirements?: Json
          layout_hints?: Json
          library_metadata?: Json
          menu_integration?: Json
          meta_qube_cid?: string | null
          modalities?: Json
          pricing_model?: Json
          published_at?: string | null
          reputation_requirements?: Json
          reward_outcomes?: Json
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          structure_data?: Json | null
          structure_kind?:
            | Database["public"]["Enums"]["content_structure_kind"]
            | null
          tenant_id: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          access_policy?: Json
          app?: Database["public"]["Enums"]["smart_content_app"]
          content_qube_id?: string | null
          cover_image_uri?: string | null
          created_at?: string
          creator_root_did?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          identity_requirements?: Json
          layout_hints?: Json
          library_metadata?: Json
          menu_integration?: Json
          meta_qube_cid?: string | null
          modalities?: Json
          pricing_model?: Json
          published_at?: string | null
          reputation_requirements?: Json
          reward_outcomes?: Json
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          structure_data?: Json | null
          structure_kind?:
            | Database["public"]["Enums"]["content_structure_kind"]
            | null
          tenant_id?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      social_share_analytics: {
        Row: {
          clicks: number | null
          content_id: string
          conversions: number | null
          created_at: string | null
          id: string
          last_activity_at: string | null
          persona_id: string | null
          platform: string
          reward_earned: number | null
          share_url: string | null
          signups: number | null
        }
        Insert: {
          clicks?: number | null
          content_id: string
          conversions?: number | null
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          persona_id?: string | null
          platform: string
          reward_earned?: number | null
          share_url?: string | null
          signups?: number | null
        }
        Update: {
          clicks?: number | null
          content_id?: string
          conversions?: number | null
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          persona_id?: string | null
          platform?: string
          reward_earned?: number | null
          share_url?: string | null
          signups?: number | null
        }
        Relationships: []
      }
      studio_artifacts: {
        Row: {
          applied_at: string | null
          codex_entry_ids: string[] | null
          created_at: string | null
          created_by: string
          dvn_receipt_ids: string[] | null
          id: string
          job_id: string
          journey_segments_affected: string[] | null
          package_dependencies: string[] | null
          parent_artifact_id: string | null
          rollback_artifact_id: string | null
          rollback_available: boolean | null
          source_surface: string
          status: string
          target_surfaces: string[] | null
          ui_surfaces_affected: string[] | null
          updated_at: string | null
          validation_errors: string[] | null
          validation_status: string | null
        }
        Insert: {
          applied_at?: string | null
          codex_entry_ids?: string[] | null
          created_at?: string | null
          created_by: string
          dvn_receipt_ids?: string[] | null
          id?: string
          job_id: string
          journey_segments_affected?: string[] | null
          package_dependencies?: string[] | null
          parent_artifact_id?: string | null
          rollback_artifact_id?: string | null
          rollback_available?: boolean | null
          source_surface: string
          status?: string
          target_surfaces?: string[] | null
          ui_surfaces_affected?: string[] | null
          updated_at?: string | null
          validation_errors?: string[] | null
          validation_status?: string | null
        }
        Update: {
          applied_at?: string | null
          codex_entry_ids?: string[] | null
          created_at?: string | null
          created_by?: string
          dvn_receipt_ids?: string[] | null
          id?: string
          job_id?: string
          journey_segments_affected?: string[] | null
          package_dependencies?: string[] | null
          parent_artifact_id?: string | null
          rollback_artifact_id?: string | null
          rollback_available?: boolean | null
          source_surface?: string
          status?: string
          target_surfaces?: string[] | null
          ui_surfaces_affected?: string[] | null
          updated_at?: string | null
          validation_errors?: string[] | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "studio_artifacts_parent_artifact_id_fkey"
            columns: ["parent_artifact_id"]
            isOneToOne: false
            referencedRelation: "studio_artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_artifacts_rollback_artifact_id_fkey"
            columns: ["rollback_artifact_id"]
            isOneToOne: false
            referencedRelation: "studio_artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          created_at: string | null
          entries_synced: number | null
          error_message: string | null
          id: string
          status: string
          sync_type: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          entries_synced?: number | null
          error_message?: string | null
          id?: string
          status: string
          sync_type: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          entries_synced?: number | null
          error_message?: string | null
          id?: string
          status?: string
          sync_type?: string
          tenant_id?: string
        }
        Relationships: []
      }
      tenant_admins: {
        Row: {
          created_at: string
          id: string
          persona_id: string
          role: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          persona_id: string
          role: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          persona_id?: string
          role?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_admins_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "tenant_admins_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_admins_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_admins_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_admins_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_admins_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: number
          is_active: boolean
          label: string | null
          tenant_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: number
          is_active?: boolean
          label?: string | null
          tenant_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: number
          is_active?: boolean
          label?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          active: boolean
          agent_name: string | null
          chains: string[] | null
          created_at: string
          display_name: string | null
          franchise_id: string | null
          id: string
          kb_endpoint: string | null
          metadata: Json | null
          name: string
          parent_project: string | null
          slug: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          agent_name?: string | null
          chains?: string[] | null
          created_at?: string
          display_name?: string | null
          franchise_id?: string | null
          id?: string
          kb_endpoint?: string | null
          metadata?: Json | null
          name: string
          parent_project?: string | null
          slug?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          agent_name?: string | null
          chains?: string[] | null
          created_at?: string
          display_name?: string | null
          franchise_id?: string | null
          id?: string
          kb_endpoint?: string | null
          metadata?: Json | null
          name?: string
          parent_project?: string | null
          slug?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trading_intents: {
        Row: {
          amount_qc: number
          avg_price: number | null
          cancelled_at: string | null
          capture_bps: number | null
          chain: string
          created_at: string
          filled_at: string | null
          id: string
          intent_id: string
          limit_price: number | null
          max_slippage_bps: number
          metadata: Json | null
          min_edge_bps: number
          order_type: string
          qty_filled: number | null
          side: string
          status: string
          stop_loss: number | null
          take_profit: number | null
          time_in_force: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_qc: number
          avg_price?: number | null
          cancelled_at?: string | null
          capture_bps?: number | null
          chain: string
          created_at?: string
          filled_at?: string | null
          id?: string
          intent_id?: string
          limit_price?: number | null
          max_slippage_bps: number
          metadata?: Json | null
          min_edge_bps: number
          order_type?: string
          qty_filled?: number | null
          side: string
          status?: string
          stop_loss?: number | null
          take_profit?: number | null
          time_in_force?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_qc?: number
          avg_price?: number | null
          cancelled_at?: string | null
          capture_bps?: number | null
          chain?: string
          created_at?: string
          filled_at?: string | null
          id?: string
          intent_id?: string
          limit_price?: number | null
          max_slippage_bps?: number
          metadata?: Json | null
          min_edge_bps?: number
          order_type?: string
          qty_filled?: number | null
          side?: string
          status?: string
          stop_loss?: number | null
          take_profit?: number | null
          time_in_force?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trading_recommendations: {
        Row: {
          created_at: string
          daily_loss_limit_bps: number | null
          id: string
          inventory_max: number | null
          inventory_min: number | null
          max_notional_usd: number | null
          min_edge_bps: number | null
          reasoning: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_loss_limit_bps?: number | null
          id?: string
          inventory_max?: number | null
          inventory_min?: number | null
          max_notional_usd?: number | null
          min_edge_bps?: number | null
          reasoning?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_loss_limit_bps?: number | null
          id?: string
          inventory_max?: number | null
          inventory_min?: number | null
          max_notional_usd?: number | null
          min_edge_bps?: number | null
          reasoning?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_did_mapping: {
        Row: {
          created_at: string | null
          did: string
          id: string
          persona_id: string | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          did: string
          id?: string
          persona_id?: string | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          did?: string
          id?: string
          persona_id?: string | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_did_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "user_did_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_did_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_did_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_did_mapping_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
        ]
      }
      user_entitlements: {
        Row: {
          asset_id: string
          canonical_bundle_id: string | null
          created_at: string
          entitlement_type: Database["public"]["Enums"]["entitlement_type"]
          expires_at: string | null
          id: string
          metadata: Json | null
          onchain_token_ref: string | null
          persona_id: string
          source_purchase_id: string | null
          starts_at: string
          tier: Database["public"]["Enums"]["entitlement_tier"]
          updated_at: string
        }
        Insert: {
          asset_id: string
          canonical_bundle_id?: string | null
          created_at?: string
          entitlement_type?: Database["public"]["Enums"]["entitlement_type"]
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          onchain_token_ref?: string | null
          persona_id: string
          source_purchase_id?: string | null
          starts_at?: string
          tier?: Database["public"]["Enums"]["entitlement_tier"]
          updated_at?: string
        }
        Update: {
          asset_id?: string
          canonical_bundle_id?: string | null
          created_at?: string
          entitlement_type?: Database["public"]["Enums"]["entitlement_type"]
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          onchain_token_ref?: string | null
          persona_id?: string
          source_purchase_id?: string | null
          starts_at?: string
          tier?: Database["public"]["Enums"]["entitlement_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_entitlements_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "user_entitlements_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_entitlements_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_entitlements_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_entitlements_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
        ]
      }
      user_iqubes: {
        Row: {
          allowed_tenant_ids: string[]
          auth_profile_id: string
          created_at: string
          default_persona_by_tenant: Json
          email_verified: boolean
          emails: string[]
          id: string
          persona_grants: Json
          status: string
          updated_at: string
        }
        Insert: {
          allowed_tenant_ids?: string[]
          auth_profile_id: string
          created_at?: string
          default_persona_by_tenant?: Json
          email_verified?: boolean
          emails?: string[]
          id?: string
          persona_grants?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          allowed_tenant_ids?: string[]
          auth_profile_id?: string
          created_at?: string
          default_persona_by_tenant?: Json
          email_verified?: boolean
          emails?: string[]
          id?: string
          persona_grants?: Json
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_issue_qubes: {
        Row: {
          canonical_bundle_id: string | null
          cover_variant_id: string | null
          custody_mode: Database["public"]["Enums"]["custody_mode_type"] | null
          edition_serial: number
          edition_total: number | null
          episode_number: number
          id: string
          master_content_id: string | null
          minted_at: string | null
          owner_id: string
          owner_type: string | null
          price_paid_knyt: number | null
          price_paid_qct: number | null
          status: string | null
          transaction_hash: string | null
          updated_at: string | null
        }
        Insert: {
          canonical_bundle_id?: string | null
          cover_variant_id?: string | null
          custody_mode?: Database["public"]["Enums"]["custody_mode_type"] | null
          edition_serial: number
          edition_total?: number | null
          episode_number: number
          id?: string
          master_content_id?: string | null
          minted_at?: string | null
          owner_id: string
          owner_type?: string | null
          price_paid_knyt?: number | null
          price_paid_qct?: number | null
          status?: string | null
          transaction_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          canonical_bundle_id?: string | null
          cover_variant_id?: string | null
          custody_mode?: Database["public"]["Enums"]["custody_mode_type"] | null
          edition_serial?: number
          edition_total?: number | null
          episode_number?: number
          id?: string
          master_content_id?: string | null
          minted_at?: string | null
          owner_id?: string
          owner_type?: string | null
          price_paid_knyt?: number | null
          price_paid_qct?: number | null
          status?: string | null
          transaction_hash?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_canonical_bundle"
            columns: ["canonical_bundle_id"]
            isOneToOne: false
            referencedRelation: "canonical_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_issue_qubes_cover_variant_id_fkey"
            columns: ["cover_variant_id"]
            isOneToOne: false
            referencedRelation: "codex_media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_issue_qubes_master_content_id_fkey"
            columns: ["master_content_id"]
            isOneToOne: false
            referencedRelation: "master_content_qubes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_library: {
        Row: {
          added_at: string
          id: string
          template_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          template_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_library_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "iqube_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_shelves: {
        Row: {
          cover_image_uri: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          persona_id: string
          position: number
          updated_at: string
        }
        Insert: {
          cover_image_uri?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          persona_id: string
          position?: number
          updated_at?: string
        }
        Update: {
          cover_image_uri?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          persona_id?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      venture_lab_scorecard: {
        Row: {
          council_status: string | null
          created_at: string | null
          id: string
          owner: string
          payload: Json
          posture: string
          priority: string
          record_id: string
          review_date: string
          review_period: string
          status_color: string
          updated_at: string | null
          venture_name: string
          vertical: string
          x_score: string
          y_score: string
        }
        Insert: {
          council_status?: string | null
          created_at?: string | null
          id?: string
          owner: string
          payload: Json
          posture: string
          priority: string
          record_id: string
          review_date: string
          review_period: string
          status_color: string
          updated_at?: string | null
          venture_name: string
          vertical: string
          x_score: string
          y_score: string
        }
        Update: {
          council_status?: string | null
          created_at?: string | null
          id?: string
          owner?: string
          payload?: Json
          posture?: string
          priority?: string
          record_id?: string
          review_date?: string
          review_period?: string
          status_color?: string
          updated_at?: string | null
          venture_name?: string
          vertical?: string
          x_score?: string
          y_score?: string
        }
        Relationships: []
      }
      wallet_balances: {
        Row: {
          asset_code: string
          balance: number
          created_at: string
          id: string
          persona_id: string
          updated_at: string
        }
        Insert: {
          asset_code?: string
          balance?: number
          created_at?: string
          id?: string
          persona_id: string
          updated_at?: string
        }
        Update: {
          asset_code?: string
          balance?: number
          created_at?: string
          id?: string
          persona_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      wallet_notifications: {
        Row: {
          amount: number | null
          asset: string | null
          created_at: string | null
          from_fio: string | null
          from_id: string | null
          id: string
          message: string
          payment_request_id: string | null
          read: boolean | null
          read_at: string | null
          recipient_id: string
          title: string
          to_fio: string | null
          to_id: string | null
          tx_hash: string | null
          type: string
        }
        Insert: {
          amount?: number | null
          asset?: string | null
          created_at?: string | null
          from_fio?: string | null
          from_id?: string | null
          id?: string
          message: string
          payment_request_id?: string | null
          read?: boolean | null
          read_at?: string | null
          recipient_id: string
          title: string
          to_fio?: string | null
          to_id?: string | null
          tx_hash?: string | null
          type: string
        }
        Update: {
          amount?: number | null
          asset?: string | null
          created_at?: string | null
          from_fio?: string | null
          from_id?: string | null
          id?: string
          message?: string
          payment_request_id?: string | null
          read?: boolean | null
          read_at?: string | null
          recipient_id?: string
          title?: string
          to_fio?: string | null
          to_id?: string | null
          tx_hash?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_notifications_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "payment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          asset_code: string
          created_at: string
          direction: string
          dvn_batch_id: string | null
          dvn_submitted_at: string | null
          fiat_amount: number | null
          fiat_currency: string | null
          id: string
          metadata: Json | null
          paypal_tx_id: string | null
          persona_id: string
          source: string
        }
        Insert: {
          amount: number
          asset_code?: string
          created_at?: string
          direction: string
          dvn_batch_id?: string | null
          dvn_submitted_at?: string | null
          fiat_amount?: number | null
          fiat_currency?: string | null
          id: string
          metadata?: Json | null
          paypal_tx_id?: string | null
          persona_id: string
          source: string
        }
        Update: {
          amount?: number
          asset_code?: string
          created_at?: string
          direction?: string
          dvn_batch_id?: string | null
          dvn_submitted_at?: string | null
          fiat_amount?: number | null
          fiat_currency?: string | null
          id?: string
          metadata?: Json | null
          paypal_tx_id?: string | null
          persona_id?: string
          source?: string
        }
        Relationships: []
      }
      weekly_engagement_streaks: {
        Row: {
          created_at: string
          episodes_completed: number | null
          id: string
          persona_id: string
          reward_granted: boolean | null
          streak_qualified: boolean | null
          updated_at: string
          week_start: string
        }
        Insert: {
          created_at?: string
          episodes_completed?: number | null
          id?: string
          persona_id: string
          reward_granted?: boolean | null
          streak_qualified?: boolean | null
          updated_at?: string
          week_start: string
        }
        Update: {
          created_at?: string
          episodes_completed?: number | null
          id?: string
          persona_id?: string
          reward_granted?: boolean | null
          streak_qualified?: boolean | null
          updated_at?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_engagement_streaks_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "weekly_engagement_streaks_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_engagement_streaks_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_engagement_streaks_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_engagement_streaks_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_bindings: {
        Row: {
          created_at: string
          id: string
          persona_id: string
          role: string
          tenant_id: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          persona_id: string
          role?: string
          tenant_id: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          id?: string
          persona_id?: string
          role?: string
          tenant_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_bindings_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_channel_qubes: {
        Row: {
          active: boolean
          channel_name: string
          created_at: string
          created_by: string
          id: string
          participating_agents: string[]
          policy_ref: string | null
          tenant_id: string
          thread: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          active?: boolean
          channel_name: string
          created_at?: string
          created_by: string
          id?: string
          participating_agents?: string[]
          policy_ref?: string | null
          tenant_id: string
          thread?: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          active?: boolean
          channel_name?: string
          created_at?: string
          created_by?: string
          id?: string
          participating_agents?: string[]
          policy_ref?: string | null
          tenant_id?: string
          thread?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_channel_qubes_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: true
            referencedRelation: "workflow_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_definitions: {
        Row: {
          adapter: string
          config: Json
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          adapter: string
          config?: Json
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          adapter?: string
          config?: Json
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      workflow_engine_bindings: {
        Row: {
          backend_ids: Json
          compiled_artifact_ref: string | null
          created_at: string
          created_by: string
          credential_policy: Json
          deployment_mode: string
          engine: string
          health_state: string
          id: string
          last_health_checked_at: string | null
          last_validated_at: string | null
          tenant_id: string
          updated_at: string
          validation_status: string
          workflow_id: string
        }
        Insert: {
          backend_ids?: Json
          compiled_artifact_ref?: string | null
          created_at?: string
          created_by: string
          credential_policy?: Json
          deployment_mode?: string
          engine: string
          health_state?: string
          id?: string
          last_health_checked_at?: string | null
          last_validated_at?: string | null
          tenant_id: string
          updated_at?: string
          validation_status?: string
          workflow_id: string
        }
        Update: {
          backend_ids?: Json
          compiled_artifact_ref?: string | null
          created_at?: string
          created_by?: string
          credential_policy?: Json
          deployment_mode?: string
          engine?: string
          health_state?: string
          id?: string
          last_health_checked_at?: string | null
          last_validated_at?: string | null
          tenant_id?: string
          updated_at?: string
          validation_status?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_engine_bindings_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_input_manifests: {
        Row: {
          created_at: string
          created_by: string
          fields: Json
          id: string
          is_active: boolean
          tenant_id: string
          updated_at: string
          version: number
          workflow_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          fields?: Json
          id?: string
          is_active?: boolean
          tenant_id: string
          updated_at?: string
          version?: number
          workflow_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          fields?: Json
          id?: string
          is_active?: boolean
          tenant_id?: string
          updated_at?: string
          version?: number
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_input_manifests_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_output_manifests: {
        Row: {
          created_at: string
          created_by: string
          fields: Json
          id: string
          is_active: boolean
          success_criteria: Json
          tenant_id: string
          updated_at: string
          version: number
          workflow_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          fields?: Json
          id?: string
          is_active?: boolean
          success_criteria?: Json
          tenant_id: string
          updated_at?: string
          version?: number
          workflow_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          fields?: Json
          id?: string
          is_active?: boolean
          success_criteria?: Json
          tenant_id?: string
          updated_at?: string
          version?: number
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_output_manifests_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_run_events: {
        Row: {
          data: Json | null
          event_type: string
          id: string
          run_id: string
          step_name: string | null
          ts: string
        }
        Insert: {
          data?: Json | null
          event_type: string
          id?: string
          run_id: string
          step_name?: string | null
          ts?: string
        }
        Update: {
          data?: Json | null
          event_type?: string
          id?: string
          run_id?: string
          step_name?: string | null
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_run_events_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          error: string | null
          execution_id: string | null
          id: string
          input: Json | null
          output: Json | null
          started_at: string | null
          status: string
          tenant_id: string
          triggered_by: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          execution_id?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          started_at?: string | null
          status?: string
          tenant_id: string
          triggered_by: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          execution_id?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          started_at?: string | null
          status?: string
          tenant_id?: string
          triggered_by?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      x402_messages: {
        Row: {
          bridge_message_id: string | null
          created_at: string
          headers: Json
          id: string
          identity_proofs: Json | null
          intent: string
          payload: Json
          proofs: Json | null
          resolved_recipient_did: string | null
          resolved_sender_did: string | null
          state: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bridge_message_id?: string | null
          created_at?: string
          headers: Json
          id?: string
          identity_proofs?: Json | null
          intent: string
          payload: Json
          proofs?: Json | null
          resolved_recipient_did?: string | null
          resolved_sender_did?: string | null
          state?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bridge_message_id?: string | null
          created_at?: string
          headers?: Json
          id?: string
          identity_proofs?: Json | null
          intent?: string
          payload?: Json
          proofs?: Json | null
          resolved_recipient_did?: string | null
          resolved_sender_did?: string | null
          state?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      x402_settlements: {
        Row: {
          amount: string
          asset: string
          created_at: string
          escrow_tx: string | null
          id: string
          message_id: string | null
          release_tx: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          amount: string
          asset: string
          created_at?: string
          escrow_tx?: string | null
          id?: string
          message_id?: string | null
          release_tx?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          amount?: string
          asset?: string
          created_at?: string
          escrow_tx?: string | null
          id?: string
          message_id?: string | null
          release_tx?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "x402_settlements_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "x402_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      x402_transactions: {
        Row: {
          amount: number
          asset_id: string
          asset_symbol: string
          buyer_did: string
          created_at: string | null
          dest_chain: string | null
          facilitator_ref: string | null
          id: string
          request_id: string
          seller_did: string
          src_chain: string | null
          status: string | null
          tenant_id: string
        }
        Insert: {
          amount: number
          asset_id: string
          asset_symbol: string
          buyer_did: string
          created_at?: string | null
          dest_chain?: string | null
          facilitator_ref?: string | null
          id?: string
          request_id: string
          seller_did: string
          src_chain?: string | null
          status?: string | null
          tenant_id: string
        }
        Update: {
          amount?: number
          asset_id?: string
          asset_symbol?: string
          buyer_did?: string
          created_at?: string | null
          dest_chain?: string | null
          facilitator_ref?: string | null
          id?: string
          request_id?: string
          seller_did?: string
          src_chain?: string | null
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "x402_transactions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "content_assets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      codex_kb_document_stats: {
        Row: {
          content_category: string | null
          document_count: number | null
          domain: string | null
          extraction_status: string | null
          series: string | null
          total_chunks: number | null
          total_pages: number | null
          total_words: number | null
        }
        Relationships: []
      }
      codex_kb_entity_stats: {
        Row: {
          domain: string | null
          entity_count: number | null
          entity_type: string | null
          total_documents: number | null
          total_mentions: number | null
        }
        Relationships: []
      }
      crm_admin_roles_expanded: {
        Row: {
          access_level: number | null
          admin_display_name: string | null
          category_name: string | null
          category_slug: string | null
          created_at: string | null
          expires_at: string | null
          franchise_name: string | null
          franchise_slug: string | null
          id: string | null
          is_active: boolean | null
          kybe_did: string | null
          permissions: Json | null
          platform_account_type: string | null
          role_type: string | null
          scope_description: string | null
          tenant_name: string | null
          tenant_slug: string | null
        }
        Relationships: []
      }
      crm_personas_with_identity: {
        Row: {
          app_origin: string | null
          auth_profile_id: string | null
          created_at: string | null
          default_identity_state: string | null
          display_name: string | null
          email: string | null
          external_user_id: string | null
          fio_handle: string | null
          id: string | null
          identity_id: string | null
          identity_persona_id: string | null
          kybe_did: string | null
          kybe_did_value: string | null
          kybe_state: string | null
          kyc_status: string | null
          persona_dataqube_id: string | null
          persona_state: string | null
          primary_franchise_id: string | null
          primary_wallet_address: string | null
          reputation_bucket: string | null
          reputation_bucket_updated_at: string | null
          reputation_score: number | null
          reputation_updated_at: string | null
          root_did: string | null
          root_did_proxy_id: string | null
          root_did_uri: string | null
          tenant_id: string | null
          updated_at: string | null
          world_id_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_personas_auth_profile_id_fkey"
            columns: ["auth_profile_id"]
            isOneToOne: false
            referencedRelation: "crm_auth_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_personas_persona_dataqube_id_fkey"
            columns: ["persona_dataqube_id"]
            isOneToOne: false
            referencedRelation: "crm_personas_with_identity"
            referencedColumns: ["identity_id"]
          },
          {
            foreignKeyName: "crm_personas_persona_dataqube_id_fkey"
            columns: ["persona_dataqube_id"]
            isOneToOne: false
            referencedRelation: "persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_personas_persona_dataqube_id_fkey"
            columns: ["persona_dataqube_id"]
            isOneToOne: false
            referencedRelation: "persona_legacy_20260125"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_personas_persona_dataqube_id_fkey"
            columns: ["persona_dataqube_id"]
            isOneToOne: false
            referencedRelation: "persona_with_fio_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_personas_persona_dataqube_id_fkey"
            columns: ["persona_dataqube_id"]
            isOneToOne: false
            referencedRelation: "persona_with_reputation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_personas_primary_franchise_id_fkey"
            columns: ["primary_franchise_id"]
            isOneToOne: false
            referencedRelation: "crm_franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_registry_profiles_public: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          is_active: boolean | null
          kybe_did: string | null
          reputation_bucket: string | null
          total_pokw: number | null
          visibility_level: string | null
        }
        Insert: {
          avatar_url?: never
          created_at?: string | null
          display_name?: never
          id?: string | null
          is_active?: boolean | null
          kybe_did?: string | null
          reputation_bucket?: string | null
          total_pokw?: never
          visibility_level?: string | null
        }
        Update: {
          avatar_url?: never
          created_at?: string | null
          display_name?: never
          id?: string | null
          is_active?: boolean | null
          kybe_did?: string | null
          reputation_bucket?: string | null
          total_pokw?: never
          visibility_level?: string | null
        }
        Relationships: []
      }
      crm_user_account_layers: {
        Row: {
          created_at: string | null
          franchise_access: Json | null
          kybe_did: string | null
          origin_layer: string | null
          platform_account_id: string | null
          platform_account_type: string | null
          registry_profile_id: string | null
          tenant_personas: Json | null
        }
        Relationships: []
      }
      persona: {
        Row: {
          app_origin: string | null
          bio: string | null
          btc_address: string | null
          created_at: string | null
          default_identity_state: string | null
          evm_address: string | null
          fio_handle: string | null
          fio_handle_expiration: string | null
          fio_handle_verified: boolean | null
          fio_last_verified_at: string | null
          fio_public_key: string | null
          fio_registered_at: string | null
          fio_registration_status: string | null
          fio_tx_id: string | null
          first_paid_purchase_at: string | null
          franchise_id: string | null
          id: string | null
          ref_campaign_id: string | null
          referred_by_persona_id: string | null
          referrer_persona_id: string | null
          root_id: string | null
          sol_address: string | null
          tenant_id: string | null
          world_id_status: string | null
        }
        Insert: {
          app_origin?: string | null
          bio?: string | null
          btc_address?: string | null
          created_at?: string | null
          default_identity_state?: string | null
          evm_address?: string | null
          fio_handle?: string | null
          fio_handle_expiration?: string | null
          fio_handle_verified?: boolean | null
          fio_last_verified_at?: string | null
          fio_public_key?: string | null
          fio_registered_at?: string | null
          fio_registration_status?: string | null
          fio_tx_id?: string | null
          first_paid_purchase_at?: string | null
          franchise_id?: string | null
          id?: string | null
          ref_campaign_id?: string | null
          referred_by_persona_id?: string | null
          referrer_persona_id?: string | null
          root_id?: string | null
          sol_address?: string | null
          tenant_id?: string | null
          world_id_status?: string | null
        }
        Update: {
          app_origin?: string | null
          bio?: string | null
          btc_address?: string | null
          created_at?: string | null
          default_identity_state?: string | null
          evm_address?: string | null
          fio_handle?: string | null
          fio_handle_expiration?: string | null
          fio_handle_verified?: boolean | null
          fio_last_verified_at?: string | null
          fio_public_key?: string | null
          fio_registered_at?: string | null
          fio_registration_status?: string | null
          fio_tx_id?: string | null
          first_paid_purchase_at?: string | null
          franchise_id?: string | null
          id?: string | null
          ref_campaign_id?: string | null
          referred_by_persona_id?: string | null
          referrer_persona_id?: string | null
          root_id?: string | null
          sol_address?: string | null
          tenant_id?: string | null
          world_id_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persona_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_root_id_fkey"
            columns: ["root_id"]
            isOneToOne: false
            referencedRelation: "root_identity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      persona_sharing_leaderboard: {
        Row: {
          last_shared: string | null
          persona_id: string | null
          platforms_used: number | null
          shares_made: number | null
          unique_articles_shared: number | null
        }
        Relationships: []
      }
      persona_with_fio_status: {
        Row: {
          app_origin: string | null
          created_at: string | null
          days_until_expiration: number | null
          default_identity_state: string | null
          fio_handle: string | null
          fio_handle_expiration: string | null
          fio_handle_verified: boolean | null
          fio_last_verified_at: string | null
          fio_public_key: string | null
          fio_registered_at: string | null
          fio_registration_status: string | null
          fio_status: string | null
          fio_tx_id: string | null
          id: string | null
          root_id: string | null
          world_id_status: string | null
        }
        Insert: {
          app_origin?: string | null
          created_at?: string | null
          days_until_expiration?: never
          default_identity_state?: string | null
          fio_handle?: string | null
          fio_handle_expiration?: string | null
          fio_handle_verified?: boolean | null
          fio_last_verified_at?: string | null
          fio_public_key?: string | null
          fio_registered_at?: string | null
          fio_registration_status?: string | null
          fio_status?: never
          fio_tx_id?: string | null
          id?: string | null
          root_id?: string | null
          world_id_status?: string | null
        }
        Update: {
          app_origin?: string | null
          created_at?: string | null
          days_until_expiration?: never
          default_identity_state?: string | null
          fio_handle?: string | null
          fio_handle_expiration?: string | null
          fio_handle_verified?: boolean | null
          fio_last_verified_at?: string | null
          fio_public_key?: string | null
          fio_registered_at?: string | null
          fio_registration_status?: string | null
          fio_status?: never
          fio_tx_id?: string | null
          id?: string | null
          root_id?: string | null
          world_id_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persona_root_id_fkey"
            columns: ["root_id"]
            isOneToOne: false
            referencedRelation: "root_identity"
            referencedColumns: ["id"]
          },
        ]
      }
      persona_with_reputation: {
        Row: {
          app_origin: string | null
          created_at: string | null
          default_identity_state: string | null
          fio_days_until_expiration: number | null
          fio_handle: string | null
          fio_handle_expiration: string | null
          fio_handle_verified: boolean | null
          fio_last_verified_at: string | null
          fio_public_key: string | null
          fio_registered_at: string | null
          fio_registration_status: string | null
          fio_status: string | null
          fio_tx_id: string | null
          id: string | null
          reputation_bucket: number | null
          reputation_category: string | null
          reputation_evidence_count: number | null
          reputation_last_synced: string | null
          reputation_partition_id: string | null
          reputation_score: number | null
          root_id: string | null
          world_id_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persona_root_id_fkey"
            columns: ["root_id"]
            isOneToOne: false
            referencedRelation: "root_identity"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_analytics: {
        Row: {
          platform: string | null
          share_date: string | null
          total_shares: number | null
          unique_articles: number | null
          unique_personas: number | null
        }
        Relationships: []
      }
      share_analytics_summary: {
        Row: {
          article_id: string | null
          cached_share_count: number | null
          last_shared: string | null
          platforms_used: number | null
          title: string | null
          total_shares: number | null
          unique_personas: number | null
        }
        Relationships: []
      }
      tenant_hierarchy_view: {
        Row: {
          created_at: string | null
          franchise_hierarchy_path: string[] | null
          franchise_id: string | null
          franchise_level: number | null
          franchise_name: string | null
          franchise_slug: string | null
          is_active: boolean | null
          is_agentiq_tenant: boolean | null
          parent_franchise_id: string | null
          tenant_id: string | null
          tenant_name: string | null
          tenant_slug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_franchises_parent_franchise_id_fkey"
            columns: ["parent_franchise_id"]
            isOneToOne: false
            referencedRelation: "crm_franchises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tenants_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "crm_franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      v_channel_summary: {
        Row: {
          avg_click_rate: number | null
          avg_growth_rate: number | null
          avg_open_rate: number | null
          avg_reply_rate: number | null
          channel_name: Database["public"]["Enums"]["lo_channel_name"] | null
          program_id: string | null
          total_engaged_comments: number | null
          total_follows: number | null
          total_posts: number | null
          total_sent: number | null
          total_shares: number | null
          weeks_reported: number | null
        }
        Relationships: [
          {
            foreignKeyName: "launch_channel_metrics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_channel_metrics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_channel_metrics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
        ]
      }
      v_commercial_summary: {
        Row: {
          avg_conversion_rate: number | null
          blended_aov_cents: number | null
          program_id: string | null
          program_name: string | null
          program_slug: string | null
          total_orders: number | null
          total_revenue_cents: number | null
          weeks_reported: number | null
        }
        Relationships: [
          {
            foreignKeyName: "launch_commercial_metrics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_commercial_metrics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_commercial_metrics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
        ]
      }
      v_marketa_today: {
        Row: {
          all_tasks_total: number | null
          blocked_tasks: number | null
          critical_open_tasks: number | null
          current_week_goal: string | null
          current_week_label: string | null
          current_week_number: number | null
          done_tasks_total: number | null
          name: string | null
          program_id: string | null
          slug: string | null
          status: Database["public"]["Enums"]["lo_program_status"] | null
          status_color: Database["public"]["Enums"]["lo_status_color"] | null
          todays_open_tasks: number | null
          week_status: Database["public"]["Enums"]["lo_task_status"] | null
        }
        Relationships: []
      }
      v_program_health: {
        Row: {
          approved_proof_assets: number | null
          blocked_tasks: number | null
          completion_pct: number | null
          created_at: string | null
          doing_tasks: number | null
          done_tasks: number | null
          name: string | null
          owner: Database["public"]["Enums"]["lo_owner_role"] | null
          priority: Database["public"]["Enums"]["lo_priority"] | null
          program_id: string | null
          slug: string | null
          status: Database["public"]["Enums"]["lo_program_status"] | null
          status_color: Database["public"]["Enums"]["lo_status_color"] | null
          todo_tasks: number | null
          total_proof_assets: number | null
          total_tasks: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_proof_library: {
        Row: {
          asset_type: Database["public"]["Enums"]["lo_proof_asset_type"] | null
          asset_url: string | null
          audience_type: Database["public"]["Enums"]["lo_audience_type"] | null
          body: string | null
          created_at: string | null
          id: string | null
          is_approved: boolean | null
          metadata: Json | null
          offer_name: string | null
          offer_tier: Database["public"]["Enums"]["lo_offer_tier"] | null
          program_id: string | null
          segment_name: string | null
          source_channel: Database["public"]["Enums"]["lo_channel_name"] | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "launch_proof_assets_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_proof_assets_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_proof_assets_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
        ]
      }
      v_readiness_dashboard: {
        Row: {
          audience_score: string | null
          green_count: number | null
          offer_score: string | null
          ops_score: string | null
          program_id: string | null
          proof_score: string | null
          red_count: number | null
          report_id: string | null
          story_score: string | null
          week_number: number | null
          yellow_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "launch_readiness_scores_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_readiness_scores_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_readiness_scores_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_readiness_scores_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "launch_weekly_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      v_week_progress_summary: {
        Row: {
          blocked_tasks: number | null
          completion_pct: number | null
          critical_tasks: number | null
          doing_tasks: number | null
          done_tasks: number | null
          goal: string | null
          label: string | null
          program_id: string | null
          status: Database["public"]["Enums"]["lo_task_status"] | null
          status_color: Database["public"]["Enums"]["lo_status_color"] | null
          todo_tasks: number | null
          total_tasks: number | null
          week_id: string | null
          week_number: number | null
        }
        Relationships: [
          {
            foreignKeyName: "launch_sprint_weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "launch_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_sprint_weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_marketa_today"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "launch_sprint_weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_program_health"
            referencedColumns: ["program_id"]
          },
        ]
      }
    }
    Functions: {
      accept_payment_request: {
        Args: { p_payer_id: string; p_request_id: string }
        Returns: boolean
      }
      assign_admin_role: { Args: { user_email: string }; Returns: undefined }
      calculate_cvs: {
        Args: {
          p_final_score: number
          p_impact_level: number
          p_impact_multiplier?: number
        }
        Returns: number
      }
      can_govern_franchise: {
        Args: { governor_uuid: string; target_uuid: string }
        Returns: boolean
      }
      check_admin_access: {
        Args: {
          p_action: string
          p_category_slug?: string
          p_franchise_id?: string
          p_kybe_did: string
          p_tenant_id?: string
        }
        Returns: boolean
      }
      cleanup_old_qubetalk_messages: {
        Args: { days_old?: number }
        Returns: number
      }
      create_payment_request: {
        Args: {
          p_amount: number
          p_asset?: string
          p_chain_id?: number
          p_expires_in_days?: number
          p_memo?: string
          p_payer_fio: string
          p_payer_id: string
          p_requester_address: string
          p_requester_fio: string
          p_requester_id: string
        }
        Returns: string
      }
      days_until_fio_expiration: {
        Args: { expiration: string }
        Returns: number
      }
      get_agent_addresses: {
        Args: { p_agent_id: string }
        Returns: {
          agent_id: string
          btc_address: string
          evm_address: string
          solana_address: string
        }[]
      }
      get_agent_addresses_flexible: {
        Args: { p_identifier: string }
        Returns: {
          agent_id: string
          agent_name: string
          btc_address: string
          entity_type: string
          evm_address: string
          fio_handle: string
          solana_address: string
        }[]
      }
      get_agent_keys_flexible: {
        Args: { p_identifier: string }
        Returns: {
          agent_id: string
          agent_name: string
          btc_address: string
          btc_private_key_encrypted: string
          created_at: string
          entity_type: string
          evm_address: string
          evm_private_key_encrypted: string
          fio_handle: string
          persona_id: string
          solana_address: string
          solana_private_key_encrypted: string
          updated_at: string
        }[]
      }
      get_agentiq_hierarchy: {
        Args: never
        Returns: {
          franchise_id: string
          hierarchy_level: number
          hierarchy_path: string[]
          is_anchor: boolean
          name: string
          parent_franchise_id: string
          slug: string
        }[]
      }
      get_all_episode_metadata: {
        Args: { p_series?: string }
        Returns: {
          display_number: string
          episode_number: number
          main_characters: Json
          subtitle: string
          synopsis: string
          themes: Json
          title: string
          updated_at: string
          version: number
        }[]
      }
      get_codex_character_full: {
        Args: { p_character_id: string }
        Returns: {
          character_data: Json
          episode_appearances: Json
          knyt_card: Json
        }[]
      }
      get_codex_episode_full: {
        Args: { p_episode_id: string }
        Returns: {
          credits: Json
          episode: Json
          focus_character: Json
          focus_knyt_card: Json
        }[]
      }
      get_codex_episodes_list: {
        Args: { p_series?: string }
        Returns: {
          cover_ref: string
          episode_number: number
          id: string
          issue_number: string
          knytcard_focus: string
          season_number: string
          synopsis: string
          title: string
        }[]
      }
      get_codex_global_stats: {
        Args: { p_series?: string }
        Returns: {
          total_all_assets: number
          total_characters: number
          total_covers: number
          total_game_assets: number
          total_lore_docs: number
          total_motion_masters: number
          total_print_epic: number
          total_print_legendary: number
          total_print_rare: number
          total_social_assets: number
          total_still_masters: number
        }[]
      }
      get_codex_status: {
        Args: { p_series?: string }
        Returns: {
          character_count: number
          cover_count: number
          episode_number: number
          has_motion_master: boolean
          has_print_epic: boolean
          has_print_legendary: boolean
          has_print_rare: boolean
          has_still_master: boolean
          total_assets: number
        }[]
      }
      get_episode_metadata: {
        Args: { p_episode_number: number; p_series?: string }
        Returns: {
          artist: string
          display_number: string
          episode_number: number
          extra_metadata: Json
          id: string
          key_events: Json
          locations: Json
          main_characters: Json
          release_date: string
          subtitle: string
          supporting_characters: Json
          synopsis: string
          themes: Json
          title: string
          updated_at: string
          version: number
          writer: string
        }[]
      }
      get_franchise_hierarchy_path: {
        Args: { franchise_uuid: string }
        Returns: string[]
      }
      get_normalized_rep_weights: {
        Args: { p_task_template_id: string }
        Returns: {
          weight_community: number
          weight_creative: number
          weight_data_arch: number
          weight_entrepreneurial: number
          weight_technical: number
        }[]
      }
      get_pending_payment_requests: {
        Args: { p_payer_id: string }
        Returns: {
          amount: number
          asset: string
          chain_id: number
          created_at: string
          expires_at: string
          id: string
          memo: string
          requester_address: string
          requester_fio: string
          requester_id: string
          status: string
        }[]
      }
      get_print_edition_for_mint: {
        Args: {
          p_edition_tier: string
          p_episode_number: number
          p_series?: string
        }
        Returns: {
          cid: string
          edition_tier: string
          master_id: string
          mime_type: string
          title: string
        }[]
      }
      get_related_chunks: {
        Args: { match_count?: number; source_chunk_id: string }
        Returns: {
          chunk_id: string
          content: string
          document_id: string
          similarity: number
          title: string
        }[]
      }
      get_unread_notifications: {
        Args: { p_recipient_id: string }
        Returns: {
          amount: number
          asset: string
          created_at: string
          from_fio: string
          from_id: string
          id: string
          message: string
          payment_request_id: string
          title: string
          tx_hash: string
          type: string
        }[]
      }
      get_user_admin_roles: {
        Args: { p_kybe_did: string }
        Returns: {
          access_level: number
          category_name: string
          franchise_name: string
          permissions: Json
          role_id: string
          role_type: string
          scope_description: string
          tenant_name: string
        }[]
      }
      get_user_issues_for_episode: {
        Args: { p_episode_number: number; p_owner_id: string }
        Returns: {
          cover_asset_id: string
          cover_rarity: string
          cover_title: string
          custody_mode: Database["public"]["Enums"]["custody_mode_type"]
          edition_serial: number
          edition_total: number
          issue_id: string
          master_content_id: string
          minted_at: string
        }[]
      }
      has_admin_role: { Args: never; Returns: boolean }
      hybrid_search_kb_chunks: {
        Args: {
          match_count?: number
          match_domain?: string
          query_embedding?: string
          query_text: string
        }
        Returns: {
          chunk_id: string
          chunk_index: number
          content: string
          content_category: string
          document_id: string
          domain: string
          search_type: string
          similarity: number
          title: string
        }[]
      }
      increment_knyt_link_click_count: {
        Args: { p_tag_name: string }
        Returns: undefined
      }
      increment_share_count: {
        Args: { content_id: string }
        Returns: undefined
      }
      is_fio_handle_expired: { Args: { expiration: string }; Returns: boolean }
      link_crm_persona_to_identity: {
        Args: { p_crm_persona_id: string; p_identity_persona_id: string }
        Returns: boolean
      }
      lo_is_program_member: { Args: { p_program_id: string }; Returns: boolean }
      lo_program_role: { Args: { p_program_id: string }; Returns: string }
      mark_notifications_read: {
        Args: { p_notification_ids?: string[]; p_recipient_id: string }
        Returns: number
      }
      mark_payment_request_paid: {
        Args: { p_request_id: string; p_tx_hash: string }
        Returns: boolean
      }
      parse_issue_to_episode_number: {
        Args: { p_issue: string }
        Returns: number
      }
      reject_payment_request: {
        Args: { p_payer_id: string; p_reason?: string; p_request_id: string }
        Returns: boolean
      }
      rpc_capture_proof_asset: {
        Args: {
          p_asset_type: Database["public"]["Enums"]["lo_proof_asset_type"]
          p_asset_url?: string
          p_body?: string
          p_is_approved?: boolean
          p_metadata?: Json
          p_program_id: string
          p_source_channel?: Database["public"]["Enums"]["lo_channel_name"]
          p_source_offer_id?: string
          p_source_segment_id?: string
          p_title?: string
        }
        Returns: string
      }
      rpc_mark_task_status: {
        Args: {
          p_color?: Database["public"]["Enums"]["lo_status_color"]
          p_status: Database["public"]["Enums"]["lo_task_status"]
          p_task_id: string
        }
        Returns: undefined
      }
      rpc_program_readiness_verdict: {
        Args: { p_report_id: string }
        Returns: boolean
      }
      rpc_roll_week_forward: {
        Args: { p_from_week_no: number; p_program_id: string }
        Returns: undefined
      }
      rpc_upsert_readiness_for_week: {
        Args: {
          p_bucket: Database["public"]["Enums"]["lo_readiness_bucket"]
          p_notes?: string
          p_program_id: string
          p_report_id: string
          p_score: Database["public"]["Enums"]["lo_readiness_score"]
        }
        Returns: undefined
      }
      rpc_upsert_weekly_report: {
        Args: {
          p_best_messages?: Json
          p_next_week_priorities?: Json
          p_program_id: string
          p_recommendation?: Database["public"]["Enums"]["lo_recommendation"]
          p_recommendation_reason?: string
          p_status?: Database["public"]["Enums"]["lo_task_status"]
          p_summary?: string
          p_top_losses?: Json
          p_top_objections?: Json
          p_top_wins?: Json
          p_week_number: number
        }
        Returns: string
      }
      search_kb_chunks: {
        Args: {
          match_count?: number
          match_domain?: string
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          chunk_id: string
          chunk_index: number
          content: string
          content_category: string
          document_id: string
          domain: string
          similarity: number
          title: string
        }[]
      }
      select_and_claim_cover: {
        Args: { p_episode_number: number; p_series?: string }
        Returns: {
          asset_id: string
          edition_max: number
          edition_serial: number
          rarity_tier: string
          variant_name: string
        }[]
      }
      sync_crm_persona_reputation: {
        Args: {
          p_crm_persona_id: string
          p_reputation_bucket: number
          p_reputation_score: number
        }
        Returns: boolean
      }
      sync_reputation_from_rqh: {
        Args: {
          p_bucket_level: number
          p_evidence_count: number
          p_partition_id: string
          p_rqh_bucket_id?: string
          p_score: number
        }
        Returns: string
      }
      update_cluster_stats: {
        Args: { p_cluster_id: string }
        Returns: undefined
      }
      update_persona_reputation: {
        Args: {
          p_cvs?: number
          p_delta_community?: number
          p_delta_creative?: number
          p_delta_data_arch?: number
          p_delta_entrepreneurial?: number
          p_delta_technical?: number
          p_persona_id: string
        }
        Returns: undefined
      }
      upsert_agent_keys: {
        Args: {
          p_agent_id: string
          p_agent_name: string
          p_btc_address?: string
          p_btc_private_key_encrypted?: string
          p_entity_type?: string
          p_evm_address?: string
          p_evm_private_key_encrypted?: string
          p_fio_handle?: string
          p_persona_id?: string
          p_solana_address?: string
          p_solana_private_key_encrypted?: string
        }
        Returns: string
      }
      upsert_episode_metadata: {
        Args: {
          p_artist?: string
          p_colorist?: string
          p_display_number?: string
          p_editor?: string
          p_episode_number: number
          p_extra_metadata?: Json
          p_key_events?: Json
          p_letterer?: string
          p_locations?: Json
          p_main_characters?: Json
          p_release_date?: string
          p_series: string
          p_subtitle?: string
          p_supporting_characters?: Json
          p_synopsis?: string
          p_themes?: Json
          p_title: string
          p_writer?: string
        }
        Returns: string
      }
    }
    Enums: {
      codex_asset_kind:
        | "character_poster"
        | "powers_sheet"
        | "background_lore_doc"
        | "game_concept_doc"
        | "game_still"
        | "game_video"
        | "twenty_one_sats_concept"
        | "social_campaign_video"
        | "social_campaign_image"
        | "cover_pdf"
        | "cover_image"
      content_display_mode: "pdf" | "image" | "video" | "text_extract"
      content_modality: "read" | "watch" | "listen" | "interact"
      content_status: "draft" | "published" | "archived" | "scheduled"
      content_structure_kind:
        | "episode"
        | "issue"
        | "article"
        | "series"
        | "collection"
      custody_mode_type: "custodial" | "canonical"
      entitlement_acquisition:
        | "purchase"
        | "subscription"
        | "rental"
        | "gift"
        | "reward"
        | "free"
      entitlement_scope: "full" | "preview" | "rental" | "subscription"
      entitlement_tier: "T0" | "T1" | "T2"
      entitlement_type: "perpetual" | "term" | "subscription"
      expiry_model:
        | "permanent"
        | "rental"
        | "subscription"
        | "timeLimited"
        | "usageLimited"
      identity_state: "anonymous" | "pseudo" | "semi" | "full"
      knyt_canon_branch: "canon" | "community" | "correspondent"
      knyt_election_status: "draft" | "open" | "closed" | "settled"
      knyt_publication_state:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "archived"
        | "canon_eligible"
        | "canon"
      knyt_votable_type:
        | "community_submission"
        | "correspondent_candidate"
        | "branch_continuation"
        | "article_candidate"
        | "theory_thread"
        | "scene_extension"
        | "canon_elevation_candidate"
      lo_audience_type:
        | "investor_top"
        | "investor_warm"
        | "investor_dormant"
        | "community_warm"
        | "public_cold"
      lo_channel_name:
        | "email"
        | "sms"
        | "x"
        | "instagram"
        | "linkedin"
        | "kickstarter_prelaunch"
      lo_channel_role:
        | "convert"
        | "nudge"
        | "signal"
        | "visual_halo"
        | "legitimacy"
        | "follow_capture"
      lo_decision_rule: "relaunch_on_evidence" | "mostly_green_rule"
      lo_metric_type:
        | "orders"
        | "revenue"
        | "aov"
        | "conversion_rate"
        | "proof_assets"
        | "engaged_followers"
        | "kickstarter_follows"
        | "readiness_score"
      lo_objective_type:
        | "direct_sales"
        | "message_fit"
        | "proof_build"
        | "halo_growth"
        | "launch_readiness"
      lo_offer_goal:
        | "fast_conversion"
        | "high_value_conversion"
        | "investor_activation"
      lo_offer_tier: "entry" | "premium" | "founding"
      lo_offer_type: "digital" | "bundle" | "exclusive"
      lo_owner_role:
        | "Marketa"
        | "Founder"
        | "Ops"
        | "Design"
        | "Dev"
        | "Community"
      lo_priority: "low" | "medium" | "high" | "critical"
      lo_program_status: "draft" | "active" | "paused" | "done" | "archived"
      lo_proof_asset_type:
        | "testimonial"
        | "quote"
        | "screenshot"
        | "comment"
        | "buyer_reaction"
        | "supporter_post"
        | "referral_event"
      lo_readiness_bucket: "offer" | "audience" | "proof" | "ops" | "story"
      lo_readiness_score: "red" | "yellow" | "green"
      lo_recommendation:
        | "continue_validation"
        | "move_to_prelaunch_concentration"
        | "prepare_relaunch"
      lo_status_color: "gray" | "blue" | "yellow" | "green" | "red"
      lo_target_type: "increase" | "optimize" | "stabilize" | "reach_threshold"
      lo_task_status: "todo" | "doing" | "blocked" | "done" | "canceled"
      lo_task_type:
        | "strategy"
        | "copy"
        | "offer_design"
        | "ops_copy"
        | "crm"
        | "analytics"
        | "content_ops"
        | "faq"
        | "creative"
        | "email"
        | "direct_outreach"
        | "sms"
        | "research"
        | "community"
        | "social"
        | "product"
        | "growth"
        | "decision"
        | "memo"
        | "proof_build"
      master_content_type: "episode_still" | "episode_motion" | "episode_print"
      order_tier: "NONE" | "KETA" | "KEJI" | "FIRST" | "ZERO" | "SAT"
      payment_currency:
        | "QCT"
        | "QOYN"
        | "KNYT"
        | "USDC"
        | "ETH"
        | "BTC"
        | "sats"
      pricing_kind:
        | "payPerPanel"
        | "payPerEpisode"
        | "payPerStream"
        | "payPerArticle"
        | "payPerIssue"
        | "payPerSeries"
        | "subscription"
        | "bundle"
        | "free"
      relationship_entity_type:
        | "SmartContentQube"
        | "Persona"
        | "Agent"
        | "Series"
        | "Collection"
        | "Quest"
        | "Shelf"
      relationship_type:
        | "sequence"
        | "branch"
        | "series"
        | "collection"
        | "reference"
        | "prerequisite"
        | "questPath"
        | "playlist"
      reputation_tier:
        | "R-"
        | "R0_KETA"
        | "R1_KEJI"
        | "R2_FIRST"
        | "R3_ZERO"
        | "R4_SAT"
      reward_task_type:
        | "BringAKnightQualifiedReferral"
        | "KnightOfAttentionEpisodeComplete"
        | "KnightOfAttentionWeeklyStreak"
        | "KnightOfAttentionStreakBonus"
        | "HeraldCuriosityClicks"
        | "HeraldAudienceSignups"
        | "HeraldConversionPayingUser"
        | "FoundingOrderAirdrop"
      smart_content_app: "metaKnyts" | "Qriptopian" | "AgentiQ"
      storage_provider: "supabase" | "ipfs" | "autonomys" | "cdn" | "external"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      codex_asset_kind: [
        "character_poster",
        "powers_sheet",
        "background_lore_doc",
        "game_concept_doc",
        "game_still",
        "game_video",
        "twenty_one_sats_concept",
        "social_campaign_video",
        "social_campaign_image",
        "cover_pdf",
        "cover_image",
      ],
      content_display_mode: ["pdf", "image", "video", "text_extract"],
      content_modality: ["read", "watch", "listen", "interact"],
      content_status: ["draft", "published", "archived", "scheduled"],
      content_structure_kind: [
        "episode",
        "issue",
        "article",
        "series",
        "collection",
      ],
      custody_mode_type: ["custodial", "canonical"],
      entitlement_acquisition: [
        "purchase",
        "subscription",
        "rental",
        "gift",
        "reward",
        "free",
      ],
      entitlement_scope: ["full", "preview", "rental", "subscription"],
      entitlement_tier: ["T0", "T1", "T2"],
      entitlement_type: ["perpetual", "term", "subscription"],
      expiry_model: [
        "permanent",
        "rental",
        "subscription",
        "timeLimited",
        "usageLimited",
      ],
      identity_state: ["anonymous", "pseudo", "semi", "full"],
      knyt_canon_branch: ["canon", "community", "correspondent"],
      knyt_election_status: ["draft", "open", "closed", "settled"],
      knyt_publication_state: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "archived",
        "canon_eligible",
        "canon",
      ],
      knyt_votable_type: [
        "community_submission",
        "correspondent_candidate",
        "branch_continuation",
        "article_candidate",
        "theory_thread",
        "scene_extension",
        "canon_elevation_candidate",
      ],
      lo_audience_type: [
        "investor_top",
        "investor_warm",
        "investor_dormant",
        "community_warm",
        "public_cold",
      ],
      lo_channel_name: [
        "email",
        "sms",
        "x",
        "instagram",
        "linkedin",
        "kickstarter_prelaunch",
      ],
      lo_channel_role: [
        "convert",
        "nudge",
        "signal",
        "visual_halo",
        "legitimacy",
        "follow_capture",
      ],
      lo_decision_rule: ["relaunch_on_evidence", "mostly_green_rule"],
      lo_metric_type: [
        "orders",
        "revenue",
        "aov",
        "conversion_rate",
        "proof_assets",
        "engaged_followers",
        "kickstarter_follows",
        "readiness_score",
      ],
      lo_objective_type: [
        "direct_sales",
        "message_fit",
        "proof_build",
        "halo_growth",
        "launch_readiness",
      ],
      lo_offer_goal: [
        "fast_conversion",
        "high_value_conversion",
        "investor_activation",
      ],
      lo_offer_tier: ["entry", "premium", "founding"],
      lo_offer_type: ["digital", "bundle", "exclusive"],
      lo_owner_role: [
        "Marketa",
        "Founder",
        "Ops",
        "Design",
        "Dev",
        "Community",
      ],
      lo_priority: ["low", "medium", "high", "critical"],
      lo_program_status: ["draft", "active", "paused", "done", "archived"],
      lo_proof_asset_type: [
        "testimonial",
        "quote",
        "screenshot",
        "comment",
        "buyer_reaction",
        "supporter_post",
        "referral_event",
      ],
      lo_readiness_bucket: ["offer", "audience", "proof", "ops", "story"],
      lo_readiness_score: ["red", "yellow", "green"],
      lo_recommendation: [
        "continue_validation",
        "move_to_prelaunch_concentration",
        "prepare_relaunch",
      ],
      lo_status_color: ["gray", "blue", "yellow", "green", "red"],
      lo_target_type: ["increase", "optimize", "stabilize", "reach_threshold"],
      lo_task_status: ["todo", "doing", "blocked", "done", "canceled"],
      lo_task_type: [
        "strategy",
        "copy",
        "offer_design",
        "ops_copy",
        "crm",
        "analytics",
        "content_ops",
        "faq",
        "creative",
        "email",
        "direct_outreach",
        "sms",
        "research",
        "community",
        "social",
        "product",
        "growth",
        "decision",
        "memo",
        "proof_build",
      ],
      master_content_type: ["episode_still", "episode_motion", "episode_print"],
      order_tier: ["NONE", "KETA", "KEJI", "FIRST", "ZERO", "SAT"],
      payment_currency: ["QCT", "QOYN", "KNYT", "USDC", "ETH", "BTC", "sats"],
      pricing_kind: [
        "payPerPanel",
        "payPerEpisode",
        "payPerStream",
        "payPerArticle",
        "payPerIssue",
        "payPerSeries",
        "subscription",
        "bundle",
        "free",
      ],
      relationship_entity_type: [
        "SmartContentQube",
        "Persona",
        "Agent",
        "Series",
        "Collection",
        "Quest",
        "Shelf",
      ],
      relationship_type: [
        "sequence",
        "branch",
        "series",
        "collection",
        "reference",
        "prerequisite",
        "questPath",
        "playlist",
      ],
      reputation_tier: [
        "R-",
        "R0_KETA",
        "R1_KEJI",
        "R2_FIRST",
        "R3_ZERO",
        "R4_SAT",
      ],
      reward_task_type: [
        "BringAKnightQualifiedReferral",
        "KnightOfAttentionEpisodeComplete",
        "KnightOfAttentionWeeklyStreak",
        "KnightOfAttentionStreakBonus",
        "HeraldCuriosityClicks",
        "HeraldAudienceSignups",
        "HeraldConversionPayingUser",
        "FoundingOrderAirdrop",
      ],
      smart_content_app: ["metaKnyts", "Qriptopian", "AgentiQ"],
      storage_provider: ["supabase", "ipfs", "autonomys", "cdn", "external"],
    },
  },
} as const
