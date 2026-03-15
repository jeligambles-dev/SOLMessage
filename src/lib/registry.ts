/**
 * Wallet registry — tracks all wallets that have been created or imported
 * into SOLMessage. Used to build the public message feed from all users.
 */

const STORAGE_KEY = "solmessage_wallet_registry";

// Seed wallets — always included in the registry
const SEED_WALLETS = [
  "E8dcAQSdx36tCpbe64N8z7qv3oKHNNfSzanDKVEo9KUy",
];

export function getRegisteredWallets(): string[] {
  if (typeof window === "undefined") return SEED_WALLETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored: string[] = raw ? JSON.parse(raw) : [];
    // Merge seed wallets
    const all = [...stored];
    for (const seed of SEED_WALLETS) {
      if (!all.includes(seed)) all.push(seed);
    }
    return all;
  } catch {
    return SEED_WALLETS;
  }
}

export function registerWallet(publicKey: string) {
  const wallets = getRegisteredWallets();
  if (!wallets.includes(publicKey)) {
    wallets.push(publicKey);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
  }
}
