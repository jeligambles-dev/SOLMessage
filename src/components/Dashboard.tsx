"use client";

import { MessageTransaction, Network } from "@/lib/solana";
import MessageFeed from "./MessageFeed";

interface DashboardProps {
  balance: number;
  transactions: MessageTransaction[];
  publicKey: string | null;
  network: Network;
  onSendClick: () => void;
  onConnectWallet: () => void;
  loading: boolean;
}

export default function Dashboard({ balance, transactions, publicKey, network, onSendClick, onConnectWallet, loading }: DashboardProps) {
  const isConnected = !!publicKey;
  const totalSent = transactions
    .filter((t) => t.direction === "sent" && t.status === "success")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalReceived = transactions
    .filter((t) => t.direction === "received" && t.status === "success")
    .reduce((sum, t) => sum + t.amount, 0);
  const messageCount = transactions.filter((t) => t.message).length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">
          {isConnected ? "Dashboard" : "Welcome to SOLMessage"}
        </h2>
        <p className="text-[#8a8aa0] text-sm">
          Ever wanted to message a wallet to sell their 6% or call out a scammer? We have the solution.
          Send SOL with messages that live on-chain forever — like Venmo, Revolut, PayPal, Cash App &amp; bank transfers, but on Solana.
        </p>
      </div>

      {/* Connect Wallet Banner — shown when not connected */}
      {!isConnected && (
        <div className="bg-gradient-to-r from-[#ab9ff2]/20 to-[#14f195]/20 border border-[#ab9ff2]/30 rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Get Started</h3>
            <p className="text-sm text-[#8a8aa0]">Connect a wallet to send SOL with on-chain messages</p>
          </div>
          <button
            onClick={onConnectWallet}
            className="bg-[#ab9ff2] hover:bg-[#8b7fd4] text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-[0_0_20px_rgba(171,159,242,0.3)] flex items-center gap-2 shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5z" />
              <circle cx="16" cy="12" r="1" />
            </svg>
            Connect Wallet
          </button>
        </div>
      )}

      {/* How it Works — Always Visible */}
      <div className="bg-gradient-to-r from-[#ab9ff2]/10 to-[#14f195]/10 border border-[#2a2a3e] rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-5">How SOLMessage Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-[#0e0e12]/60 rounded-xl p-4 border border-[#2a2a3e]">
            <div className="w-12 h-12 rounded-xl bg-[#ab9ff2]/20 flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ab9ff2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[#ab9ff2] bg-[#ab9ff2]/10 px-2 py-0.5 rounded-md">STEP 1</span>
              <span className="text-sm font-semibold text-white">Compose</span>
            </div>
            <p className="text-xs text-[#8a8aa0] mb-3">Enter a recipient address, amount, and your message — just like sending money on Venmo.</p>
            <div className="bg-[#1c1c27] rounded-lg p-3 border border-[#2a2a3e] space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#2a2a3e]" />
                <div className="flex-1 h-3 bg-[#2a2a3e] rounded text-[0px]">To: 7xK3...mN9p</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#2a2a3e]" />
                <div className="flex-1 h-3 bg-[#2a2a3e] rounded text-[0px]">0.5 SOL</div>
              </div>
              <div className="h-6 bg-[#ab9ff2]/10 border border-[#ab9ff2]/20 rounded text-[10px] text-[#ab9ff2] flex items-center px-2">
                &quot;Sell 6% bitch&quot;
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0e0e12]/60 rounded-xl p-4 border border-[#2a2a3e]">
            <div className="w-12 h-12 rounded-xl bg-[#ab9ff2]/20 flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ab9ff2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[#ab9ff2] bg-[#ab9ff2]/10 px-2 py-0.5 rounded-md">STEP 2</span>
              <span className="text-sm font-semibold text-white">On-Chain Memo</span>
            </div>
            <p className="text-xs text-[#8a8aa0] mb-3">Your message is bundled into the transaction via Solana&apos;s Memo Program — stored permanently on the blockchain.</p>
            <div className="bg-[#1c1c27] rounded-lg p-3 border border-[#2a2a3e]">
              <div className="flex items-center justify-between text-[10px] mb-2">
                <span className="text-[#8a8aa0]">Transaction</span>
                <span className="text-[#14f195]">Confirmed</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-[#ab9ff2]/30 shrink-0" />
                  <span className="text-[10px] text-[#8a8aa0]">SOL Transfer: 0.5 SOL</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-[#14f195]/30 shrink-0" />
                  <span className="text-[10px] text-[#ab9ff2]">Memo: &quot;Sell 6% bitch&quot;</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0e0e12]/60 rounded-xl p-4 border border-[#2a2a3e]">
            <div className="w-12 h-12 rounded-xl bg-[#14f195]/20 flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14f195" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[#14f195] bg-[#14f195]/10 px-2 py-0.5 rounded-md">STEP 3</span>
              <span className="text-sm font-semibold text-white">Visible on Solscan</span>
            </div>
            <p className="text-xs text-[#8a8aa0] mb-3">Anyone can see the message on Solscan — transparent like a public ledger. Link your Twitter for identity.</p>
            <div className="bg-[#1c1c27] rounded-lg p-3 border border-[#2a2a3e]">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-3 h-3 rounded-full bg-[#14f195]" />
                <span className="text-[10px] text-white font-medium">solscan.io</span>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] text-[#8a8aa0]">
                  <span className="text-[#ab9ff2]">@jew</span> → <span className="text-white">7xK3...mN9p</span>
                </div>
                <div className="text-[10px] text-[#ab9ff2]">&quot;Sell 6% bitch&quot;</div>
                <div className="text-[10px] text-[#14f195]">0.5 SOL</div>
              </div>
            </div>
          </div>
        </div>

        {/* Identity options */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Link Twitter */}
          <div className="bg-[#0e0e12]/60 rounded-xl p-4 border border-[#2a2a3e]">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#ab9ff2]/15 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#ab9ff2">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Link your Twitter</p>
                <p className="text-[11px] text-[#8a8aa0]">Verify via OAuth in Settings</p>
              </div>
            </div>
            <p className="text-xs text-[#8a8aa0] mb-3">
              Transactions show <span className="text-[#ab9ff2] font-medium">@jew → @friend</span> with your profile picture and a verified badge. Hover any name to see their profile.
            </p>
            <div className="bg-[#1c1c27] rounded-lg p-2.5 border border-[#2a2a3e] flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#ab9ff2]/20 flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#ab9ff2">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-[#ab9ff2] font-medium">@jew</span>
                <span className="text-[11px] text-[#8a8aa0]"> → </span>
                <span className="text-[11px] text-[#ab9ff2] font-medium">@friend</span>
                <span className="text-[11px] text-[#14f195] ml-1.5">Verified</span>
              </div>
            </div>
          </div>

          {/* Stay Anonymous */}
          <div className="bg-[#0e0e12]/60 rounded-xl p-4 border border-[#2a2a3e]">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg bg-[#8a8aa0]/15 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8aa0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Stay anonymous</p>
                <p className="text-[11px] text-[#8a8aa0]">No identity required</p>
              </div>
            </div>
            <p className="text-xs text-[#8a8aa0] mb-3">
              Skip Twitter entirely. Your messages still go on-chain, but transactions just show your wallet address — no name, no profile.
            </p>
            <div className="bg-[#1c1c27] rounded-lg p-2.5 border border-[#2a2a3e] flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#8a8aa0]/10 flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8a8aa0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-white font-mono">7xK3...mN9p</span>
                <span className="text-[11px] text-[#8a8aa0]"> → </span>
                <span className="text-[11px] text-white font-mono">4bR2...kL8q</span>
                <span className="text-[11px] text-[#8a8aa0] ml-1.5">Anon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid — Only when connected */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Balance" value={`${balance.toFixed(4)} SOL`} icon="wallet" color="accent" />
          <StatCard label="Total Sent" value={`${totalSent.toFixed(4)} SOL`} icon="sent" color="error" />
          <StatCard label="Total Received" value={`${totalReceived.toFixed(4)} SOL`} icon="received" color="success" />
          <StatCard label="Messages Sent" value={messageCount.toString()} icon="message" color="accent" />
        </div>
      )}

      {/* Quick Send CTA — Only when connected */}
      {isConnected && (
        <div className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Send SOL with a message</h3>
            <p className="text-sm text-[#8a8aa0]">Attach a note to your next transaction — it&apos;ll show up on Solscan</p>
          </div>
          <button
            onClick={onSendClick}
            className="bg-[#ab9ff2] hover:bg-[#8b7fd4] text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Send Now
          </button>
        </div>
      )}

      {/* Message Feed Panel — Always Visible */}
      <MessageFeed transactions={transactions} network={network} loading={loading} />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: "accent" | "success" | "error";
}) {
  const colorMap = {
    accent: { bg: "bg-[#ab9ff2]/10", text: "text-[#ab9ff2]" },
    success: { bg: "bg-[#14f195]/10", text: "text-[#14f195]" },
    error: { bg: "bg-[#f43f5e]/10", text: "text-[#f43f5e]" },
  };

  const iconPaths: Record<string, React.ReactNode> = {
    wallet: <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5zm-9 1a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />,
    sent: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
    received: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>,
    message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  };

  return (
    <div className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#8a8aa0]">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${colorMap[color].bg} flex items-center justify-center`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colorMap[color].text}>
            {iconPaths[icon]}
          </svg>
        </div>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}
