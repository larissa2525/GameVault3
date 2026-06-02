import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          nickname?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nickname?: string | null;
          avatar_url?: string | null;
        };
      };
      jogos: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          plataforma: string;
          genero: string;
          nota: number;
          status: string;
          capa_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          plataforma: string;
          genero: string;
          nota: number;
          status: string;
          capa_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          nome?: string;
          plataforma?: string;
          genero?: string;
          nota?: number;
          status?: string;
          capa_url?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};
