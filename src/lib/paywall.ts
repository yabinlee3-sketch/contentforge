/* Usage tracking + Paywall — Client-side + Server-verified */
const STORAGE_KEY = 'cf_usage';
const PRO_KEY = 'cf_pro_data';
const TOKEN_KEY = 'cf_pro_token';
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
        clearProData();
        return { active: false, expiresAt: 0 };
      }
      return data;
    }
  } catch {}
  return { active: false, expiresAt: 0 };
}

function clearProData() {
  localStorage.removeItem(PRO_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

function saveProDataLocally() {
  localStorage.setItem(PRO_KEY, JSON.stringify({
    active: true,
    expiresAt: Date.now() + PRO_DURATION_MS,
  }));
}

// ===== Server-verified Pro flow =====

/** After checkout success, call server to get a signed token */
export async function claimPro(checkoutData?: any): Promise<boolean> {
  // If we have checkout event data, try to get a server-signed token
  if (checkoutData?.customerEmail || checkoutData?.orderId) {
    try {
      const res = await fetch('/api/claim-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: checkoutData.customerEmail,
          orderId: checkoutData.orderId,
          variantId: checkoutData.variantId,
        }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        saveProDataLocally();
        return true;
      }
    } catch {}
  }

  // Fallback: save local-only (server might not have webhook secret configured yet)
  saveProDataLocally();
  return false;
}

/** Verify pro status with the server using the stored token */
export async function verifyProOnServer(): Promise<boolean> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return getProData().active;

  try {
    const res = await fetch('/api/check-pro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!data.active) {
      clearProData();
      return false;
    }
    return true;
  } catch {
    // Server offline — fall back to local check
    return getProData().active;
  }
}

// ===== Legacy synchronous API (for UI rendering) =====

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

// ===== LemonSqueezy Checkout =====

export const LEMON_CHECKOUT_URL = 'https://contentforgeapp.lemonsqueezy.com/checkout/buy/fa7219f8-7fc4-4967-8d57-594de1e6aa59';

let listenerInitialized = false;

export function initCheckoutListener() {
  if (listenerInitialized) return;
  listenerInitialized = true;
  window.addEventListener('message', async (event) => {
    if (event.origin === 'https://app.lemonsqueezy.com' || event.origin === 'https://contentforgeapp.lemonsqueezy.com') {
      if (event.data?.event === 'checkout.success') {
        // Server-verify: try to get a signed token with the checkout data
        await claimPro(event.data?.data);
        window.dispatchEvent(new CustomEvent('cf-pro-activated'));
      }
    }
  });
}

export function openCheckout() {
  initCheckoutListener();
  window.open(LEMON_CHECKOUT_URL, '_blank', 'width=600,height=700');
}

export function checkRecentPurchase() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('checkout') === 'success') {
    saveProDataLocally();
    window.history.replaceState({}, '', window.location.pathname);
    window.dispatchEvent(new CustomEvent('cf-pro-activated'));
  }
}
