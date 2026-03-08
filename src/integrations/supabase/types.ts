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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_response_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          expires_at: string
          hit_count: number | null
          id: string
          response_json: Json
          use_case: string
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          expires_at: string
          hit_count?: number | null
          id?: string
          response_json: Json
          use_case: string
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          expires_at?: string
          hit_count?: number | null
          id?: string
          response_json?: Json
          use_case?: string
        }
        Relationships: []
      }
      interview_responses: {
        Row: {
          answer: string
          created_at: string | null
          feedback: string | null
          id: string
          ideal_elements: Json | null
          question: string
          question_number: number | null
          score: number | null
          session_id: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          feedback?: string | null
          id?: string
          ideal_elements?: Json | null
          question: string
          question_number?: number | null
          score?: number | null
          session_id: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          feedback?: string | null
          id?: string
          ideal_elements?: Json | null
          question?: string
          question_number?: number | null
          score?: number | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          difficulty: string | null
          id: string
          improvements: Json | null
          interview_type: string | null
          overall_score: number | null
          strengths: Json | null
          target_role: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          improvements?: Json | null
          interview_type?: string | null
          overall_score?: number | null
          strengths?: Json | null
          target_role?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          improvements?: Json | null
          interview_type?: string | null
          overall_score?: number | null
          strengths?: Json | null
          target_role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_plans: {
        Row: {
          created_at: string | null
          estimated_weeks: number | null
          id: string
          phase: string | null
          resume_id: string | null
          target_role_id: string | null
          total_skills: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          estimated_weeks?: number | null
          id?: string
          phase?: string | null
          resume_id?: string | null
          target_role_id?: string | null
          total_skills?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          estimated_weeks?: number | null
          id?: string
          phase?: string | null
          resume_id?: string | null
          target_role_id?: string | null
          total_skills?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_plans_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_plans_target_role_id_fkey"
            columns: ["target_role_id"]
            isOneToOne: false
            referencedRelation: "target_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_steps: {
        Row: {
          completed_at: string | null
          created_at: string | null
          estimated_weeks: number | null
          how_to_learn: string | null
          id: string
          importance_level: string | null
          phase: string | null
          plan_id: string
          practical_tasks: Json | null
          resources: Json | null
          skill_name: string
          sort_order: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          estimated_weeks?: number | null
          how_to_learn?: string | null
          id?: string
          importance_level?: string | null
          phase?: string | null
          plan_id: string
          practical_tasks?: Json | null
          resources?: Json | null
          skill_name: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          estimated_weeks?: number | null
          how_to_learn?: string | null
          id?: string
          importance_level?: string | null
          phase?: string | null
          plan_id?: string
          practical_tasks?: Json | null
          resources?: Json | null
          skill_name?: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_steps_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "learning_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_logo_url: string | null
          company_name: string | null
          created_at: string | null
          display_name: string | null
          id: string
          onboarding_completed: boolean | null
          updated_at: string | null
          user_goal: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          updated_at?: string | null
          user_goal?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          updated_at?: string | null
          user_goal?: string | null
        }
        Relationships: []
      }
      progress_logs: {
        Row: {
          action: string
          id: string
          logged_at: string | null
          notes: string | null
          step_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          logged_at?: string | null
          notes?: string | null
          step_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          logged_at?: string | null
          notes?: string | null
          step_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_logs_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "plan_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          created_at: string | null
          detected_experience_level: string | null
          detected_industry: string | null
          extracted_skills: Json | null
          id: string
          overall_fit_score: number | null
          raw_text: string
          strengths: Json | null
          updated_at: string | null
          user_id: string
          weaknesses: Json | null
        }
        Insert: {
          created_at?: string | null
          detected_experience_level?: string | null
          detected_industry?: string | null
          extracted_skills?: Json | null
          id?: string
          overall_fit_score?: number | null
          raw_text: string
          strengths?: Json | null
          updated_at?: string | null
          user_id: string
          weaknesses?: Json | null
        }
        Update: {
          created_at?: string | null
          detected_experience_level?: string | null
          detected_industry?: string | null
          extracted_skills?: Json | null
          id?: string
          overall_fit_score?: number | null
          raw_text?: string
          strengths?: Json | null
          updated_at?: string | null
          user_id?: string
          weaknesses?: Json | null
        }
        Relationships: []
      }
      skill_gaps: {
        Row: {
          created_at: string | null
          id: string
          importance_level: string | null
          skill_name: string
          target_role_id: string | null
          user_id: string
          why_it_matters: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          importance_level?: string | null
          skill_name: string
          target_role_id?: string | null
          user_id: string
          why_it_matters?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          importance_level?: string | null
          skill_name?: string
          target_role_id?: string | null
          user_id?: string
          why_it_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_gaps_target_role_id_fkey"
            columns: ["target_role_id"]
            isOneToOne: false
            referencedRelation: "target_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      support_sessions: {
        Row: {
          created_at: string | null
          id: string
          messages: Json | null
          save_history: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          save_history?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json | null
          save_history?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      target_roles: {
        Row: {
          created_at: string | null
          experience_level: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          role_title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          experience_level?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          role_title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          experience_level?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          role_title?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_logs: {
        Row: {
          action: string
          count: number | null
          id: string
          period_month: string
          user_id: string
        }
        Insert: {
          action: string
          count?: number | null
          id?: string
          period_month: string
          user_id: string
        }
        Update: {
          action?: string
          count?: number | null
          id?: string
          period_month?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_usage: {
        Args: { p_action: string; p_period_month: string; p_user_id: string }
        Returns: undefined
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
    Enums: {},
  },
} as const
