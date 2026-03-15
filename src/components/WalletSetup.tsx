"use client";

import { useState } from "react";
import { generateWallet, importWallet, WalletData } from "@/lib/solana";

interface WalletSetupProps {
  onWalletReady: (wallet: WalletData) => void;
  onClose: () => void;
}

export default function WalletSetup({ onWalletReady, onClose }: WalletSetupProps) {
  const [mode, setMode] = useState<"choose" | "create" | "import">("choose");
  const [importKey, setImportKey] = useState("");
  const [error, setError] = useState("");
  const [newWallet, setNewWallet] = useState<WalletData | null>(null);
  const [savedKey, setSavedKey] = useState(false);

  function handleCreate() {
    const wallet = generateWallet();
    setNewWallet(wallet);
    setMode("create");
  }

  function handleImport() {
    setError("");
    try {
      const wallet = importWallet(importKey.trim());
      onWalletReady(wallet);
    } catch {
      setError("Invalid private key. Make sure it's a base58-encoded Solana private key.");
    }
  }

  function handleConfirmCreate() {
    if (newWallet) {
      onWalletReady(newWallet);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-[slide-up_0.3s_ease-out]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-[#1c1c27] border border-[#2a2a3e] flex items-center justify-center text-[#8a8aa0] hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Logo */}
        <div className="text-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="SOLMessage" className="w-32 h-32 mx-auto mb-0 rounded-2xl shadow-[0_0_40px_rgba(171,159,242,0.3)]" />
          <h1 className="text-2xl font-bold text-white mb-1">Connect to SOLMessage</h1>
          <p className="text-[#8a8aa0] text-xs max-w-xs mx-auto">
            Create a new wallet or import an existing one to start sending SOL with messages.
          </p>
        </div>

        {mode === "choose" && (
          <div className="space-y-4 animate-[fade-in_0.2s_ease-out]">
            <div className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl p-6">
              <div className="space-y-3">
                <button
                  onClick={handleCreate}
                  className="w-full bg-[#ab9ff2] hover:bg-[#8b7fd4] text-white py-4 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(171,159,242,0.3)] flex items-center justify-center gap-3"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  Create New Wallet
                </button>
                <button
                  onClick={() => setMode("import")}
                  className="w-full bg-[#0e0e12] border border-[#2a2a3e] hover:border-[#ab9ff2] text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                  Import Existing Wallet
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FeatureCard icon="message" label="On-Chain Messages" />
              <FeatureCard icon="eye" label="Solscan Visible" />
              <FeatureCard icon="lock" label="Self-Custody" />
            </div>
          </div>
        )}

        {mode === "create" && newWallet && (
          <div className="animate-[slide-up_0.2s_ease-out]">
            <div className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#fbbf24]/10 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-[#fbbf24]">Save Your Private Key!</h3>
              </div>

              <p className="text-xs text-[#8a8aa0] mb-4">
                This is the ONLY way to recover your wallet. Save it somewhere safe. We don&apos;t store it on any server.
              </p>

              <div className="mb-4">
                <label className="text-xs text-[#8a8aa0] uppercase tracking-wider">Your Public Address</label>
                <div className="mt-1 bg-[#0e0e12] border border-[#2a2a3e] rounded-xl px-4 py-3">
                  <code className="text-xs text-white break-all">{newWallet.publicKey}</code>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-[#8a8aa0] uppercase tracking-wider">Your Private Key</label>
                <div className="mt-1 bg-[#0e0e12] border border-[#f43f5e]/30 rounded-xl px-4 py-3">
                  <code className="text-xs text-[#f43f5e] break-all">{newWallet.secretKey}</code>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(newWallet.secretKey);
                  setSavedKey(true);
                }}
                className="w-full bg-[#0e0e12] border border-[#2a2a3e] text-white py-3 rounded-xl text-sm font-medium hover:border-[#ab9ff2] transition-all mb-3"
              >
                {savedKey ? "Copied!" : "Copy Private Key"}
              </button>

              <button
                onClick={handleConfirmCreate}
                disabled={!savedKey}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  savedKey
                    ? "bg-[#ab9ff2] hover:bg-[#8b7fd4] text-white"
                    : "bg-[#2a2a3e] text-[#8a8aa0] cursor-not-allowed"
                }`}
              >
                {savedKey ? "I've Saved My Key — Continue" : "Copy your key first"}
              </button>
            </div>

            <button
              onClick={() => { setMode("choose"); setNewWallet(null); setSavedKey(false); }}
              className="w-full mt-3 text-sm text-[#8a8aa0] hover:text-white transition-colors"
            >
              Back
            </button>
          </div>
        )}

        {mode === "import" && (
          <div className="animate-[slide-up_0.2s_ease-out]">
            <div className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Import Wallet</h3>

              <div className="mb-4">
                <label className="text-xs text-[#8a8aa0] uppercase tracking-wider mb-2 block">
                  Private Key (Base58)
                </label>
                <textarea
                  value={importKey}
                  onChange={(e) => setImportKey(e.target.value)}
                  placeholder="Paste your base58-encoded private key..."
                  rows={3}
                  className="w-full bg-[#0e0e12] border border-[#2a2a3e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#8a8aa0] focus:border-[#ab9ff2] transition-colors resize-none"
                />
              </div>

              {error && (
                <p className="text-xs text-[#f43f5e] mb-3">{error}</p>
              )}

              <button
                onClick={handleImport}
                disabled={!importKey.trim()}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  importKey.trim()
                    ? "bg-[#ab9ff2] hover:bg-[#8b7fd4] text-white"
                    : "bg-[#2a2a3e] text-[#8a8aa0] cursor-not-allowed"
                }`}
              >
                Import Wallet
              </button>
            </div>

            <button
              onClick={() => { setMode("choose"); setError(""); setImportKey(""); }}
              className="w-full mt-3 text-sm text-[#8a8aa0] hover:text-white transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ icon, label }: { icon: string; label: string }) {
  const icons: Record<string, React.ReactNode> = {
    message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  };

  return (
    <div className="bg-[#1c1c27] border border-[#2a2a3e] rounded-xl p-3 text-center">
      <svg className="mx-auto mb-2 text-[#ab9ff2]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {icons[icon]}
      </svg>
      <p className="text-[10px] text-[#8a8aa0]">{label}</p>
    </div>
  );
}
