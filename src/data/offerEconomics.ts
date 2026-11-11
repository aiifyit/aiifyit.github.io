export const OFFER_SERVICES = {
  standard: {
    fee: 2000,
    label: 'Standard co-management ($2,000 per seat per month fulfillment)',
  },
  executive: {
    fee: 4000,
    label: 'Executive co-management ($4,000 per seat per month fulfillment)',
  },
} as const;

export type OfferService = keyof typeof OFFER_SERVICES;

export interface PartnerMargin {
  fee: number;
  seats: number;
  price: number;
  monthlyDue: number;
  monthlyProfit: number;
  annualProfit: number;
  hasSpread: boolean;
}

export interface MarginView extends PartnerMargin {
  incomplete: boolean;
  showNoSpread: boolean;
  showProfit: boolean;
}

/** Fixed fulfillment fee × seats. Profit is never reported as a positive number when price ≤ fee. */
export function estimatePartnerMargin(input: {
  seats: number;
  pricePerSeat: number;
  service: OfferService;
}): PartnerMargin {
  const fee = OFFER_SERVICES[input.service].fee;
  const seats = Number.isFinite(input.seats) ? Math.max(0, Math.floor(input.seats)) : 0;
  const price = Number.isFinite(input.pricePerSeat) ? input.pricePerSeat : Number.NaN;
  const hasSpread = Number.isFinite(price) && price > fee;
  const monthlyProfit = hasSpread ? (price - fee) * seats : 0;
  return {
    fee,
    seats,
    price,
    monthlyDue: fee * seats,
    monthlyProfit,
    annualProfit: monthlyProfit * 12,
    hasSpread,
  };
}

export function marginView(input: { seats: string; price: string; service: OfferService }): MarginView {
  const incomplete = input.seats.trim() === '' || input.price.trim() === '';
  const estimate = estimatePartnerMargin({
    seats: Number(input.seats),
    pricePerSeat: Number(input.price),
    service: input.service,
  });
  return {
    ...estimate,
    incomplete,
    showNoSpread: !incomplete && !estimate.hasSpread,
    showProfit: !incomplete && estimate.hasSpread,
  };
}

export function formatDollars(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}
