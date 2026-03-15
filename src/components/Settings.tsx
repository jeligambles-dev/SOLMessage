"use client";

import { useState, useEffect } from "react";
import { WalletData, shortenAddress, getSolscanAddressUrl } from "@/lib/solana";
import { getProfile, linkTwitterOAuth, unlinkTwitter, UserProfile } from "@/lib/profiles";
import { signIn, signOut, useSession } from "next-auth/react";

interface SettingsProps {
  wallet: WalletData;
  onLogout: () => void;
}

export default function Settings({ wallet, onLogout }: SettingsProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [linkedProfile, setLinkedProfile] = useState<UserProfile | null>(null);

  const { data: session } = useSession();

  // Load existing profile
  useEffect(() => {
    const profile = getProfile(wallet.publicKey);
    if (profile) {
      setLinkedProfile(profile);
    }
  }, [wallet.publicKey]);

  // When user signs in with Twitter, auto-link to wallet
  useEffect(() => {
    if (session?.user && !linkedProfile) {
      const user = session.user as Record<string, unknown>;
      const handle = (user.twitterHandle as string) || (user.name as string) || "";
      const name = (user.twitterName as string) || (user.name as string) || handle;
      const avatar = (user.twitterImage as string) || (user.image as string) || "";

      if (handle) {
        const profile = linkTwitterOAuth(wallet.publicKey, handle, name, avatar);
        setLinkedProfile(profile);
      }
    }
  }, [session, wallet.publicKey, linkedProfile]);

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleUnlink() {
    unlinkTwitter(wallet.publicKey);
    setLinkedProfile(null);
    signOut({ redirect: false });
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Settings</h2>
        <p className="text-[#8a8aa0] text-sm">Manage your wallet and preferences</p>
      </div>

      {/* Wallet Info */}
      <div className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-white mb-4">Wallet</h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#8a8aa0] uppercase tracking-wider">Public Key</label>
            <div className="mt-1 flex items-center gap-2">
              <code
                onClick={() => copyToClipboard(wallet.publicKey, "public")}
                className="flex-1 bg-[#0e0e12] border border-[#2a2a3e] rounded-xl px-4 py-2.5 text-white text-xs font-mono break-all cursor-pointer hover:border-[#ab9ff2] transition-colors"
              >
                {wallet.publicKey}
              </code>
              <button
                onClick={() => copyToClipboard(wallet.publicKey, "public")}
                className="shrink-0 p-2.5 bg-[#0e0e12] border border-[#2a2a3e] rounded-xl hover:border-[#ab9ff2] transition-colors"
              >
                {copied === "public" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14f195" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8aa0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#8a8aa0] uppercase tracking-wider">Private Key</label>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 bg-[#0e0e12] border border-[#2a2a3e] rounded-xl px-4 py-2.5 text-white text-xs font-mono break-all">
                {showPrivateKey ? wallet.secretKey : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
              </code>
              <button
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="shrink-0 p-2.5 bg-[#0e0e12] border border-[#2a2a3e] rounded-xl hover:border-[#ab9ff2] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8aa0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPrivateKey ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
              {showPrivateKey && (
                <button
                  onClick={() => copyToClipboard(wallet.secretKey, "private")}
                  className="shrink-0 p-2.5 bg-[#0e0e12] border border-[#2a2a3e] rounded-xl hover:border-[#ab9ff2] transition-colors"
                >
                  {copied === "private" ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14f195" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8aa0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            <p className="text-xs text-[#f43f5e] mt-2">
              Never share your private key. Anyone with it can steal your funds.
            </p>
          </div>
        </div>
      </div>

      {/* Solscan Link */}
      <div className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-white mb-2">Explorer</h3>
        <a
          href={getSolscanAddressUrl(wallet.publicKey, "mainnet-beta")}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#ab9ff2] hover:text-[#8b7fd4] transition-colors flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          View wallet on Solscan ({shortenAddress(wallet.publicKey, 6)})
        </a>
      </div>

      {/* Twitter / X Link via OAuth */}
      <div className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-white mb-2">Link Twitter / X</h3>
        <p className="text-xs text-[#8a8aa0] mb-4">
          Sign in with Twitter to verify your identity. No one can impersonate you — your handle is authenticated via OAuth.
        </p>

        {linkedProfile ? (
          <div className="bg-[#0e0e12] border border-[#2a2a3e] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={linkedProfile.avatarUrl}
                  alt={linkedProfile.displayName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#ab9ff2]/30"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{linkedProfile.name}</p>
                    {linkedProfile.verified && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#14f195]/10 text-[#14f195] font-medium">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#ab9ff2]">{linkedProfile.displayName}</p>
                  <p className="text-xs text-[#8a8aa0] mt-0.5">Linked to {shortenAddress(wallet.publicKey, 6)}</p>
                </div>
              </div>
              <button
                onClick={handleUnlink}
                className="text-xs text-[#f43f5e] hover:text-[#f43f5e]/80 transition-colors"
              >
                Unlink
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => signIn("twitter")}
            className="w-full bg-[#0e0e12] border border-[#2a2a3e] hover:border-[#ab9ff2] text-white py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Sign in with Twitter / X
          </button>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-[#1c1c27] border border-[#f43f5e]/20 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-[#f43f5e] mb-2">Danger Zone</h3>
        <p className="text-xs text-[#8a8aa0] mb-4">
          This will clear your wallet from this browser. Make sure you&apos;ve saved your private key.
        </p>
        <button
          onClick={onLogout}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[#f43f5e]/10 text-[#f43f5e] hover:bg-[#f43f5e]/20 transition-all"
        >
          Remove Wallet
        </button>
      </div>
    </div>
  );
}
