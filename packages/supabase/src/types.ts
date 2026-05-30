// Enum type aliases for convenience
export type LocationType = "commercial" | "industrial" | "residential" | "government" | "data_center" | "tower_site" | "other";
export type LocationStatus = "active" | "inactive" | "planned" | "decommissioned";
export type ProjectType = "deployment" | "survey" | "maintenance" | "inspection" | "upgrade" | "remediation";
export type ProjectStatus = "draft" | "planned" | "active" | "on_hold" | "completed" | "cancelled";
export type Priority = "low" | "medium" | "high" | "critical";
export type ActionType = "survey" | "installation" | "inspection" | "maintenance" | "repair" | "testing" | "documentation" | "other";
export type ActionStatus = "pending" | "scheduled" | "in_progress" | "completed" | "blocked" | "cancelled";
export type AssetType = "cable" | "antenna" | "power_supply" | "solar_panel" | "battery" | "generator" | "server" | "router" | "sensor" | "meter" | "tool" | "vehicle" | "other";
export type AssetStatus = "available" | "deployed" | "in_maintenance" | "retired";
export type AssetCondition = "excellent" | "good" | "fair" | "poor";
export type Criticality = "low" | "medium" | "high" | "critical";
export type EntryOutcome = "successful" | "partial" | "unsuccessful" | "cancelled";

export type CustomFieldType = "text" | "textarea" | "number" | "date" | "boolean" | "select" | "url" | "email";
export type CustomFieldModule = "locations" | "projects" | "actions" | "assets";

