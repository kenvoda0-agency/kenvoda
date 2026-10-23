export interface RoiInputs {
  inquiries: number;
  jobValue: number;
  missedCalls: number;
}

export interface RoiResults {
  closeRate: number;
  lostFromMissed: number;
  lostFromSlowLeads: number;
  monthlyLoss: number;
  recovered: number;
  uplift: number;
  extraRevenue: number;
  annualLoss: number;
  annualExtraRevenue: number;
  currentBookings: number;
}

export function calculateRoi(inputs: Partial<RoiInputs>): RoiResults {
  const inquiries = Math.max(50, Math.min(500, Number(inputs.inquiries) || 50));
  const jobValue = Math.max(50, Math.min(1000, Number(inputs.jobValue) || 50));
  const missedCalls = Math.max(1, Math.min(100, Number(inputs.missedCalls) || 1));

  const closeRate = 0.35;
  const lostFromMissed = missedCalls * jobValue * closeRate;
  const lostFromSlowLeads = inquiries * 0.10 * jobValue * closeRate;
  const monthlyLoss = lostFromMissed + lostFromSlowLeads;
  const recovered = monthlyLoss * 0.65;
  const uplift = inquiries * 0.05 * jobValue;
  const extraRevenue = recovered + uplift;
  const annualLoss = monthlyLoss * 12;
  const annualExtraRevenue = extraRevenue * 12;
  const currentBookings = Math.round(inquiries * closeRate);

  return {
    closeRate,
    lostFromMissed,
    lostFromSlowLeads,
    monthlyLoss,
    recovered,
    uplift,
    extraRevenue,
    annualLoss,
    annualExtraRevenue,
    currentBookings,
  };
}

export function calculateCleaningEstimate(
  bedrooms: number,
  bathrooms: number,
  frequency: 'onetime' | 'weekly' | 'biweekly' | 'monthly'
): number {
  const base = 80;
  const bedCost = Math.max(1, Math.min(6, bedrooms)) * 20;
  const bathCost = Math.max(1, Math.min(4, bathrooms)) * 25;
  const subtotal = base + bedCost + bathCost;

  const multipliers: Record<string, number> = {
    onetime: 1.0,
    biweekly: 0.9,
    weekly: 0.85,
    monthly: 1.05,
  };
  const mult = multipliers[frequency] ?? 1.0;
  return Math.round(subtotal * mult);
}
