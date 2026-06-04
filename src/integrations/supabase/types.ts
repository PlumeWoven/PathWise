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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      course_lessons: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_free_preview: boolean
          position: number
          resources: Json
          section_id: string
          title: string
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_free_preview?: boolean
          position?: number
          resources?: Json
          section_id: string
          title?: string
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_free_preview?: boolean
          position?: number
          resources?: Json
          section_id?: string
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lessons_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sections: {
        Row: {
          course_id: string
          created_at: string
          id: string
          position: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          position?: number
          title?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          certificate_enabled: boolean
          created_at: string
          currency: string
          description: string | null
          difficulty: string | null
          discount_expiry: string | null
          discount_price: number | null
          estimated_weeks: number | null
          file_url: string | null
          hourly_rate: number | null
          id: string
          language: string | null
          learning_outcomes: string[] | null
          level: string | null
          metadata: Json
          prerequisites: string[] | null
          price: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          status: string
          subcategory_tags: string[] | null
          subject: string | null
          subtitle: string | null
          subtitle_url: string | null
          target_audience: string[] | null
          thumbnail_url: string | null
          title: string
          trailer_url: string | null
          tutor_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          certificate_enabled?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          difficulty?: string | null
          discount_expiry?: string | null
          discount_price?: number | null
          estimated_weeks?: number | null
          file_url?: string | null
          hourly_rate?: number | null
          id?: string
          language?: string | null
          learning_outcomes?: string[] | null
          level?: string | null
          metadata?: Json
          prerequisites?: string[] | null
          price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: string
          subcategory_tags?: string[] | null
          subject?: string | null
          subtitle?: string | null
          subtitle_url?: string | null
          target_audience?: string[] | null
          thumbnail_url?: string | null
          title: string
          trailer_url?: string | null
          tutor_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          certificate_enabled?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          difficulty?: string | null
          discount_expiry?: string | null
          discount_price?: number | null
          estimated_weeks?: number | null
          file_url?: string | null
          hourly_rate?: number | null
          id?: string
          language?: string | null
          learning_outcomes?: string[] | null
          level?: string | null
          metadata?: Json
          prerequisites?: string[] | null
          price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: string
          subcategory_tags?: string[] | null
          subject?: string | null
          subtitle?: string | null
          subtitle_url?: string | null
          target_audience?: string[] | null
          thumbnail_url?: string | null
          title?: string
          trailer_url?: string | null
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_results: {
        Row: {
          created_at: string
          goal: string
          id: string
          level: string
          score: number
          subject: string
          user_id: string | null
          wrong_topics: string[] | null
          xp_earned: number
        }
        Insert: {
          created_at?: string
          goal: string
          id?: string
          level: string
          score: number
          subject: string
          user_id?: string | null
          wrong_topics?: string[] | null
          xp_earned: number
        }
        Update: {
          created_at?: string
          goal?: string
          id?: string
          level?: string
          score?: number
          subject?: string
          user_id?: string | null
          wrong_topics?: string[] | null
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_events: {
        Row: {
          created_at: string
          id: string
          stage: string
          student_id: string | null
          tutor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          stage: string
          student_id?: string | null
          tutor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          stage?: string
          student_id?: string | null
          tutor_id?: string
        }
        Relationships: []
      }
      message_threads: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          student_id: string
          tutor_id: string
          tutor_response_minutes: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          student_id: string
          tutor_id: string
          tutor_response_minutes?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          student_id?: string
          tutor_id?: string
          tutor_response_minutes?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          id: string
          tutor_id: string
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          tutor_id: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          tutor_id?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          buffer_minutes: number | null
          cover_image_url: string | null
          created_at: string
          credentials: Json
          display_name: string | null
          education_level: string | null
          first_session_free: boolean | null
          free_discovery_call: boolean | null
          full_name: string | null
          grade: number | null
          headline: string | null
          hourly_rate: number | null
          id: string
          instant_bookings: boolean | null
          institution: string | null
          languages: Json
          media_mentions: Json
          min_advance_hours: number
          onboarding_completed: boolean
          onboarding_step: number | null
          role: string
          specializations: string[] | null
          subject_proficiency: Json | null
          subject_specialties: string[] | null
          superpowers: string[] | null
          timezone: string | null
          verification_status: string
          video_intro_url: string | null
          video_thumbnail_url: string | null
          work_experience: Json
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          buffer_minutes?: number | null
          cover_image_url?: string | null
          created_at?: string
          credentials?: Json
          display_name?: string | null
          education_level?: string | null
          first_session_free?: boolean | null
          free_discovery_call?: boolean | null
          full_name?: string | null
          grade?: number | null
          headline?: string | null
          hourly_rate?: number | null
          id: string
          instant_bookings?: boolean | null
          institution?: string | null
          languages?: Json
          media_mentions?: Json
          min_advance_hours?: number
          onboarding_completed?: boolean
          onboarding_step?: number | null
          role: string
          specializations?: string[] | null
          subject_proficiency?: Json | null
          subject_specialties?: string[] | null
          superpowers?: string[] | null
          timezone?: string | null
          verification_status?: string
          video_intro_url?: string | null
          video_thumbnail_url?: string | null
          work_experience?: Json
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          buffer_minutes?: number | null
          cover_image_url?: string | null
          created_at?: string
          credentials?: Json
          display_name?: string | null
          education_level?: string | null
          first_session_free?: boolean | null
          free_discovery_call?: boolean | null
          full_name?: string | null
          grade?: number | null
          headline?: string | null
          hourly_rate?: number | null
          id?: string
          instant_bookings?: boolean | null
          institution?: string | null
          languages?: Json
          media_mentions?: Json
          min_advance_hours?: number
          onboarding_completed?: boolean
          onboarding_step?: number | null
          role?: string
          specializations?: string[] | null
          subject_proficiency?: Json | null
          subject_specialties?: string[] | null
          superpowers?: string[] | null
          timezone?: string | null
          verification_status?: string
          video_intro_url?: string | null
          video_thumbnail_url?: string | null
          work_experience?: Json
          years_experience?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          rating: number | null
          student_id: string | null
          tutor_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          student_id?: string | null
          tutor_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          student_id?: string | null
          tutor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_stages: {
        Row: {
          completed_at: string | null
          id: string
          roadmap_id: string
          skills: string[] | null
          stage_number: number
          status: string
          title: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          roadmap_id: string
          skills?: string[] | null
          stage_number: number
          status?: string
          title: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          roadmap_id?: string
          skills?: string[] | null
          stage_number?: number
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_stages_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmaps: {
        Row: {
          created_at: string
          current_stage: number
          diagnostic_id: string | null
          goal: string | null
          id: string
          subject: string | null
          total_stages: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_stage?: number
          diagnostic_id?: string | null
          goal?: string | null
          id?: string
          subject?: string | null
          total_stages?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_stage?: number
          diagnostic_id?: string | null
          goal?: string | null
          id?: string
          subject?: string | null
          total_stages?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roadmaps_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmaps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_state_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["session_status"] | null
          id: string
          reason: string | null
          session_id: string
          to_status: Database["public"]["Enums"]["session_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["session_status"] | null
          id?: string
          reason?: string | null
          session_id: string
          to_status: Database["public"]["Enums"]["session_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["session_status"] | null
          id?: string
          reason?: string | null
          session_id?: string
          to_status?: Database["public"]["Enums"]["session_status"]
        }
        Relationships: []
      }
      sessions: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          amount: number | null
          cancellation_reason: string | null
          cancelled_by: string | null
          course_id: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          meeting_url: string | null
          notes: string | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["session_payment_status"]
          rating: number | null
          recurrence_group_id: string | null
          recurrence_index: number | null
          refund_status: string | null
          review_reminder_sent: boolean
          scheduled_at: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          session_type: string | null
          stage_id: string | null
          status_v2: Database["public"]["Enums"]["session_status"]
          student_id: string | null
          subject: string | null
          timezone: string | null
          tutor_id: string | null
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          amount?: number | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          course_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["session_payment_status"]
          rating?: number | null
          recurrence_group_id?: string | null
          recurrence_index?: number | null
          refund_status?: string | null
          review_reminder_sent?: boolean
          scheduled_at?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          session_type?: string | null
          stage_id?: string | null
          status_v2?: Database["public"]["Enums"]["session_status"]
          student_id?: string | null
          subject?: string | null
          timezone?: string | null
          tutor_id?: string | null
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          amount?: number | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          course_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["session_payment_status"]
          rating?: number | null
          recurrence_group_id?: string | null
          recurrence_index?: number | null
          refund_status?: string | null
          review_reminder_sent?: boolean
          scheduled_at?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          session_type?: string | null
          stage_id?: string | null
          status_v2?: Database["public"]["Enums"]["session_status"]
          student_id?: string | null
          subject?: string | null
          timezone?: string | null
          tutor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "roadmap_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      tutor_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_hour: number
          id: string
          is_blocked: boolean
          start_hour: number
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_hour: number
          id?: string
          is_blocked?: boolean
          start_hour: number
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_hour?: number
          id?: string
          is_blocked?: boolean
          start_hour?: number
          user_id?: string
        }
        Relationships: []
      }
      tutor_earnings: {
        Row: {
          amount: number
          created_at: string
          earned_at: string
          id: string
          session_id: string | null
          status: string
          student_id: string | null
          tutor_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          earned_at?: string
          id?: string
          session_id?: string | null
          status?: string
          student_id?: string | null
          tutor_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          earned_at?: string
          id?: string
          session_id?: string | null
          status?: string
          student_id?: string | null
          tutor_id?: string
        }
        Relationships: []
      }
      tutor_packages: {
        Row: {
          created_at: string
          discount_percent: number
          enabled: boolean
          id: string
          sessions: number
          user_id: string
        }
        Insert: {
          created_at?: string
          discount_percent?: number
          enabled?: boolean
          id?: string
          sessions: number
          user_id: string
        }
        Update: {
          created_at?: string
          discount_percent?: number
          enabled?: boolean
          id?: string
          sessions?: number
          user_id?: string
        }
        Relationships: []
      }
      tutor_students: {
        Row: {
          assigned_at: string
          student_id: string
          tutor_id: string
        }
        Insert: {
          assigned_at?: string
          student_id: string
          tutor_id: string
        }
        Update: {
          assigned_at?: string
          student_id?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_students_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_profiles: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          created_at: string
          experience_level: string | null
          frequency: string | null
          goal: string | null
          id: string
          learning_style: string | null
          multi_subject: boolean | null
          pace: number | null
          subject: string | null
          time_of_day: string | null
          traits: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          experience_level?: string | null
          frequency?: string | null
          goal?: string | null
          id?: string
          learning_style?: string | null
          multi_subject?: boolean | null
          pace?: number | null
          subject?: string | null
          time_of_day?: string | null
          traits?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          experience_level?: string | null
          frequency?: string | null
          goal?: string | null
          id?: string
          learning_style?: string | null
          multi_subject?: boolean | null
          pace?: number | null
          subject?: string | null
          time_of_day?: string | null
          traits?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          completed_at: string | null
          id: string
          id_document_path: string | null
          notes: string | null
          selfie_path: string | null
          status: string
          submitted_at: string
          type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          id_document_path?: string | null
          notes?: string | null
          selfie_path?: string | null
          status?: string
          submitted_at?: string
          type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          id_document_path?: string | null
          notes?: string | null
          selfie_path?: string | null
          status?: string
          submitted_at?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      book_session: {
        Args: {
          p_amount: number
          p_duration_minutes: number
          p_meeting_url: string
          p_recurrence_group_id?: string
          p_recurrence_index?: number
          p_scheduled_end: string
          p_scheduled_start: string
          p_session_type: string
          p_timezone: string
          p_tutor_id: string
        }
        Returns: string
      }
      get_user_role: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      session_payment_status:
        | "unpaid"
        | "pending"
        | "paid"
        | "refunded"
        | "failed"
      session_status:
        | "scheduled"
        | "confirmed"
        | "reminder_sent"
        | "in_progress"
        | "completed"
        | "awaiting_review"
        | "closed"
        | "cancelled"
        | "disputed"
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
      session_payment_status: [
        "unpaid",
        "pending",
        "paid",
        "refunded",
        "failed",
      ],
      session_status: [
        "scheduled",
        "confirmed",
        "reminder_sent",
        "in_progress",
        "completed",
        "awaiting_review",
        "closed",
        "cancelled",
        "disputed",
      ],
    },
  },
} as const
