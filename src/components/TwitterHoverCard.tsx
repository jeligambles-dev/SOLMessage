"use client";

import { useState, useRef, useEffect } from "react";
import { UserProfile } from "@/lib/profiles";
import { shortenAddress } from "@/lib/solana";

interface TwitterHoverCardProps {
  profile: UserProfile | null;
  address: string;
  children?: React.ReactNode;
}

export default function TwitterHoverCard({ profile, address, children }: TwitterHoverCardProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<"above" | "below">("below");
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleMouseEnter() {
    if (!profile) return;
    timeoutRef.current = setTimeout(() => {
      // Determine if card should appear above or below
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setPosition(spaceBelow < 240 ? "above" : "below");
      }
      setShow(true);
    }, 300);
  }

  function handleMouseLeave() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!profile) {
    return (
      <span className="text-white font-mono text-sm">
        {children || shortenAddress(address, 4)}
      </span>
    );
  }

  return (
    <span
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <span className="inline-flex items-center gap-1.5 cursor-pointer group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.avatarUrl}
          alt={profile.displayName}
          className="w-5 h-5 rounded-full object-cover border border-[#2a2a3e]"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="text-sm font-medium text-[#ab9ff2] group-hover:text-white transition-colors">
          {children || profile.displayName}
        </span>
      </span>

      {/* Hover Card */}
      {show && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-50 w-72 animate-[fade-in_0.15s_ease-out] ${
            position === "below" ? "top-full mt-2" : "bottom-full mb-2"
          }`}
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setShow(true);
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            {/* Banner */}
            <div className="h-16 bg-gradient-to-r from-[#ab9ff2]/30 to-[#14f195]/20" />

            {/* Profile */}
            <div className="px-4 pb-4 -mt-8">
              <div className="flex items-end gap-3 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-14 h-14 rounded-full object-cover border-3 border-[#1c1c27] bg-[#24243a]"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.src = "";
                    el.className = "w-14 h-14 rounded-full border-3 border-[#1c1c27] bg-[#24243a]";
                  }}
                />
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-1.5">
                  <p className="text-base font-bold text-white">{profile.name}</p>
                  {profile.verified && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#14f195" stroke="none">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path d="M9 12l2 2 4-4" stroke="#0e0e12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-[#8a8aa0]">{profile.displayName}</p>
              </div>

              {/* Wallet info */}
              <div className="bg-[#0e0e12] rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a8aa0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5z" />
                  </svg>
                  <span className="text-xs text-[#8a8aa0]">Linked Wallet</span>
                </div>
                <p className="text-xs font-mono text-white break-all">{profile.address}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={`https://x.com/${profile.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#0e0e12] hover:bg-[#24243a] border border-[#2a2a3e] rounded-xl py-2 text-xs text-[#8a8aa0] hover:text-white transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  View Profile
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(profile.address);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#0e0e12] hover:bg-[#24243a] border border-[#2a2a3e] rounded-xl py-2 text-xs text-[#8a8aa0] hover:text-white transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
