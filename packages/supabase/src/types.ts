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
          account_type: "company" | "partner" | null;
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
          account_type?: "company" | "partner" | null;
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
          account_type?: "company" | "partner" | null;
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: "admin" | "manager" | "technician" | "viewer";
      account_type: "company" | "partner";
      org_size: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
      partner_request_status: "pending" | "approved" | "rejected";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type PartnerRequest = Database["public"]["Tables"]["partner_requests"]["Row"];
