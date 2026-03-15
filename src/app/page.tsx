"use client";

import { useState, useEffect, useCallback } from "react";
import {
  WalletData,
  getConnection,
  getBalance,
  getTransactionHistory,
  MessageTransaction,
} from "@/lib/solana";
import { getRegisteredWallets, registerWallet } from "@/lib/registry";
import WalletSetup from "@/components/WalletSetup";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import SendForm from "@/components/SendForm";
import History from "@/components/History";
import Settings from "@/components/Settings";

const NETWORK = "mainnet-beta" as const;

export default function Home() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<MessageTransaction[]>([]);
  const [publicFeedTxs, setPublicFeedTxs] = useState<MessageTransaction[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [publicFeedLoading, setPublicFeedLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showWalletSetup, setShowWalletSetup] = useState(false);

  const connection = getConnection(NETWORK);

  // Load wallet from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("solmessage_wallet");
    if (saved) {
      try {
        setWallet(JSON.parse(saved));
      } catch {
        localStorage.removeItem("solmessage_wallet");
      }
    }
    setInitialized(true);
  }, []);

  // Save wallet to localStorage + register it
  useEffect(() => {
    if (wallet) {
      localStorage.setItem("solmessage_wallet", JSON.stringify(wallet));
      registerWallet(wallet.publicKey);
    }
  }, [wallet]);

  // Load public feed from ALL registered wallets
  const refreshPublicFeed = useCallback(async () => {
    const wallets = getRegisteredWallets();
    if (wallets.length === 0) return;

    const conn = getConnection(NETWORK);
    setPublicFeedLoading(true);
    try {
      const allTxArrays = await Promise.all(
        wallets.map((addr) => getTransactionHistory(conn, addr).catch(() => []))
      );
      // Merge + deduplicate by signature
      const seen = new Set<string>();
      const merged: MessageTransaction[] = [];
      for (const txs of allTxArrays) {
        for (const tx of txs) {
          if (!seen.has(tx.signature)) {
            seen.add(tx.signature);
            merged.push(tx);
          }
        }
      }
      merged.sort((a, b) => b.timestamp - a.timestamp);
      setPublicFeedTxs(merged);
    } catch (err) {
      console.error("Failed to load public feed:", err);
    } finally {
      setPublicFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized) {
      refreshPublicFeed();
    }
  }, [initialized, refreshPublicFeed]);

  const refreshData = useCallback(async () => {
    if (!wallet) return;
    const conn = getConnection(NETWORK);
    setLoading(true);
    try {
      const [bal, txs] = await Promise.all([
        getBalance(conn, wallet.publicKey),
        getTransactionHistory(conn, wallet.publicKey),
      ]);
      setBalance(bal);
      setTransactions(txs);
    } catch (err) {
      console.error("Failed to refresh data:", err);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet && initialized) {
      refreshData();
    }
  }, [wallet, initialized, refreshData]);

  // Dashboard feed: merge personal + public, only messages
  const dashboardFeed = (() => {
    const seen = new Set<string>();
    const merged: MessageTransaction[] = [];
    // Add personal transactions first
    for (const tx of transactions) {
      if (tx.message && !seen.has(tx.signature)) {
        seen.add(tx.signature);
        merged.push(tx);
      }
    }
    // Add public feed transactions
    for (const tx of publicFeedTxs) {
      if (tx.message && !seen.has(tx.signature)) {
        seen.add(tx.signature);
        merged.push(tx);
      }
    }
    merged.sort((a, b) => b.timestamp - a.timestamp);
    return merged;
  })();

  function handleWalletReady(w: WalletData) {
    setWallet(w);
    setShowWalletSetup(false);
    setActiveTab("dashboard");
  }

  function handleLogout() {
    setWallet(null);
    setBalance(0);
    setTransactions([]);
    setActiveTab("dashboard");
    localStorage.removeItem("solmessage_wallet");
  }

  function handleTabChange(tab: string) {
    if (!wallet && ["send", "history", "settings"].includes(tab)) {
      setShowWalletSetup(true);
      return;
    }
    setActiveTab(tab);
  }

  function handleConnectWallet() {
    setShowWalletSetup(true);
  }

  function handleRefresh() {
    refreshData();
    refreshPublicFeed();
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ab9ff2] to-[#14f195] animate-pulse" />
      </div>
    );
  }

  const isLoading = loading || publicFeedLoading;

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          publicKey={wallet?.publicKey ?? null}
          balance={balance}
          onConnectWallet={handleConnectWallet}
          onLogout={handleLogout}
        />
        <main className="flex-1 bg-[#0e0e12] min-h-screen overflow-y-auto">
          <div className="sticky top-0 z-10 bg-[#0e0e12]/80 backdrop-blur-xl border-b border-[#2a2a3e] px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#14f195]" />
              <span className="text-xs text-[#8a8aa0]">Mainnet</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="text-xs text-[#8a8aa0] hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className={isLoading ? "animate-spin" : ""} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
              {!wallet && (
                <button
                  onClick={handleConnectWallet}
                  className="text-xs bg-[#ab9ff2] hover:bg-[#8b7fd4] text-white px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5z" />
                  </svg>
                  Connect
                </button>
              )}
            </div>
          </div>

          {activeTab === "dashboard" && (
            <Dashboard
              balance={balance}
              transactions={dashboardFeed}
              publicKey={wallet?.publicKey ?? null}
              network={NETWORK}
              onSendClick={() => handleTabChange("send")}
              onConnectWallet={handleConnectWallet}
              loading={isLoading}
            />
          )}
          {activeTab === "send" && wallet && (
            <SendForm
              wallet={wallet}
              connection={connection}
              balance={balance}
              network={NETWORK}
              onTransactionSent={handleRefresh}
            />
          )}
          {activeTab === "history" && wallet && (
            <History
              transactions={transactions}
              network={NETWORK}
              loading={loading}
            />
          )}
          {activeTab === "settings" && wallet && (
            <Settings
              wallet={wallet}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {showWalletSetup && (
        <WalletSetup
          onWalletReady={handleWalletReady}
          onClose={() => setShowWalletSetup(false)}
        />
      )}
    </>
  );
}
