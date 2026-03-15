"use client";

import { useState } from "react";
import { shortenAddress } from "@/lib/solana";
import { getProfile } from "@/lib/profiles";

// ========== UPDATE THIS WITH YOUR CONTRACT ADDRESS ==========
const CONTRACT_ADDRESS = "TBA";
// =============================================================

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  publicKey: string | null;
  balance: number;
  onConnectWallet: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  publicKey,
  balance,
  onConnectWallet,
  onLogout,
}: SidebarProps) {
  const isConnected = !!publicKey;
  const [addressCopied, setAddressCopied] = useState(false);
  const [caCopied, setCaCopied] = useState(false);

  function copyAddress() {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: DashboardIcon, requiresWallet: false },
    { id: "send", label: "Send", icon: SendIcon, requiresWallet: true },
    { id: "history", label: "History", icon: HistoryIcon, requiresWallet: true },
    { id: "settings", label: "Settings", icon: SettingsIcon, requiresWallet: true },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#16161d] border-r border-[#2a2a3e] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#2a2a3e]">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="SOLMessage" className="w-20 h-20 rounded-xl" />
          <div>
            <h1 className="text-lg font-bold text-white">SOLMessage</h1>
            <p className="text-xs text-[#8a8aa0]">Send SOL + Messages</p>
          </div>
        </div>
      </div>

      {/* CA */}
      <div className="px-4 py-3 border-b border-[#2a2a3e]">
        <p className="text-[10px] text-[#8a8aa0] uppercase tracking-wider mb-1">CA</p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(CONTRACT_ADDRESS);
            setCaCopied(true);
            setTimeout(() => setCaCopied(false), 2000);
          }}
          className="w-full text-left bg-[#0e0e12] border border-[#2a2a3e] hover:border-[#ab9ff2] rounded-lg px-3 py-2 transition-colors group"
        >
          {caCopied ? (
            <span className="text-xs text-[#14f195]">Copied!</span>
          ) : (
            <p className="text-xs text-[#ab9ff2] font-mono truncate group-hover:text-white transition-colors">
              {CONTRACT_ADDRESS === "TBA" ? "TBA" : CONTRACT_ADDRESS}
            </p>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            if (item.requiresWallet && !isConnected) return null;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    activeTab === item.id
                      ? "bg-[#24243a] text-white"
                      : "text-[#8a8aa0] hover:text-white hover:bg-[#1c1c27]"
                  }`}
                >
                  <item.icon active={activeTab === item.id} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-[#2a2a3e]">
        {isConnected ? (
          <div className="bg-[#1c1c27] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#8a8aa0]">Balance</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#14f195]/10 text-[#14f195]">
                Mainnet
              </span>
            </div>
            <p className="text-xl font-bold text-white">
              {balance.toFixed(4)} <span className="text-sm text-[#8a8aa0]">SOL</span>
            </p>
            {(() => {
              const profile = getProfile(publicKey);
              return profile ? (
                <div className="mt-1.5 flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-6 h-6 rounded-full object-cover border border-[#2a2a3e]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <p className="text-sm text-[#ab9ff2] font-medium">{profile.displayName}</p>
                </div>
              ) : null;
            })()}
            <button
              onClick={copyAddress}
              className="mt-1 text-xs hover:text-[#ab9ff2] transition-colors flex items-center gap-1"
            >
              {addressCopied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14f195" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[#14f195]">Copied!</span>
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span className="text-[#8a8aa0]">{shortenAddress(publicKey, 6)}</span>
                </>
              )}
            </button>
            <button
              onClick={onLogout}
              className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs text-[#f43f5e]/70 hover:text-[#f43f5e] py-1.5 rounded-lg hover:bg-[#f43f5e]/5 transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={onConnectWallet}
              className="w-full bg-[#ab9ff2] hover:bg-[#8b7fd4] text-white py-3 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(171,159,242,0.3)] flex items-center justify-center gap-2 text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Create Wallet
            </button>
            <button
              onClick={onConnectWallet}
              className="w-full bg-[#0e0e12] border border-[#2a2a3e] hover:border-[#ab9ff2] text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
              Import Wallet
            </button>
          </div>
        )}

        {/* Footer — Social Links */}
        <div className="flex items-center justify-center gap-4 pt-3 border-t border-[#2a2a3e]">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8a8aa0] hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8a8aa0] hover:text-white transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>
      </div>
    </aside>
  );
}

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#ab9ff2" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function SendIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#ab9ff2" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#ab9ff2" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#ab9ff2" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
