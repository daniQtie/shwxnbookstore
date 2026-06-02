import type { Courier } from './types';

type CourierInfo = {
  code: Courier;
  label: string;
  trackUrl: (tn: string) => string;
};

// Tracking URL patterns for major PH couriers — opens their official tracking page
export const COURIERS: Record<Exclude<Courier, ''>, CourierInfo> = {
  jt: {
    code: 'jt',
    label: 'J&T Express',
    // Direct deep-link to J&T PH tracking results page
    trackUrl: (tn) => `https://www.jtexpress.ph/track-and-trace?waybillNo=${encodeURIComponent(tn)}&flag=1`,
  },
  lbc: {
    code: 'lbc',
    label: 'LBC Express',
    trackUrl: (tn) => `https://www.lbcexpress.com/track/?tracking_number=${encodeURIComponent(tn)}`,
  },
  flash: {
    code: 'flash',
    label: 'Flash Express',
    trackUrl: (tn) => `https://www.flashexpress.ph/track/?se=${encodeURIComponent(tn)}`,
  },
  ninjavan: {
    code: 'ninjavan',
    label: 'Ninja Van',
    trackUrl: (tn) => `https://www.ninjavan.co/en-ph/tracking?id=${encodeURIComponent(tn)}`,
  },
  jrs: {
    code: 'jrs',
    label: 'JRS Express',
    trackUrl: (tn) => `https://www.jrs-express.com/tracking?tracking_no=${encodeURIComponent(tn)}`,
  },
  other: {
    code: 'other',
    label: 'Other',
    // No specific URL — admin will need to share tracking number manually
    trackUrl: () => '',
  },
};

export const COURIER_OPTIONS = Object.values(COURIERS);

export function getCourierLabel(code?: Courier): string {
  if (!code) return '';
  return COURIERS[code as Exclude<Courier, ''>]?.label ?? '';
}

export function getTrackingUrl(code?: Courier, tn?: string): string {
  if (!code || !tn) return '';
  return COURIERS[code as Exclude<Courier, ''>]?.trackUrl(tn) ?? '';
}

// Universal multi-courier tracker — works for ANY tracking number from ANY courier.
// Useful when the courier-specific URL redirects or fails (e.g., J&T international
// "JT..." numbers vs. PH local 12-digit numbers).
export function getUniversalTrackingUrl(tn?: string): string {
  if (!tn) return '';
  return `https://t.17track.net/en#nums=${encodeURIComponent(tn)}`;
}
