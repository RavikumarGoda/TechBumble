export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_questions: {
        Row: {
          category: string
          companies: string[] | null
          created_at: string
          description: string
          difficulty: string
          id: string
          is_active: boolean | null
          title: string
        }
        Insert: {
          category: string
          companies?: string[] | null
          created_at?: string
          description: string
          difficulty: string
          id?: string
          is_active?: boolean | null
          title: string
        }
        Update: {
          category?: string
          companies?: string[] | null
          created_at?: string
          description?: string
          difficulty?: string
          id?: string
          is_active?: boolean | null
          title?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          category: string
          challenge_date: string
          created_at: string
          description: string
          id: string
          question_count: number | null
          theme: string
          title: string
          xp_reward: number | null
        }
        Insert: {
          category: string
          challenge_date: string
          created_at?: string
          description: string
          id?: string
          question_count?: number | null
          theme: string
          title: string
          xp_reward?: number | null
        }
        Update: {
          category?: string
          challenge_date?: string
          created_at?: string
          description?: string
          id?: string
          question_count?: number | null
          theme?: string
          title?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          challenge_notifications: boolean | null
          created_at: string
          daily_pack_notifications: boolean | null
          id: string
          streak_reminders: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_notifications?: boolean | null
          created_at?: string
          daily_pack_notifications?: boolean | null
          id?: string
          streak_reminders?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_notifications?: boolean | null
          created_at?: string
          daily_pack_notifications?: boolean | null
          id?: string
          streak_reminders?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          total_questions_swiped: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          total_questions_swiped?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          total_questions_swiped?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh_key: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh_key: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh_key?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_questions: {
        Row: {
          category: string
          companies: string[] | null
          difficulty: string
          id: string
          question_description: string | null
          question_id: string
          question_title: string
          saved_at: string
          user_id: string
        }
        Insert: {
          category: string
          companies?: string[] | null
          difficulty: string
          id?: string
          question_description?: string | null
          question_id: string
          question_title: string
          saved_at?: string
          user_id: string
        }
        Update: {
          category?: string
          companies?: string[] | null
          difficulty?: string
          id?: string
          question_description?: string | null
          question_id?: string
          question_title?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_date: string
          created_at: string
          id: string
          questions_solved: number | null
          questions_swiped: number | null
          user_id: string
        }
        Insert: {
          activity_date?: string
          created_at?: string
          id?: string
          questions_solved?: number | null
          questions_swiped?: number | null
          user_id: string
        }
        Update: {
          activity_date?: string
          created_at?: string
          id?: string
          questions_solved?: number | null
          questions_swiped?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_challenge_completions: {
        Row: {
          challenge_id: string
          completed_at: string | null
          completed_questions: number | null
          created_at: string
          id: string
          total_questions: number
          user_id: string
          xp_gained: number | null
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          completed_questions?: number | null
          created_at?: string
          id?: string
          total_questions: number
          user_id: string
          xp_gained?: number | null
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          completed_questions?: number | null
          created_at?: string
          id?: string
          total_questions?: number
          user_id?: string
          xp_gained?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_daily_challenge: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_activity: {
        Args: {
          p_user_id: string
          p_questions_swiped?: number
          p_questions_solved?: number
        }
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
