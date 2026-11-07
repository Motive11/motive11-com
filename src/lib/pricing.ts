// A second copy of the operator prices, on purpose (Mark, November 6, 2026): the same numbers live in
// the markszymanski.co repo at src/lib/pricing.ts. Change both in the same task until the operator
// offers leave markszymanski.co, then this becomes the only copy.
export const pricing = {
  onboardingDay: {
    rate: 3500,
  },
  website: {
    small: 5000,
    established: 10000,
    care: 99,
  },
  build: {
    from: 10000,
  },
  fractional: {
    monthly: "5,000",
    earlyMonthly: "4,000",
    earlySpots: 2,
    totalSpots: 6,
    earlySpotsLeft: 2,
  },
} as const;

export const usd = (n: number | string) => `$${Number(String(n).replace(/,/g, "")).toLocaleString("en-US")}`;
