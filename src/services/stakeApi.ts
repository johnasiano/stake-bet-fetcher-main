import { supabase } from "@/integrations/supabase/client";
import { Bet } from "@/types/bet";
import { Database } from "@/integrations/supabase/types";
import { convertToUSD } from "@/utils/currencyUtils";

const STAKE_API_HEADERS = {
  "accept": "application/json",
  "content-type": "application/json",
  "x-access-token": "ff8f377ec2895d3430743bc6bb8a12056fedef55a1dcc8f0a0734d0cf1e31c8c4516439c8484e9f02a8452520596f573"
};

const STAKE_API_URL = "https://api.stake.bet/graphql";

export const fetchHighRollerBets = async (limit: number = 100) => {
  console.log("Fetching bets from Stake API...");
  
  try {
    // GraphQL query for recent bets
    const query = `
      query RecentBets($limit: Int!) {
        bets(limit: $limit, offset: 0) {
          id
          amount
          currency
          status
          createdAt
        }
      }
    `;

    const response = await fetch(STAKE_API_URL, {
      method: 'POST',
      headers: STAKE_API_HEADERS,
      body: JSON.stringify({
        query,
        variables: { limit }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorText);
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("API Response:", JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error("GraphQL Errors:", data.errors);
      throw new Error("GraphQL query failed: " + JSON.stringify(data.errors));
    }

    // Transform the data into our Bet type
    const bets: Bet[] = data.data.bets.map((bet: any) => ({
      iid: bet.id,
      bet: {
        active: true,
        amount: parseFloat(bet.amount),
        currency: bet.currency.toLowerCase(),
        status: bet.status.toLowerCase(),
        outcomes: []
      }
    }));

    return bets;
    
  } catch (error) {
    console.error("Error fetching bets:", error);
    throw error;
  }
};

export const saveHighRollerBet = async (bet: Bet) => {
  const usdAmount = convertToUSD(bet.bet?.amount || 0, bet.bet?.currency || 'usd');
  console.log(`Attempting to save bet ${bet.iid} to database...`);
  console.log('Bet data:', JSON.stringify(bet, null, 2));
  console.log('USD Amount:', usdAmount);
  
  try {
    const { data, error } = await supabase
      .from('high_roller_bets')
      .upsert({
        bet_id: bet.iid,
        amount: usdAmount,
        currency: bet.bet?.currency || 'usd',
        status: bet.bet?.status || null,
        bet_data: bet as unknown as Database['public']['Tables']['high_roller_bets']['Insert']['bet_data']
      }, {
        onConflict: 'bet_id'
      });

    if (error) {
      console.error('Error saving high roller bet:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log(`Successfully saved bet ${bet.iid} to database`);
    console.log('Saved data:', data);
    
  } catch (error) {
    console.error('Failed to save bet to database:', error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    throw error;
  }
};

export const fetchStoredHighRollerBets = async (): Promise<Bet[]> => {
  console.log("Fetching stored bets from database...");
  
  const { data, error } = await supabase
    .from('high_roller_bets')
    .select('bet_data')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stored high roller bets:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }

  const bets = data?.map(row => row.bet_data as unknown as Bet) || [];
  console.log(`Retrieved ${bets.length} bets from database`);
  console.log('Sample bet data:', bets.length > 0 ? JSON.stringify(bets[0], null, 2) : 'No bets found');
  
  return bets;
};