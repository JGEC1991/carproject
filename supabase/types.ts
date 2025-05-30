export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string | null;
          attachments: string[] | null;
          created_at: string;
          date: string | null;
          description: string | null;
          driver_id: string | null;
          id: string;
          vehicle_id: string | null;
          amount: number | null; // Added amount field
          status: Database["public"]["Enums"]["payment_status"] | null; // Added status field
        };
        Insert: {
          activity_type?: string | null;
          attachments?: string[] | null;
          created_at?: string;
          date?: string | null;
          description?: string | null;
          driver_id?: string | null;
          id?: string;
          vehicle_id?: string | null;
          amount?: number | null; // Added amount field
          status?: Database["public"]["Enums"]["payment_status"] | null; // Added status field
        };
        Update: {
          activity_type?: string | null;
          attachments?: string[] | null;
          created_at?: string;
          date?: string | null;
          description?: string | null;
          driver_id?: string | null;
          id?: string;
          vehicle_id?: string | null;
          amount?: number | null; // Added amount field
          status?: Database["public"]["Enums"]["payment_status"] | null; // Added status field
        };
        Relationships: [
          {
            foreignKeyName: "activities_driver_id_fkey";
            columns: ["driver_id"];
            isOne: true;
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOne: true;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          }
        ];
      };
      drivers: {
        Row: {
          address: string | null;
          created_at: string;
          criminal_records_photo: string | null;
          drivers_license_expiry: string | null;
          drivers_license_photo: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          police_records_photo: string | null;
          profile_photo: string | null;
          vehicle_id: string | null; // Added vehicle_id
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          criminal_records_photo?: string | null;
          drivers_license_expiry?: string | null;
          drivers_license_photo?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          police_records_photo?: string | null;
          profile_photo?: string | null;
          vehicle_id?: string | null; // Added vehicle_id
        };
        Update: {
          address?: string | null;
          created_at?: string;
          criminal_records_photo?: string | null;
          drivers_license_expiry?: string | null;
          drivers_license_photo?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          police_records_photo?: string | null;
          profile_photo?: string | null;
          vehicle_id?: string | null; // Added vehicle_id
        };
        Relationships: [
          {
            foreignKeyName: "drivers_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOne: true;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          }
        ];
      };
      expenses: {
        Row: {
          activity_id: string | null;
          amount: number | null;
          category: string | null;
          created_at: string;
          date: string | null;
          description: string | null;
          driver_id: string | null;
          id: string;
          status: Database["public"]["Enums"]["payment_status"] | null;
          vehicle_id: string | null;
        };
        Insert: {
          activity_id?: string | null;
          amount?: number | null;
          category?: string | null;
          created_at?: string;
          date?: string | null;
          description?: string | null;
          driver_id?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["payment_status"] | null;
          vehicle_id?: string | null;
        };
        Update: {
          activity_id?: string | null;
          amount?: number | null;
          category?: string | null;
          created_at: string;
          date?: string | null;
          description?: string | null;
          driver_id?: string | null;
          id?: string;
          status: Database["public"]["Enums"]["payment_status"] | null;
          vehicle_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_activity_id_fkey";
            columns: ["activity_id"];
            isOne: true;
            referencedRelation: "activities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_driver_id_fkey";
            columns: ["driver_id"];
            isOne: true;
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOne: true;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          }
        ];
      };
      frameworks: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          likes: number;
          logo: string;
          name: string;
          url: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          likes?: number;
          logo: string;
          name: string;
          url: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          likes?: number;
          logo?: string;
          name?: string;
          url?: string;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          token: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          token?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          token?: string | null;
        };
        Relationships: [];
      };
      revenue: {
        Row: {
          amount: number | null;
          created_at: string;
          date: string | null;
          description: string | null;
          driver_id: string | null;
          id: string;
          status: Database["public"]["Enums"]["payment_status"] | null;
          vehicle_id: string | null;
        };
        Insert: {
          amount?: number | null;
          created_at?: string;
          date?: string | null;
          description?: string | null;
          driver_id?: string | null;
          id?: string;
          status?: Database["public"]["Enums"]["payment_status"] | null;
          vehicle_id?: string | null;
        };
        Update: {
          amount?: number | null;
          created_at: string;
          date?: string | null;
          description?: string | null;
          driver_id?: string | null;
          id?: string;
          status: Database["public"]["Enums"]["payment_status"] | null;
          vehicle_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "revenue_driver_id_fkey";
            columns: ["driver_id"];
            isOne: true;
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "revenue_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOne: true;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          email: string | null;
          id: string;
          organization_id: string | null;
          password: string | null;
          role: string | null;
        };
        Insert: {
          email?: string | null;
          id: string;
          organization_id?: string | null;
          password?: string | null;
          role?: string | null;
        };
        Update: {
          email?: string | null;
          id?: string;
          organization_id?: string | null;
          password?: string | null;
          role?: string | null;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          car_ownership: string | null;
          car_payment_day: number | null;
          color: string | null;
          created_at: string;
          dashboard_image_url: string | null;
          deposit: number | null;
          driver_id: string | null;
          front_image_url: string | null;
          fuel_type: string | null;
          gps: boolean | null;
          id: string;
          insurance_policy_number: string | null;
          insurance_provider: string | null;
          license_plate: string | null;
          left_image_url: string | null;
          make: string | null;
          mileage: number | null;
          model: string | null;
          observations: string | null;
          organization_id: string | null;
          rear_image_url: string | null;
          registration_expiry_date: string | null;
          right_image_url: string | null;
          status: string | null;
          transmission_type: string | null;
          vehicle_type: string | null;
          vin: string | null;
          year: number | null;
          front_image_date: string | null;
          rear_image_date: string | null;
          right_image_date: string | null;
          left_image_date: string | null;
          dashboard_image_date: string | null;
        };
        Insert: {
          car_ownership?: string | null;
          car_payment_day?: number | null;
          color?: string | null;
          created_at?: string;
          dashboard_image_url?: string | null;
          deposit?: number | null;
          driver_id?: string | null;
          front_image_url?: string | null;
          fuel_type?: string | null;
          gps?: boolean | null;
          id?: string;
          insurance_policy_number?: string | null;
          insurance_provider?: string | null;
          license_plate?: string | null;
          left_image_url?: string | null;
          make?: string | null;
          mileage?: number | null;
          model?: string | null;
          observations?: string | null;
          organization_id?: string | null;
          rear_image_url?: string | null;
          registration_expiry_date?: string | null;
          right_image_url?: string | null;
          status?: string | null;
          transmission_type?: string | null;
          vehicle_type?: string | null;
          vin?: string | null;
          year?: number | null;
          front_image_date?: string | null;
          rear_image_date?: string | null;
          right_image_date?: string | null;
          left_image_date?: string | null;
          dashboard_image_date?: string | null;
        };
        Update: {
          car_ownership?: string | null;
          car_payment_day?: number | null;
          color?: string | null;
          created_at?: string;
          dashboard_image_url?: string | null;
          deposit?: number | null;
          driver_id?: string | null;
          front_image_url?: string | null;
          fuel_type?: string | null;
          gps?: boolean | null;
          id?: string;
          insurance_policy_number?: string | null;
          insurance_provider?: string | null;
          license_plate?: string | null;
          left_image_url?: string | null;
          make?: string | null;
          mileage?: number | null;
          model?: string | null;
          observations?: string | null;
          organization_id?: string | null;
          rear_image_url?: string | null;
          registration_expiry_date?: string | null;
          right_image_url?: string | null;
          status?: string | null;
          transmission_type?: string | null;
          vehicle_type?: string | null;
          vin?: string | null;
          year?: number | null;
          front_image_date?: string | null;
          rear_image_date?: string | null;
          right_image_date?: string | null;
          left_image_date?: string | null;
          dashboard_image_date?: string | null;
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
      payment_status: "Canceled" | "Completed" | "Incomplete" | "Past Due" | "Pending";
      vehicle_status: "available" | "in_use" | "maintenance" | "retired";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
          PublicSchema["Views"])
      ? (PublicSchema["Tables"] &
          PublicSchema["Views"])[PublicTableNameOrOptions] extends {
          Row: infer R;
        }
        ? R
        : never
      : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicTableNameOrOptions]
    : never;
