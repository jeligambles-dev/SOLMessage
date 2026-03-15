"use client";

import { useState } from "react";
import { sendSolWithMessage, WalletData, getSolscanUrl, Network } from "@/lib/solana";
import { Connection, PublicKey } from "@solana/web3.js";

interface SendFormProps {
  wallet: WalletData;
  connection: Connection;
  balance: number;
  network: Network;
  onTransactionSent: () => void;
}

export default function SendForm({ wallet, connection, balance, network, onTransactionSent }: SendFormProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ signature: string } | null>(null);

  const messageLength = new TextEncoder().encode(message).length;
  const maxMessageLength = 500;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(null);

    // Validate recipient
    try {
      new PublicKey(recipient);
    } catch {
      setError("Invalid Solana address");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Enter a valid amount");
      return;
    }

    if (amountNum > balance) {
      setError("Insufficient balance");
      return;
    }

    if (!message.trim()) {
      setError("Enter a message — that's the whole point!");
      return;
    }

    if (messageLength > maxMessageLength) {
      setError(`Message too long (${messageLength}/${maxMessageLength} bytes)`);
      return;
    }

    setSending(true);
    try {
      const signature = await sendSolWithMessage(
        connection,
        wallet,
        recipient,
        amountNum,
        message
      );
      setSuccess({ signature });
      setRecipient("");
      setAmount("");
      setMessage("");
      onTransactionSent();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Transaction failed";
      setError(errMsg);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Send SOL</h2>
        <p className="text-[#8a8aa0] text-sm">
          Attach a message to your transfer — visible on-chain and on Solscan
        </p>
      </div>

      {success && (
        <div className="mb-6 bg-[#14f195]/10 border border-[#14f195]/30 rounded-2xl p-5 animate-[slide-up_0.3s_ease-out]">
          <div className="flex items-center gap-2 mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14f195" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-[#14f195] font-semibold">Transaction Sent!</span>
          </div>
          <a
            href={getSolscanUrl(success.signature, network)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#ab9ff2] hover:text-[#8b7fd4] transition-colors break-all"
          >
            View on Solscan →
          </a>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-[#f43f5e]/10 border border-[#f43f5e]/30 rounded-2xl p-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span className="text-[#f43f5e] text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSend} className="space-y-5">
        {/* Recipient */}
        <div className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl p-5">
          <label className="block text-xs text-[#8a8aa0] mb-2 uppercase tracking-wider">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Solana wallet address..."
            className="w-full bg-[#0e0e12] border border-[#2a2a3e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#8a8aa0] focus:border-[#ab9ff2] transition-colors"
          />
        </div>

        {/* Amount */}
        <div className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-[#8a8aa0] uppercase tracking-wider">Amount</label>
            <button
              type="button"
              onClick={() => setAmount(Math.max(0, balance - 0.01).toFixed(4))}
              className="text-xs text-[#ab9ff2] hover:text-[#8b7fd4] transition-colors"
            >
              Max: {balance.toFixed(4)} SOL
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[#0e0e12] border border-[#2a2a3e] rounded-xl px-4 py-3 pr-16 text-white text-sm placeholder-[#8a8aa0] focus:border-[#ab9ff2] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a8aa0] text-sm">SOL</span>
          </div>
        </div>

        {/* Message */}
        <div className="bg-[#1c1c27] border border-[#2a2a3e] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-[#8a8aa0] uppercase tracking-wider">Message</label>
            <span className={`text-xs ${messageLength > maxMessageLength ? "text-[#f43f5e]" : "text-[#8a8aa0]"}`}>
              {messageLength}/{maxMessageLength} bytes
            </span>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='e.g. "Sell 6% bitch" or "You owe me 2 SOL"'
            rows={3}
            className="w-full bg-[#0e0e12] border border-[#2a2a3e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#8a8aa0] focus:border-[#ab9ff2] transition-colors resize-none"
          />
          <p className="text-xs text-[#8a8aa0] mt-2">
            This message will be permanently stored on-chain via Solana&apos;s Memo Program
          </p>
        </div>

        {/* Preview */}
        {(recipient || amount || message) && (
          <div className="bg-[#0e0e12] border border-[#2a2a3e] rounded-2xl p-5">
            <h4 className="text-xs text-[#8a8aa0] uppercase tracking-wider mb-3">Transaction Preview</h4>
            <div className="space-y-2">
              {recipient && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#8a8aa0]">To</span>
                  <span className="text-white font-mono text-xs">{recipient.length > 20 ? `${recipient.slice(0, 8)}...${recipient.slice(-8)}` : recipient}</span>
                </div>
              )}
              {amount && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#8a8aa0]">Amount</span>
                  <span className="text-white">{amount} SOL</span>
                </div>
              )}
              {message && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#8a8aa0]">Message</span>
                  <span className="text-[#ab9ff2] text-right max-w-[60%] break-words">&quot;{message}&quot;</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-[#2a2a3e]">
                <span className="text-[#8a8aa0]">Network Fee</span>
                <span className="text-white">~0.000005 SOL</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={sending || !recipient || !amount || !message}
          className={`w-full py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
            sending || !recipient || !amount || !message
              ? "bg-[#2a2a3e] text-[#8a8aa0] cursor-not-allowed"
              : "bg-[#ab9ff2] hover:bg-[#8b7fd4] hover:shadow-[0_0_20px_rgba(171,159,242,0.3)]"
          }`}
        >
          {sending ? (
            <>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Send Transaction
            </>
          )}
        </button>
      </form>
    </div>
  );
}
