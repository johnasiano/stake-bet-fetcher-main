export interface Bet {
  iid: string;
  bet: {
    active: boolean;
    amount: number;
    currency: string;
    status: string;
    outcomes: Array<{
      odds: number;
      fixture: {
        name: string;
        tournament: {
          name: string;
          category: {
            name: string;
            sport: {
              slug: string;
            };
          };
        };
      };
    }>;
  };
}