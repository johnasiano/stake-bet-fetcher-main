import { Json } from "@/integrations/supabase/types";

export interface HighRollerBet {
  id: string;
  bet_id: string;
  amount: number;
  currency: string;
  status: string | null;
  bet_data: Json;
  created_at: string;
}

export interface HighRollerBetInsert {
  bet_id: string;
  amount: number;
  currency: string;
  status?: string | null;
  bet_data: Json;
}