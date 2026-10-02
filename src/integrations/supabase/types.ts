export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      applications: {
        Row: {
          created_at: string;
          id: string;
          job_id: string;
          match_percent: number;
          notes: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          job_id: string;
          match_percent?: number;
          notes?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          job_id?: string;
          match_percent?: number;
          notes?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      jobs: {
        Row: {
          apply_url: string;
          city: string;
          company: string;
          company_rating: number;
          created_at: string;
          description: string | null;
          duration_months: number | null;
          experience_max: number;
          experience_min: number;
          fresher_friendly: boolean;
          id: string;
          job_type: string;
          posted_at: string;
          required_skills: string[];
          salary_max: number;
          salary_min: number;
          source: string;
          state: string;
          stipend_max: number;
          stipend_min: number;
          title: string;
          work_mode: string;
        };
        Insert: {
          apply_url: string;
          city: string;
          company: string;
          company_rating?: number;
          created_at?: string;
          description?: string | null;
          duration_months?: number | null;
          experience_max?: number;
          experience_min?: number;
          fresher_friendly?: boolean;
          id?: string;
          job_type?: string;
          posted_at?: string;
          required_skills?: string[];
          salary_max?: number;
          salary_min?: number;
          source?: string;
          state: string;
          stipend_max?: number;
          stipend_min?: number;
          title: string;
          work_mode?: string;
        };
        Update: {
          apply_url?: string;
          city?: string;
          company?: string;
          company_rating?: number;
          created_at?: string;
          description?: string | null;
          duration_months?: number | null;
          experience_max?: number;
          experience_min?: number;
          fresher_friendly?: boolean;
          id?: string;
          job_type?: string;
          posted_at?: string;
          required_skills?: string[];
          salary_max?: number;
          salary_min?: number;
          source?: string;
          state?: string;
          stipend_max?: number;
          stipend_min?: number;
          title?: string;
          work_mode?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      resumes: {
        Row: {
          ats_score: number;
          certifications: Json;
          created_at: string;
          education: Json;
          email: string | null;
          experience: Json;
          file_name: string;
          full_name: string | null;
          id: string;
          missing_skills: string[];
          phone: string | null;
          predicted_roles: Json;
          projects: Json;
          raw_text: string;
          resume_score: number;
          salary_prediction: Json;
          skills: string[];
          strengths: string[];
          suggestions: string[];
          summary: string | null;
          total_experience_years: number;
          updated_at: string;
          user_id: string;
          weaknesses: string[];
        };
        Insert: {
          ats_score?: number;
          certifications?: Json;
          created_at?: string;
          education?: Json;
          email?: string | null;
          experience?: Json;
          file_name: string;
          full_name?: string | null;
          id?: string;
          missing_skills?: string[];
          phone?: string | null;
          predicted_roles?: Json;
          projects?: Json;
          raw_text: string;
          resume_score?: number;
          salary_prediction?: Json;
          skills?: string[];
          strengths?: string[];
          suggestions?: string[];
          summary?: string | null;
          total_experience_years?: number;
          updated_at?: string;
          user_id: string;
          weaknesses?: string[];
        };
        Update: {
          ats_score?: number;
          certifications?: Json;
          created_at?: string;
          education?: Json;
          email?: string | null;
          experience?: Json;
          file_name?: string;
          full_name?: string | null;
          id?: string;
          missing_skills?: string[];
          phone?: string | null;
          predicted_roles?: Json;
          projects?: Json;
          raw_text?: string;
          resume_score?: number;
          salary_prediction?: Json;
          skills?: string[];
          strengths?: string[];
          suggestions?: string[];
          summary?: string | null;
          total_experience_years?: number;
          updated_at?: string;
          user_id?: string;
          weaknesses?: string[];
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
