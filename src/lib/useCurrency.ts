import { useQuery } from '@tanstack/react-query';

// Credit conversion rate (1 USD = 100 Credits)
export const USD_TO_CREDIT_RATE = 100;

// Currency API response type (from fawazahmed0/currency-api)
interface CurrencyApiResponse {
  date: string;
  usd: Record<string, number>;
}

// Hook to fetch and cache exchange rates
export function useCurrency() {
  const { data: ratesData, isLoading, error } = useQuery({
    queryKey: ['fx-rates'],
    queryFn: async (): Promise<CurrencyApiResponse> => {
      const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    refetchOnWindowFocus: false,
  });

  // Convert USD amount to another currency
  const convertFromUSD = (amountUSD: number, targetCurrency: string): number => {
    if (!ratesData || targetCurrency === 'USD') {
      return amountUSD;
    }
    const targetLower = targetCurrency.toLowerCase();
    const rate = ratesData.usd[targetLower];
    if (!rate) {
      console.warn(`Exchange rate not available for ${targetCurrency}, falling back to USD`);
      return amountUSD;
    }
    return amountUSD * rate;
  };

  // Calculate Credits from USD
  const calculateCredits = (amountUSD: number): number => {
    return amountUSD * USD_TO_CREDIT_RATE;
  };

  return {
    ratesData,
    isLoading,
    error,
    convertFromUSD,
    calculateCredits,
    USD_TO_CREDIT_RATE,
  };
}