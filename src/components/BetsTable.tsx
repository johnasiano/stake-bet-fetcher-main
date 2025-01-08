import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bet } from "@/types/bet";
import { convertToUSD, formatUSD } from "@/utils/currencyUtils";

interface BetsTableProps {
  bets: Bet[];
  page: number;
  pageSize: number;
  totalBets: number;
  onPageChange: (page: number) => void;
}

export const BetsTable = ({ bets, page, pageSize, totalBets, onPageChange }: BetsTableProps) => {
  if (!Array.isArray(bets) || bets.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No bets available
      </div>
    );
  }

  const totalPages = Math.ceil(totalBets / pageSize);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bet ID</TableHead>
            <TableHead>Amount (Original)</TableHead>
            <TableHead>Amount (USD)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bets.map((bet) => {
            const usdAmount = convertToUSD(bet.bet?.amount || 0, bet.bet?.currency || 'usd');
            
            return (
              <TableRow key={bet.iid}>
                <TableCell className="font-mono">{bet.iid}</TableCell>
                <TableCell>
                  {bet.bet?.amount} {bet.bet?.currency?.toUpperCase()}
                </TableCell>
                <TableCell className="font-medium">
                  {formatUSD(usdAmount)}
                </TableCell>
                <TableCell>
                  <Badge variant={bet.bet?.active ? "default" : "secondary"}>
                    {bet.bet?.status || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {bet.bet?.outcomes?.length > 1 ? "Multibet" : "Single"}
                </TableCell>
                <TableCell className="max-w-md">
                  {bet.bet?.outcomes?.map((outcome, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-semibold">{outcome?.fixture?.name}</span>
                      <span className="text-muted-foreground ml-2">
                        ({outcome?.fixture?.tournament?.name})
                      </span>
                      <span className="text-primary ml-2">@{outcome?.odds}</span>
                    </div>
                  ))}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {totalBets > 0 && (
        <div className="flex justify-center mt-4">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-2 py-1 rounded border bg-background hover:bg-muted disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-1">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-2 py-1 rounded border bg-background hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};