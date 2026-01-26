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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_runs: {
        Row: {
          agent_type: string
          category_id: string | null
          completed_at: string | null
          duration_ms: number | null
          errors: Json | null
          id: string
          started_at: string
          status: string
          tools_discovered: number | null
          tools_updated: number | null
        }
        Insert: {
          agent_type: string
          category_id?: string | null
          completed_at?: string | null
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          started_at?: string
          status?: string
          tools_discovered?: number | null
          tools_updated?: number | null
        }
        Update: {
          agent_type?: string
          category_id?: string | null
          completed_at?: string | null
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          started_at?: string
          status?: string
          tools_discovered?: number | null
          tools_updated?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_scores: {
        Row: {
          agent_version: string | null
          created_at: string
          documentation_quality: number | null
          evaluated_at: string
          feature_completeness: number | null
          id: string
          overall_score: number | null
          popularity_proxy: number | null
          pricing_clarity: number | null
          score_explanation: Json | null
          tool_id: string
          use_case_coverage: number | null
        }
        Insert: {
          agent_version?: string | null
          created_at?: string
          documentation_quality?: number | null
          evaluated_at?: string
          feature_completeness?: number | null
          id?: string
          overall_score?: number | null
          popularity_proxy?: number | null
          pricing_clarity?: number | null
          score_explanation?: Json | null
          tool_id: string
          use_case_coverage?: number | null
        }
        Update: {
          agent_version?: string | null
          created_at?: string
          documentation_quality?: number | null
          evaluated_at?: string
          feature_completeness?: number | null
          id?: string
          overall_score?: number | null
          popularity_proxy?: number | null
          pricing_clarity?: number | null
          score_explanation?: Json | null
          tool_id?: string
          use_case_coverage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_scores_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      answers: {
        Row: {
          body: string
          created_at: string
          downvotes: number | null
          id: string
          is_accepted: boolean | null
          question_id: string
          status: Database["public"]["Enums"]["content_status"] | null
          updated_at: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          downvotes?: number | null
          id?: string
          is_accepted?: boolean | null
          question_id: string
          status?: Database["public"]["Enums"]["content_status"] | null
          updated_at?: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          downvotes?: number | null
          id?: string
          is_accepted?: boolean | null
          question_id?: string
          status?: Database["public"]["Enums"]["content_status"] | null
          updated_at?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_scores: {
        Row: {
          calculated_at: string
          created_at: string
          id: string
          negative_mentions: number | null
          neutral_mentions: number | null
          overall_score: number | null
          positive_mentions: number | null
          reliability_warnings: number | null
          sentiment_score: number | null
          spam_flags: number | null
          tool_id: string
          weighted_recommendation_score: number | null
        }
        Insert: {
          calculated_at?: string
          created_at?: string
          id?: string
          negative_mentions?: number | null
          neutral_mentions?: number | null
          overall_score?: number | null
          positive_mentions?: number | null
          reliability_warnings?: number | null
          sentiment_score?: number | null
          spam_flags?: number | null
          tool_id: string
          weighted_recommendation_score?: number | null
        }
        Update: {
          calculated_at?: string
          created_at?: string
          id?: string
          negative_mentions?: number | null
          neutral_mentions?: number | null
          overall_score?: number | null
          positive_mentions?: number | null
          reliability_warnings?: number | null
          sentiment_score?: number | null
          spam_flags?: number | null
          tool_id?: string
          weighted_recommendation_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_scores_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          helpful_answer_count: number | null
          id: string
          is_suspended: boolean | null
          is_verified: boolean | null
          reputation_score: number | null
          total_answers: number | null
          total_questions: number | null
          total_upvotes_received: number | null
          trust_level: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          helpful_answer_count?: number | null
          id?: string
          is_suspended?: boolean | null
          is_verified?: boolean | null
          reputation_score?: number | null
          total_answers?: number | null
          total_questions?: number | null
          total_upvotes_received?: number | null
          trust_level?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          helpful_answer_count?: number | null
          id?: string
          is_suspended?: boolean | null
          is_verified?: boolean | null
          reputation_score?: number | null
          total_answers?: number | null
          total_questions?: number | null
          total_upvotes_received?: number | null
          trust_level?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      question_tool_mentions: {
        Row: {
          created_at: string
          id: string
          question_id: string
          tool_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          tool_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_tool_mentions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_tool_mentions_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          accepted_answer_id: string | null
          answer_count: number | null
          body: string
          created_at: string
          downvotes: number | null
          id: string
          is_answered: boolean | null
          status: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at: string
          upvotes: number | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          accepted_answer_id?: string | null
          answer_count?: number | null
          body: string
          created_at?: string
          downvotes?: number | null
          id?: string
          is_answered?: boolean | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at?: string
          upvotes?: number | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          accepted_answer_id?: string | null
          answer_count?: number | null
          body?: string
          created_at?: string
          downvotes?: number | null
          id?: string
          is_answered?: boolean | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string
          updated_at?: string
          upvotes?: number | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      rankings: {
        Row: {
          ai_score: number
          ai_weight: number | null
          category_id: string | null
          community_score: number
          community_weight: number | null
          composite_score: number
          id: string
          rank_position: number
          ranked_at: string
          score_breakdown: Json | null
          tool_id: string
        }
        Insert: {
          ai_score: number
          ai_weight?: number | null
          category_id?: string | null
          community_score: number
          community_weight?: number | null
          composite_score: number
          id?: string
          rank_position: number
          ranked_at?: string
          score_breakdown?: Json | null
          tool_id: string
        }
        Update: {
          ai_score?: number
          ai_weight?: number | null
          category_id?: string | null
          community_score?: number
          community_weight?: number | null
          composite_score?: number
          id?: string
          rank_position?: number
          ranked_at?: string
          score_breakdown?: Json | null
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rankings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rankings_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          created_at: string
          id: string
          last_crawled_at: string | null
          name: string
          reliability_score: number | null
          source_type: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_crawled_at?: string | null
          name: string
          reliability_score?: number | null
          source_type: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          last_crawled_at?: string | null
          name?: string
          reliability_score?: number | null
          source_type?: string
          url?: string
        }
        Relationships: []
      }
      tool_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          tool_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          tool_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_categories_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          ai_score: number | null
          community_score: number | null
          composite_score: number | null
          confidence_score: number | null
          created_at: string
          description: string | null
          features: Json | null
          id: string
          logo_url: string | null
          mention_count: number | null
          name: string
          pricing_details: Json | null
          pricing_model: Database["public"]["Enums"]["pricing_model"] | null
          question_count: number | null
          slug: string
          source_urls: string[] | null
          status: Database["public"]["Enums"]["tool_status"] | null
          tagline: string | null
          target_users: string[] | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          ai_score?: number | null
          community_score?: number | null
          composite_score?: number | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          logo_url?: string | null
          mention_count?: number | null
          name: string
          pricing_details?: Json | null
          pricing_model?: Database["public"]["Enums"]["pricing_model"] | null
          question_count?: number | null
          slug: string
          source_urls?: string[] | null
          status?: Database["public"]["Enums"]["tool_status"] | null
          tagline?: string | null
          target_users?: string[] | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          ai_score?: number | null
          community_score?: number | null
          composite_score?: number | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          logo_url?: string | null
          mention_count?: number | null
          name?: string
          pricing_details?: Json | null
          pricing_model?: Database["public"]["Enums"]["pricing_model"] | null
          question_count?: number | null
          slug?: string
          source_urls?: string[] | null
          status?: Database["public"]["Enums"]["tool_status"] | null
          tagline?: string | null
          target_users?: string[] | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          answer_id: string | null
          created_at: string
          id: string
          question_id: string | null
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Insert: {
          answer_id?: string | null
          created_at?: string
          id?: string
          question_id?: string | null
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Update: {
          answer_id?: string | null
          created_at?: string
          id?: string
          question_id?: string | null
          user_id?: string
          vote_type?: Database["public"]["Enums"]["vote_type"]
        }
        Relationships: [
          {
            foreignKeyName: "votes_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      content_status: "active" | "hidden" | "deleted"
      pricing_model:
        | "free"
        | "freemium"
        | "paid"
        | "enterprise"
        | "open_source"
        | "subscription"
      tool_status: "pending" | "verified" | "deprecated" | "removed"
      vote_type: "up" | "down"
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
      app_role: ["admin", "moderator", "user"],
      content_status: ["active", "hidden", "deleted"],
      pricing_model: [
        "free",
        "freemium",
        "paid",
        "enterprise",
        "open_source",
        "subscription",
      ],
      tool_status: ["pending", "verified", "deprecated", "removed"],
      vote_type: ["up", "down"],
    },
  },
} as const
