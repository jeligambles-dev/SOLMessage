"use client";

import { useState, useMemo } from "react";
import { MessageTransaction, shortenAddress, getSolscanUrl, Network } from "@/lib/solana";
import { getProfile, getProfiles } from "@/lib/profiles";
import TwitterHoverCard from "./TwitterHoverCard";

interface HistoryProps {
  transactions: MessageTransaction[];
  network: Network;
  loading: boolean;
}

type Filter = "all" | "sent" | "received" | "messages";

const PAGE_SIZE = 20;

export default function History({ transactions, network, loading }: HistoryProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const profiles = getProfiles();
    return transactions.filter((tx) => {
      if (filter === "sent" && tx.direction !== "sent") return false;
      if (filter === "received" && tx.direction !== "received") return false;
      if (filter === "messages" && !tx.message) return false;
      if (search) {
        const q = search.toLowerCase().trim();
        if (tx.message.toLowerCase().includes(q)) return true;
        if (tx.from.toLowerCase().includes(q)) return true;
        if (tx.to.toLowerCase().includes(q)) return true;
        if (tx.signature.toLowerCase().includes(q)) return true;
        const fromProfile = profiles[tx.from];
        const toProfile = profiles[tx.to];
        if (fromProfile?.twitter.toLowerCase().includes(q)) return true;
        if (fromProfile?.name.toLowerCase().includes(q)) return true;
        if (toProfile?.twitter.toLowerCase().includes(q)) return true;
        if (toProfile?.name.toLowerCase().includes(q)) return true;
        return false;
      }
      return true;
    });
  }, [transactions, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Transaction History</h2>
        <p className="text-[#8a8aa0] text-sm">
          All your transactions with messages — visible on-chain, just like a Venmo feed
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-1 bg-[#1c1c27] border border-[#2a2a3e] rounded-xl p-1">
          {(["all", "sent", "received", "messages"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm transition-all capitalize ${
                filter === f
                  ? "bg-[#ab9ff2] text-white"
                  : "text-[#8a8aa0] hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8aa0]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search wallets, messages, or @twitter handles..."
            className="w-full bg-[#1c1c27] border border-[#2a2a3e] rounded-xl pl-10 pr-10 py-2.5 text-white text-sm placeholder-[#8a8aa0] focus:border-[#ab9ff2] transition-colors"
          />
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8aa0] hover:text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Transaction List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2a2a3e]" />
                <div className="flex-1">
                  <div className="h-4 bg-[#2a2a3e] rounded w-1/3 mb-2" />
                  <div className="h-3 bg-[#2a2a3e] rounded w-1/4" />
                </div>
                <div className="h-5 bg-[#2a2a3e] rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#24243a] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8a8aa0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p className="text-[#8a8aa0] text-sm mb-1">
            {search ? "No results found" : "No transactions found"}
          </p>
          <p className="text-[#8a8aa0] text-xs">
            {search
              ? `No matches for "${search}"`
              : filter === "messages"
              ? "No message transactions yet — send one!"
              : "Transactions will appear here"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paged.map((tx) => (
              <TransactionCard key={tx.signature} tx={tx} network={network} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  currentPage <= 1
                    ? "text-[#2a2a3e] cursor-not-allowed"
                    : "text-[#8a8aa0] hover:text-white hover:bg-[#24243a]"
                }`}
              >
                Previous
              </button>
              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-2 text-sm text-[#8a8aa0]">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-9 h-9 rounded-lg text-sm transition-all ${
                      currentPage === p
                        ? "bg-[#ab9ff2] text-white"
                        : "text-[#8a8aa0] hover:text-white hover:bg-[#24243a]"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  currentPage >= totalPages
                    ? "text-[#2a2a3e] cursor-not-allowed"
                    : "text-[#8a8aa0] hover:text-white hover:bg-[#24243a]"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TransactionCard({ tx, network }: { tx: MessageTransaction; network: Network }) {
  const [expanded, setExpanded] = useState(false);
  const fromProfile = getProfile(tx.from);
  const toProfile = getProfile(tx.to);

  return (
    <div
      className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl overflow-hidden hover:border-[#ab9ff2]/30 transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {fromProfile ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fromProfile.avatarUrl}
                alt={fromProfile.displayName}
                className="w-10 h-10 rounded-full object-cover border border-[#2a2a3e] shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                tx.direction === "sent" ? "bg-[#f43f5e]/10" : "bg-[#14f195]/10"
              }`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tx.direction === "sent" ? "#f43f5e" : "#14f195"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                <TwitterHoverCard profile={fromProfile} address={tx.from}>
                  {fromProfile ? fromProfile.displayName : shortenAddress(tx.from, 4)}
                </TwitterHoverCard>
                <svg className="shrink-0 text-[#8a8aa0]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                <TwitterHoverCard profile={toProfile} address={tx.to}>
                  {toProfile ? toProfile.displayName : shortenAddress(tx.to, 4)}
                </TwitterHoverCard>
                {tx.status === "failed" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#f43f5e]/10 text-[#f43f5e]">Failed</span>
                )}
              </div>
              <p className="text-xs text-[#8a8aa0] mt-0.5">
                {new Date(tx.timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                at {new Date(tx.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-lg font-bold ${
              tx.direction === "sent" ? "text-[#f43f5e]" : "text-[#14f195]"
            }`}>
              {tx.direction === "sent" ? "-" : "+"}{tx.amount.toFixed(4)}
            </span>
            <p className="text-xs text-[#8a8aa0]">SOL</p>
          </div>
        </div>

        {/* Message preview */}
        {tx.message && (
          <div className="mt-3 ml-13 bg-[#0e0e12] rounded-xl p-3 border border-[#2a2a3e]">
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ab9ff2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-sm text-[#ab9ff2]">&quot;{tx.message}&quot;</p>
            </div>
          </div>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[#2a2a3e] bg-[#0e0e12] p-5 animate-[slide-up_0.2s_ease-out]">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[#8a8aa0] text-xs">From</span>
              <p className="text-white font-mono text-xs mt-1 break-all">{tx.from}</p>
              {fromProfile && <p className="text-[#ab9ff2] text-xs mt-0.5">{fromProfile.displayName} ({fromProfile.name})</p>}
            </div>
            <div>
              <span className="text-[#8a8aa0] text-xs">To</span>
              <p className="text-white font-mono text-xs mt-1 break-all">{tx.to}</p>
              {toProfile && <p className="text-[#ab9ff2] text-xs mt-0.5">{toProfile.displayName} ({toProfile.name})</p>}
            </div>
            <div>
              <span className="text-[#8a8aa0] text-xs">Signature</span>
              <p className="text-white font-mono text-xs mt-1 break-all">{tx.signature}</p>
            </div>
            <div>
              <span className="text-[#8a8aa0] text-xs">Slot</span>
              <p className="text-white font-mono text-xs mt-1">{tx.slot.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href={getSolscanUrl(tx.signature, network)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 text-sm text-[#ab9ff2] hover:text-[#8b7fd4] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View on Solscan
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
