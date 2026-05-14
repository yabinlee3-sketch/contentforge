/* Usage tracking + Paywall */
const STORAGE_KEY = "cf_usage";
const PRO_KEY = "cf_pro";
export const FREE_LIMIT = 5;

export interface UsageData {
  count: number;
  lastReset: number; // timestamp
}

export function getUsage(): UsageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { count: 0, lastReset: Date.now() };
}

export function incrementUsage(): UsageData {
  const data = getUsage();
  data.count++;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function isPro(): boolean {
  try {
    return localStorage.getItem(PRO_KEY) === "true";
  } catch {
    return false;
  }
}

export function setPro() {
  localStorage.setItem(PRO_KEY, "true");
}

export function remainingFree(): number {
  if (isPro()) return Infinity;
  return Math.max(0, FREE_LIMIT - getUsage().count);
}

export function canGenerate(): boolean {
  return isPro() || getUsage().count < FREE_LIMIT;
}

// LemonSqueezy checkout URL — store needs activation first
// After activation at https://app.lemonsqueezy.com/settings/general/identity
// the checkout URL will be: https://contentforgeapp.lemonsqueezy.com/checkout
export const LEMON_CHECKOUT_URL = "https://contentforgeapp.lemonsqueezy.com/checkout";

export function openCheckout() {
  window.open(LEMON_CHECKOUT_URL, "_blank", "width=600,height=700");
}
