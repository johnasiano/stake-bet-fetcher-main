import { Json } from "@/integrations/supabase/types";

/**
 * Represents a high roller bet as stored in the database
 * @property amount - The bet amount in USD (numeric in database)
 * @property bet_id - Unique identifier for the bet
 * @property currency - The currency code (e.g., 'usdt', 'eth')
 * @property status - Current status of the bet
 * @property bet_data - Complete bet data stored as JSON
 * @property created_at - Timestamp when the bet was created
 */
export interface HighRollerBet {
  id: string;
  bet_id: string;
  amount: number;  // Must be number as per database schema
  currency: string;
  status: string | null;
  bet_data: Json;
  created_at: string;
}

/**
 * Type for inserting a new high roller bet
 * Excludes auto-generated fields (id, created_at)
 */
export interface HighRollerBetInsert {
  bet_id: string;
  amount: number;  // Must be number for calculations and DB storage
  currency: string;
  status?: string | null;
  bet_data: Json;
}