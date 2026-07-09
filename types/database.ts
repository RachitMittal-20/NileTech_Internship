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
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string | null
          created_at: string
          diff: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          diff?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          diff?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          created_at: string
          cycle_id: string
          employee_id: string | null
          error: string | null
          id: string
          recipient_type: Database["public"]["Enums"]["broadcast_recipient_type"]
          sent_at: string | null
          sent_to: string | null
          status: Database["public"]["Enums"]["broadcast_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_id: string
          employee_id?: string | null
          error?: string | null
          id?: string
          recipient_type: Database["public"]["Enums"]["broadcast_recipient_type"]
          sent_at?: string | null
          sent_to?: string | null
          status?: Database["public"]["Enums"]["broadcast_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_id?: string
          employee_id?: string | null
          error?: string | null
          id?: string
          recipient_type?: Database["public"]["Enums"]["broadcast_recipient_type"]
          sent_at?: string | null
          sent_to?: string | null
          status?: Database["public"]["Enums"]["broadcast_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "test_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_employees: {
        Row: {
          created_at: string
          cycle_id: string
          employee_id: string
          status: Database["public"]["Enums"]["cycle_employee_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          cycle_id: string
          employee_id: string
          status?: Database["public"]["Enums"]["cycle_employee_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          cycle_id?: string
          employee_id?: string
          status?: Database["public"]["Enums"]["cycle_employee_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cycle_employees_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "test_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_requests: {
        Row: {
          created_at: string
          employee_scope: Json
          id: string
          notes: string | null
          org_id: string
          requested_dates: Json
          status: Database["public"]["Enums"]["cycle_request_status"]
          test_type_ids: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_scope?: Json
          id?: string
          notes?: string | null
          org_id: string
          requested_dates?: Json
          status?: Database["public"]["Enums"]["cycle_request_status"]
          test_type_ids?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_scope?: Json
          id?: string
          notes?: string | null
          org_id?: string
          requested_dates?: Json
          status?: Database["public"]["Enums"]["cycle_request_status"]
          test_type_ids?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cycle_requests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_test_types: {
        Row: {
          cycle_id: string
          test_type_id: string
        }
        Insert: {
          cycle_id: string
          test_type_id: string
        }
        Update: {
          cycle_id?: string
          test_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cycle_test_types_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "test_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_test_types_test_type_id_fkey"
            columns: ["test_type_id"]
            isOneToOne: false
            referencedRelation: "test_types"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          dob: string | null
          email: string | null
          employee_code: string | null
          full_name: string
          id: string
          org_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dob?: string | null
          email?: string | null
          employee_code?: string | null
          full_name: string
          id?: string
          org_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dob?: string | null
          email?: string | null
          employee_code?: string | null
          full_name?: string
          id?: string
          org_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          org_id: string | null
          read: boolean
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          org_id?: string | null
          read?: boolean
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          org_id?: string | null
          read?: boolean
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          address: string | null
          billing_details: Json
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_type: string | null
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["organisation_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          billing_details?: Json
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_type?: string | null
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["organisation_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          billing_details?: Json
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_type?: string | null
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["organisation_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          org_id: string | null
          role: Database["public"]["Enums"]["profile_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          org_id?: string | null
          role: Database["public"]["Enums"]["profile_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          org_id?: string | null
          role?: Database["public"]["Enums"]["profile_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          classification:
            | Database["public"]["Enums"]["result_classification"]
            | null
          entered_at: string
          entered_by: string | null
          id: string
          lab_pdf_url: string | null
          reviewed: boolean
          sample_id: string
          updated_at: string
          values: Json
        }
        Insert: {
          classification?:
            | Database["public"]["Enums"]["result_classification"]
            | null
          entered_at?: string
          entered_by?: string | null
          id?: string
          lab_pdf_url?: string | null
          reviewed?: boolean
          sample_id: string
          updated_at?: string
          values?: Json
        }
        Update: {
          classification?:
            | Database["public"]["Enums"]["result_classification"]
            | null
          entered_at?: string
          entered_by?: string | null
          id?: string
          lab_pdf_url?: string | null
          reviewed?: boolean
          sample_id?: string
          updated_at?: string
          values?: Json
        }
        Relationships: [
          {
            foreignKeyName: "results_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: true
            referencedRelation: "samples"
            referencedColumns: ["id"]
          },
        ]
      }
      samples: {
        Row: {
          collected_at: string | null
          created_at: string
          cycle_id: string
          employee_id: string
          id: string
          test_type_id: string
          updated_at: string
          vial_reference: string | null
        }
        Insert: {
          collected_at?: string | null
          created_at?: string
          cycle_id: string
          employee_id: string
          id?: string
          test_type_id: string
          updated_at?: string
          vial_reference?: string | null
        }
        Update: {
          collected_at?: string | null
          created_at?: string
          cycle_id?: string
          employee_id?: string
          id?: string
          test_type_id?: string
          updated_at?: string
          vial_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "samples_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "test_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "samples_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "samples_test_type_id_fkey"
            columns: ["test_type_id"]
            isOneToOne: false
            referencedRelation: "test_types"
            referencedColumns: ["id"]
          },
        ]
      }
      test_cycles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          location: string | null
          org_id: string
          scheduled_date: string
          status: Database["public"]["Enums"]["test_cycle_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          org_id: string
          scheduled_date: string
          status?: Database["public"]["Enums"]["test_cycle_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          org_id?: string
          scheduled_date?: string
          status?: Database["public"]["Enums"]["test_cycle_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_cycles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_cycles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      test_types: {
        Row: {
          active: boolean
          classification_rules: Json
          created_at: string
          id: string
          name: string
          result_fields: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          classification_rules?: Json
          created_at?: string
          id?: string
          name: string
          result_fields?: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          classification_rules?: Json
          created_at?: string
          id?: string
          name?: string
          result_fields?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_org_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      broadcast_recipient_type: "org" | "employee"
      broadcast_status: "pending" | "sent" | "failed"
      cycle_employee_status: "expected" | "present" | "absent"
      cycle_request_status: "pending" | "approved" | "rejected" | "scheduled"
      organisation_status: "active" | "archived"
      profile_role: "admin" | "client_admin"
      result_classification: "clear" | "flagged"
      test_cycle_status:
        | "scheduled"
        | "testing"
        | "at_lab"
        | "results_entry"
        | "review"
        | "broadcast"
        | "complete"
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
      broadcast_recipient_type: ["org", "employee"],
      broadcast_status: ["pending", "sent", "failed"],
      cycle_employee_status: ["expected", "present", "absent"],
      cycle_request_status: ["pending", "approved", "rejected", "scheduled"],
      organisation_status: ["active", "archived"],
      profile_role: ["admin", "client_admin"],
      result_classification: ["clear", "flagged"],
      test_cycle_status: [
        "scheduled",
        "testing",
        "at_lab",
        "results_entry",
        "review",
        "broadcast",
        "complete",
      ],
    },
  },
} as const