export type CustomFieldDefinition = {
  id: string;
  organization_id: string;
  module: CustomFieldModule;
  field_name: string;
  field_label: string;
  field_type: CustomFieldType;
  options: string[] | null;
  required: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type FieldRequirementOverride = {
  id: string;
  organization_id: string;
  module: CustomFieldModule;
  field_name: string;
  required: boolean;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: "admin" | "manager" | "technician" | "viewer";
          avatar_url: string | null;
          organization_id: string | null;
          account_type: "company" | "partner" | "client" | null;
          fox_staff: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          role?: "admin" | "manager" | "technician" | "viewer";
          avatar_url?: string | null;
          organization_id?: string | null;
          account_type?: "company" | "partner" | "client" | null;
          fox_staff?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: "admin" | "manager" | "technician" | "viewer";
          avatar_url?: string | null;
          organization_id?: string | null;
          account_type?: "company" | "partner" | "client" | null;
          fox_staff?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          size: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
          industry: string | null;
          website: string | null;
          description: string | null;
          logo_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          size: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
          industry?: string | null;
          website?: string | null;
          description?: string | null;
          logo_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          size?: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
          industry?: string | null;
          website?: string | null;
          description?: string | null;
          logo_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      partner_requests: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          trade: string;
          status: "pending" | "approved" | "rejected";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          trade: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          trade?: string;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          id: string;
          name: string;
          code: string | null;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          country: string;
          client: string;
          location_type: LocationType;
          status: LocationStatus;
          latitude: number | null;
          longitude: number | null;
          timezone: string;
          region: string | null;
          notes: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          access_instructions: string | null;
          criticality: Criticality;
          tags: string[];
          custom_fields: Record<string, unknown>;
          organization_id: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code?: string | null;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          country?: string;
          client?: string;
          location_type?: LocationType;
          status?: LocationStatus;
          latitude?: number | null;
          longitude?: number | null;
          timezone?: string;
          region?: string | null;
          notes?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          access_instructions?: string | null;
          criticality?: Criticality;
          tags?: string[];
          custom_fields?: Record<string, unknown>;
          organization_id: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string | null;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          country?: string;
          client?: string;
          location_type?: LocationType;
          status?: LocationStatus;
          latitude?: number | null;
          longitude?: number | null;
          timezone?: string;
          region?: string | null;
          notes?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          access_instructions?: string | null;
          criticality?: Criticality;
          tags?: string[];
          custom_fields?: Record<string, unknown>;
          organization_id?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "locations_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "locations_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          code: string | null;
          description: string | null;
          location_id: string;
          project_type: ProjectType;
          status: ProjectStatus;
          priority: Priority;
          start_date: string;
          end_date: string | null;
          actual_start_date: string | null;
          actual_end_date: string | null;
          completion_percentage: number;
          budget: number | null;
          actual_cost: number | null;
          owner_id: string | null;
          tags: string[];
          custom_fields: Record<string, unknown>;
          organization_id: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code?: string | null;
          description?: string | null;
          location_id: string;
          project_type: ProjectType;
          status?: ProjectStatus;
          priority?: Priority;
          start_date: string;
          end_date?: string | null;
          actual_start_date?: string | null;
          actual_end_date?: string | null;
          completion_percentage?: number;
          budget?: number | null;
          actual_cost?: number | null;
          owner_id?: string | null;
          tags?: string[];
          custom_fields?: Record<string, unknown>;
          organization_id: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string | null;
          description?: string | null;
          location_id?: string;
          project_type?: ProjectType;
          status?: ProjectStatus;
          priority?: Priority;
          start_date?: string;
          end_date?: string | null;
          actual_start_date?: string | null;
          actual_end_date?: string | null;
          completion_percentage?: number;
          budget?: number | null;
          actual_cost?: number | null;
          owner_id?: string | null;
          tags?: string[];
          custom_fields?: Record<string, unknown>;
          organization_id?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      actions: {
        Row: {
          id: string;
          name: string;
          code: string | null;
          description: string | null;
          project_id: string;
          location_id: string | null;
          asset_id: string | null;
          action_type: ActionType;
          status: ActionStatus;
          priority: Priority;
          assigned_to: string | null;
          due_date: string | null;
          scheduled_start: string | null;
          scheduled_end: string | null;
          actual_start: string | null;
          actual_end: string | null;
          estimated_duration_min: number | null;
          actual_duration_min: number | null;
          completion_notes: string | null;
          estimated_cost: number | null;
          actual_cost: number | null;
          category: string | null;
          notes: string | null;
          tags: string[];
          custom_fields: Record<string, unknown>;
          organization_id: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code?: string | null;
          description?: string | null;
          project_id: string;
          location_id?: string | null;
          asset_id?: string | null;
          action_type: ActionType;
          status?: ActionStatus;
          priority?: Priority;
          assigned_to?: string | null;
          due_date?: string | null;
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          actual_start?: string | null;
          actual_end?: string | null;
          estimated_duration_min?: number | null;
          actual_duration_min?: number | null;
          completion_notes?: string | null;
          estimated_cost?: number | null;
          actual_cost?: number | null;
          category?: string | null;
          notes?: string | null;
          tags?: string[];
          custom_fields?: Record<string, unknown>;
          organization_id: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string | null;
          description?: string | null;
          project_id?: string;
          location_id?: string | null;
          asset_id?: string | null;
          action_type?: ActionType;
          status?: ActionStatus;
          priority?: Priority;
          assigned_to?: string | null;
          due_date?: string | null;
          scheduled_start?: string | null;
          scheduled_end?: string | null;
          actual_start?: string | null;
          actual_end?: string | null;
          estimated_duration_min?: number | null;
          actual_duration_min?: number | null;
          completion_notes?: string | null;
          estimated_cost?: number | null;
          actual_cost?: number | null;
          category?: string | null;
          notes?: string | null;
          tags?: string[];
          custom_fields?: Record<string, unknown>;
          organization_id?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "actions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "actions_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "actions_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "actions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      invitations: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          name: string | null;
          role: "admin" | "manager" | "technician" | "viewer";
          invited_by: string | null;
          status: "pending" | "accepted" | "revoked";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          email: string;
          name?: string | null;
          role?: "admin" | "manager" | "technician" | "viewer";
          invited_by?: string | null;
          status?: "pending" | "accepted" | "revoked";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          email?: string;
          name?: string | null;
          role?: "admin" | "manager" | "technician" | "viewer";
          invited_by?: string | null;
          status?: "pending" | "accepted" | "revoked";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invitations_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      action_entries: {
        Row: {
          id: string;
          action_id: string;
          technician_id: string;
          visit_number: number;
          scheduled_date: string | null;
          started_at: string | null;
          ended_at: string | null;
          duration_minutes: number | null;
          outcome: EntryOutcome;
          failure_reason: string | null;
          notes: string | null;
          custom_fields: Record<string, unknown>;
          attachments: string[];
          submission_location: Record<string, unknown> | null;
          technician_signature: string | null;
          submitted_at: string | null;
          offline_id: string | null;
          sync_status: "synced" | "pending" | "conflict";
          organization_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          action_id: string;
          technician_id: string;
          visit_number?: number;
          scheduled_date?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          duration_minutes?: number | null;
          outcome?: EntryOutcome;
          failure_reason?: string | null;
          notes?: string | null;
          custom_fields?: Record<string, unknown>;
          attachments?: string[];
          submission_location?: Record<string, unknown> | null;
          technician_signature?: string | null;
          submitted_at?: string | null;
          offline_id?: string | null;
          sync_status?: "synced" | "pending" | "conflict";
          organization_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          action_id?: string;
          technician_id?: string;
          visit_number?: number;
          scheduled_date?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          duration_minutes?: number | null;
          outcome?: EntryOutcome;
          failure_reason?: string | null;
          notes?: string | null;
          custom_fields?: Record<string, unknown>;
          attachments?: string[];
          submission_location?: Record<string, unknown> | null;
          technician_signature?: string | null;
          submitted_at?: string | null;
          offline_id?: string | null;
          sync_status?: "synced" | "pending" | "conflict";
          organization_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "action_entries_action_id_fkey";
            columns: ["action_id"];
            isOneToOne: false;
            referencedRelation: "actions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "action_entries_technician_id_fkey";
            columns: ["technician_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "action_entries_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      assets: {
        Row: {
          id: string;
          name: string;
          asset_tag: string | null;
          asset_type: AssetType;
          serial_number: string;
          status: AssetStatus;
          condition: AssetCondition | null;
          criticality: Criticality;
          location_id: string | null;
          assigned_to: string | null;
          manufacturer: string | null;
          model: string | null;
          description: string | null;
          purchase_date: string | null;
          purchase_cost: number | null;
          install_date: string | null;
          warranty_end: string | null;
          barcode: string | null;
          notes: string | null;
          tags: string[];
          custom_fields: Record<string, unknown>;
          organization_id: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          asset_tag?: string | null;
          asset_type: AssetType;
          serial_number: string;
          status?: AssetStatus;
          condition?: AssetCondition | null;
          criticality?: Criticality;
          location_id?: string | null;
          assigned_to?: string | null;
          manufacturer?: string | null;
          model?: string | null;
          description?: string | null;
          purchase_date?: string | null;
          purchase_cost?: number | null;
          install_date?: string | null;
          warranty_end?: string | null;
          barcode?: string | null;
          notes?: string | null;
          tags?: string[];
          custom_fields?: Record<string, unknown>;
          organization_id: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          asset_tag?: string | null;
          asset_type?: AssetType;
          serial_number?: string;
          status?: AssetStatus;
          condition?: AssetCondition | null;
          criticality?: Criticality;
          location_id?: string | null;
          assigned_to?: string | null;
          manufacturer?: string | null;
          model?: string | null;
          description?: string | null;
          purchase_date?: string | null;
          purchase_cost?: number | null;
          install_date?: string | null;
          warranty_end?: string | null;
          barcode?: string | null;
          notes?: string | null;
          tags?: string[];
          custom_fields?: Record<string, unknown>;
          organization_id?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assets_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assets_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assets_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      field_app_config: {
        Row: {
          id: string;
          organization_id: string;
          action_type_code: string;
          card_fields: { key: string; group: string }[];
          detail_fields: { key: string; group: string }[];
          enabled_modules: Record<string, boolean>;
          display_mode: "cards" | "details";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          action_type_code: string;
          card_fields?: { key: string; group: string }[];
          detail_fields?: { key: string; group: string }[];
          enabled_modules?: Record<string, boolean>;
          display_mode?: "cards" | "details";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          action_type_code?: string;
          card_fields?: { key: string; group: string }[];
          detail_fields?: { key: string; group: string }[];
          enabled_modules?: Record<string, boolean>;
          display_mode?: "cards" | "details";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "field_app_config_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: "admin" | "manager" | "technician" | "viewer";
      account_type: "company" | "partner" | "client";
      org_size: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
      partner_request_status: "pending" | "approved" | "rejected";
      location_type: LocationType;
      location_status: LocationStatus;
      project_type: ProjectType;
      project_status: ProjectStatus;
      priority: Priority;
      action_type: ActionType;
      action_status: ActionStatus;
      asset_type: AssetType;
      asset_status: AssetStatus;
      asset_condition: AssetCondition;
      entry_outcome: EntryOutcome;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type ConfigurableFieldOption = {
  id: string;
  organization_id: string;
  field_key: "client" | "country" | "timezone" | "category" | "location_type" | "location_status" | "criticality" | "project_type" | "project_status" | "priority" | "action_type" | "action_status" | "asset_type" | "asset_status" | "asset_condition";
  label: string;
  code: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type WorkflowStep = {
  id: string;
  organization_id: string;
  client_code: string;
  country_code: string;
  project_type_code: string;
  action_type_code: string;
  default_name: string;
  step_order: number;
  is_required: boolean;
  created_at: string;
  updated_at: string;
};

export type FieldAppConfig = {
  id: string;
  organization_id: string;
  action_type_code: string;
  card_fields: { key: string; group: string }[];
  detail_fields: { key: string; group: string }[];
  enabled_modules: Record<string, boolean>;
  display_mode: "cards" | "details";
  created_at: string;
  updated_at: string;
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type PartnerRequest = Database["public"]["Tables"]["partner_requests"]["Row"];
export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ActionItem = Database["public"]["Tables"]["actions"]["Row"];
export type Asset = Database["public"]["Tables"]["assets"]["Row"];
export type Invitation = Database["public"]["Tables"]["invitations"]["Row"];
export type ActionEntry = Database["public"]["Tables"]["action_entries"]["Row"];
