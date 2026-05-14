/* Usage tracking + Paywall */
const STORAGE_KEY = 'cf_usage';
const PRO_KEY = 'cf_pro_data';
export const FREE_LIMIT = 5;
const PRO_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface UsageData {
  count: number;
  lastReset: number;
}

interface ProData {
  active: boolean;
  expiresAt: number;
}

function getProData(): ProData {
  try {
    const raw = localStorage.getItem(PRO_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.expiresAt && Date.now() > data.expiresAt) {
        localStorage.removeItem(PRO_KEY);
        return { active: false, expiresAt: 0 };
      }
      return data;
    }
  } catch {}
  return { active: false, expiresAt: 0 };
}

function saveProData() {
  localStorage.setItem(PRO_KEY, JSON.stringify({
    active: true,
    expiresAt: Date.now() + PRO_DURATION_MS,
  }));
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
  return getProData().active;
}

export function remainingFree(): number {
  if (isPro()) return Infinity;
  return Math.max(0, FREE_LIMIT - getUsage().count);
}

export function canGenerate(): boolean {
  return isPro() || getUsage().count < FREE_LIMIT;
}

export function getExpiryDate(): string | null {
  const data = getProData();
  if (!data.active || !data.expiresAt) return null;
  return new Date(data.expiresAt).toISOString().split('T')[0];
}

// LemonSqueezy checkout URL
export const LEMON_CHECKOUT_URL = 'https://contentforgeapp.lemonsqueezy.com/checkout/buy/fa7219f8-7fc4-4967-8d57-594de1e6aa59';

// Listen for LemonSqueezy checkout success via postMessage
let listenerInitialized = false;

export function initCheckoutListener() {
  if (listenerInitialized) return;
  listenerInitialized = true;
  window.addEventListener('message', (event) => {
    if (event.origin === 'https://app.lemonsqueezy.com' || event.origin === 'https://contentforgeapp.lemonsqueezy.com') {
      if (event.data?.event === 'checkout.success') {
        saveProData();
        window.dispatchEvent(new CustomEvent('cf-pro-activated'));
      }
    }
  });
}

export function openCheckout() {
  initCheckoutListener();
  window.open(LEMON_CHECKOUT_URL, '_blank', 'width=600,height=700');
}

// Check if just returned from a successful checkout
export function checkRecentPurchase() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('checkout') === 'success') {
    saveProData();
    window.history.replaceState({}, '', window.location.pathname);
    window.dispatchEvent(new CustomEvent('cf-pro-activated'));
  }
}
