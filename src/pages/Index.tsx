import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { BetsTable } from "@/components/BetsTable";
import { fetchHighRollerBets, saveHighRollerBet, fetchStoredHighRollerBets } from "@/services/stakeApi";
import type { Bet } from "@/types/bet";
import { convertToUSD } from "@/utils/currencyUtils";

const MIN_USD_AMOUNT = 5000;
const POLLING_INTERVAL = 5000; // 5 seconds in milliseconds
const PAGE_SIZE = 10; // Number of bets per page

const Index = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchAndProcessBets = async () => {
    try {
      // Fetch both new and stored bets
      const [newBets, storedBets] = await Promise.all([
        fetchHighRollerBets(),
        fetchStoredHighRollerBets()
      ]);
      
      console.log("Total new bets fetched:", newBets.length);
      console.log("Total stored bets:", storedBets.length);
      
      // Process and save high roller bets
      for (const bet of newBets) {
        console.log("Raw bet data:", JSON.stringify(bet, null, 2));
        const usdAmount = convertToUSD(bet.bet?.amount || 0, bet.bet?.currency || 'usd');
        console.log(`Processing bet ${bet.iid}:
          Amount: ${bet.bet?.amount}
          Currency: ${bet.bet?.currency}
          Status: ${bet.bet?.status}
          USD Amount: ${usdAmount}
          Meets minimum (${MIN_USD_AMOUNT}): ${usdAmount >= MIN_USD_AMOUNT}
        `);
        
        if (usdAmount >= MIN_USD_AMOUNT) {
          console.log(`Saving high roller bet ${bet.iid}: ${usdAmount} USD`);
          await saveHighRollerBet(bet);
        }
      }

      // Combine and filter bets
      const allBets = [...newBets, ...storedBets];
      const uniqueBets = Array.from(new Map(allBets.map(bet => [bet.iid, bet])).values());
      
      const filteredBets = uniqueBets.filter(bet => {
        const usdAmount = convertToUSD(bet.bet?.amount || 0, bet.bet?.currency || 'usd');
        const status = bet.bet?.status?.toLowerCase();
        const isConfirmed = status === 'confirmed' || status === 'confirmedpending';
        const isHighRoller = usdAmount >= MIN_USD_AMOUNT;
        
        console.log(`Filtering bet ${bet.iid}:
          Amount: ${bet.bet?.amount}
          Currency: ${bet.bet?.currency}
          Status: ${status}
          USD Amount: ${usdAmount}
          Is Confirmed: ${isConfirmed}
          Is High Roller: ${isHighRoller}
          Final Result: ${isConfirmed && isHighRoller}
        `);
        
        return isConfirmed && isHighRoller;
      });

      console.log("Filtered high roller bets:", filteredBets.map(bet => ({
        id: bet.iid,
        amount: bet.bet?.amount,
        currency: bet.bet?.currency,
        status: bet.bet?.status,
        usdAmount: convertToUSD(bet.bet?.amount || 0, bet.bet?.currency || 'usd')
      })));
      
      setBets(filteredBets);
      
    } catch (error) {
      console.error("Error fetching bets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch bets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndProcessBets();
    const interval = setInterval(() => {
      console.log("Fetching new bets...");
      fetchAndProcessBets();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Calculate pagination
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedBets = bets.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>High Roller Confirmed Bets (${MIN_USD_AMOUNT}+ USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <BetsTable 
              bets={paginatedBets}
              page={currentPage}
              pageSize={PAGE_SIZE}
              totalBets={bets.length}
              onPageChange={handlePageChange}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;