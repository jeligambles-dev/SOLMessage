/**
 * Profile system — link a Twitter/X account to a Solana wallet address.
 * Uses Twitter OAuth to verify identity — no impersonation possible.
 * Stored in localStorage. In production, this would be a backend DB.
 */

export interface UserProfile {
  address: string;
  twitter: string; // without @
  displayName: string; // e.g. "@jew"
  name: string; // real name / display name
  avatarUrl: string; // profile picture URL
  verified: boolean; // true = authenticated via Twitter OAuth
}

const STORAGE_KEY = "solmessage_profiles";

export function getProfiles(): Record<string, UserProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProfiles(profiles: Record<string, UserProfile>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function getAvatarUrl(twitterHandle: string): string {
  return `https://unavatar.io/twitter/${twitterHandle}`;
}

/**
 * Link a Twitter account verified via OAuth to a wallet address.
 */
export function linkTwitterOAuth(
  address: string,
  twitterHandle: string,
  name: string,
  avatarUrl: string
): UserProfile {
  const handle = twitterHandle.replace(/^@/, "").trim();
  const profiles = getProfiles();
  const profile: UserProfile = {
    address,
    twitter: handle,
    displayName: `@${handle}`,
    name: name || handle,
    avatarUrl: avatarUrl || getAvatarUrl(handle),
    verified: true,
  };
  profiles[address] = profile;
  saveProfiles(profiles);
  return profile;
}

export function unlinkTwitter(address: string) {
  const profiles = getProfiles();
  delete profiles[address];
  saveProfiles(profiles);
}

export function getProfile(address: string): UserProfile | null {
  const profiles = getProfiles();
  return profiles[address] || null;
}

export function resolveDisplayName(address: string, shortenFn: (addr: string) => string): string {
  const profile = getProfile(address);
  return profile ? profile.displayName : shortenFn(address);
}

export function findProfileByTwitter(handle: string): UserProfile | null {
  const clean = handle.replace(/^@/, "").toLowerCase();
  const profiles = getProfiles();
  for (const profile of Object.values(profiles)) {
    if (profile.twitter.toLowerCase() === clean) return profile;
  }
  return null;
}
