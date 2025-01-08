// Approximate exchange rates as of a recent date
const EXCHANGE_RATES = {
  btc: 66000,    // Bitcoin to USD (approximate)
  eth: 3500,     // Ethereum to USD
  usdt: 1,       // Tether to USD
  USDT: 1,       // Adding uppercase USDT to handle both cases
  usdc: 1,       // USD Coin to USD
  ltc: 65.82,    // Litecoin to USD
  doge: 0.15,    // Dogecoin to USD
  bnb: 460,      // Binance Coin to USD
  xrp: 0.58,     // Ripple to USD
  trx: 0.12,     // TRON to USD
  bch: 320,      // Bitcoin Cash to USD
  matic: 0.85,   // Polygon/MATIC to USD
  shib: 0.00002, // Shiba Inu to USD
  dot: 7.20,     // Polkadot to USD
  dai: 1,        // DAI to USD (stablecoin)
  busd: 1,       // Binance USD (stablecoin)
  usd: 1,        // US Dollar
  inr: 0.012,    // Indian Rupee to USD
  ars: 0.0012,   // Argentine Peso to USD
  sol: 175.50,   // Solana to USD
  cad: 0.74,     // Canadian Dollar to USD
  ngn: 0.00067,  // Nigerian Naira to USD
};

export const convertToUSD = (amount: number, currency: string): number => {
  // Try exact match first
  let rate = EXCHANGE_RATES[currency];
  
  // If no exact match, try lowercase
  if (rate === undefined) {
    rate = EXCHANGE_RATES[currency.toLowerCase()];
  }
  
  // If still no match, default to 0
  rate = rate || 0;
  
  const convertedAmount = amount * rate;
  console.log(`Converting ${amount} ${currency} to USD: ${convertedAmount} (rate: ${rate})`);
  return convertedAmount;
};

export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};