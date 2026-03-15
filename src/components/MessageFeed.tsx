"use client";

import { useState, useMemo } from "react";
import { MessageTransaction, shortenAddress, getSolscanUrl, Network } from "@/lib/solana";
import { getProfile, getProfiles } from "@/lib/profiles";
import TwitterHoverCard from "./TwitterHoverCard";

interface MessageFeedProps {
  transactions: MessageTransaction[];
  network: Network;
  loading: boolean;
}

const PAGE_SIZE = 20;

export default function MessageFeed({ transactions, network, loading }: MessageFeedProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Search across wallets, messages, and twitter handles
  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase().trim();
    const profiles = getProfiles();

    return transactions.filter((tx) => {
      // Search in message
      if (tx.message.toLowerCase().includes(q)) return true;
      // Search in addresses
      if (tx.from.toLowerCase().includes(q)) return true;
      if (tx.to.toLowerCase().includes(q)) return true;
      if (tx.signature.toLowerCase().includes(q)) return true;
      // Search in twitter handles / names
      const fromProfile = profiles[tx.from];
      const toProfile = profiles[tx.to];
      if (fromProfile) {
        if (fromProfile.twitter.toLowerCase().includes(q)) return true;
        if (fromProfile.name.toLowerCase().includes(q)) return true;
        if (fromProfile.displayName.toLowerCase().includes(q)) return true;
      }
      if (toProfile) {
        if (toProfile.twitter.toLowerCase().includes(q)) return true;
        if (toProfile.name.toLowerCase().includes(q)) return true;
        if (toProfile.displayName.toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [transactions, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 when search changes
  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  // Generate page numbers to show
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
    <div className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl overflow-hidden">
      {/* Header with search */}
      <div className="p-4 border-b border-[#2a2a3e]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-white">Message Feed</h3>
            <p className="text-xs text-[#8a8aa0] mt-0.5">{filtered.length} transactions</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8aa0]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search wallets, messages, or @twitter handles..."
            className="w-full bg-[#0e0e12] border border-[#2a2a3e] rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-[#8a8aa0] focus:border-[#ab9ff2] transition-colors"
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

      {/* Message List */}
      {loading ? (
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-xl bg-[#0e0e12]">
              <div className="w-10 h-10 rounded-full bg-[#2a2a3e]" />
              <div className="flex-1">
                <div className="h-3.5 bg-[#2a2a3e] rounded w-2/3 mb-2" />
                <div className="h-3 bg-[#2a2a3e] rounded w-1/2" />
              </div>
              <div className="h-4 bg-[#2a2a3e] rounded w-16" />
            </div>
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#24243a] flex items-center justify-center">
            {search ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8a8aa0" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8a8aa0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            )}
          </div>
          <p className="text-[#8a8aa0] text-sm mb-1">
            {search ? "No results found" : "No transactions yet"}
          </p>
          <p className="text-[#8a8aa0] text-xs">
            {search ? `No matches for "${search}"` : "Send SOL with a message to see it here"}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#2a2a3e]/50">
          {paged.map((tx) => (
            <FeedItem key={tx.signature} tx={tx} network={network} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-[#2a2a3e] p-3 flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              currentPage <= 1
                ? "text-[#2a2a3e] cursor-not-allowed"
                : "text-[#8a8aa0] hover:text-white hover:bg-[#24243a]"
            }`}
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="px-2 text-xs text-[#8a8aa0]">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-8 h-8 rounded-lg text-xs transition-all ${
                    currentPage === p
                      ? "bg-[#ab9ff2] text-white"
                      : "text-[#8a8aa0] hover:text-white hover:bg-[#24243a]"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              currentPage >= totalPages
                ? "text-[#2a2a3e] cursor-not-allowed"
                : "text-[#8a8aa0] hover:text-white hover:bg-[#24243a]"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function FeedItem({ tx, network }: { tx: MessageTransaction; network: Network }) {
  const fromProfile = getProfile(tx.from);
  const toProfile = getProfile(tx.to);

  return (
    <div className="px-4 py-3.5 hover:bg-[#24243a]/30 transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar or direction icon */}
        <div className="shrink-0 mt-0.5">
          {fromProfile ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fromProfile.avatarUrl}
              alt={fromProfile.displayName}
              className="w-10 h-10 rounded-full object-cover border border-[#2a2a3e]"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                el.parentElement!.innerHTML = `<div class="w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.direction === "sent" ? "bg-[#f43f5e]/10" : "bg-[#14f195]/10"
                }"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${
                  tx.direction === "sent" ? "#f43f5e" : "#14f195"
                }" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></div>`;
              }}
            />
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              tx.direction === "sent" ? "bg-[#f43f5e]/10" : "bg-[#14f195]/10"
            }`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tx.direction === "sent" ? "#f43f5e" : "#14f195"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* From → To line */}
          <div className="flex items-center gap-1 flex-wrap">
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
            <span className={`ml-1 text-sm font-semibold ${
              tx.direction === "sent" ? "text-[#f43f5e]" : "text-[#14f195]"
            }`}>
              {tx.direction === "sent" ? "-" : "+"}{tx.amount.toFixed(4)} SOL
            </span>
          </div>

          {/* Message */}
          {tx.message && (
            <div className="mt-1.5 bg-[#0e0e12] rounded-lg px-3 py-2 border border-[#2a2a3e] inline-block max-w-full">
              <p className="text-sm text-[#ab9ff2] break-words">&quot;{tx.message}&quot;</p>
            </div>
          )}

          {/* Timestamp + Solscan */}
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-[#8a8aa0]">
              {new Date(tx.timestamp).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              {new Date(tx.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <a
              href={getSolscanUrl(tx.signature, network)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#8a8aa0] hover:text-[#ab9ff2] transition-colors"
            >
              Solscan →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
