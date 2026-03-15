import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  ConfirmedSignatureInfo,
  ParsedTransactionWithMeta,
} from "@solana/web3.js";
import bs58 from "bs58";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export type Network = "mainnet-beta" | "devnet";

export interface WalletData {
  publicKey: string;
  secretKey: string; // base58 encoded
}

export interface MessageTransaction {
  signature: string;
  from: string;
  to: string;
  amount: number; // in SOL
  message: string;
  timestamp: number;
  slot: number;
  status: "success" | "failed";
  direction: "sent" | "received";
}

export function getConnection(network: Network): Connection {
  const heliusKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

  let endpoint: string;
  if (heliusKey && heliusKey !== "your_helius_api_key_here") {
    endpoint = network === "mainnet-beta"
      ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
      : `https://devnet.helius-rpc.com/?api-key=${heliusKey}`;
  } else {
    endpoint = clusterApiUrl(network);
  }

  return new Connection(endpoint, "confirmed");
}

export function generateWallet(): WalletData {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: bs58.encode(keypair.secretKey),
  };
}

export function importWallet(secretKeyBase58: string): WalletData {
  const secretKey = bs58.decode(secretKeyBase58);
  const keypair = Keypair.fromSecretKey(secretKey);
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: secretKeyBase58,
  };
}

export function getKeypair(wallet: WalletData): Keypair {
  return Keypair.fromSecretKey(bs58.decode(wallet.secretKey));
}

export async function getBalance(connection: Connection, publicKey: string): Promise<number> {
  const balance = await connection.getBalance(new PublicKey(publicKey));
  return balance / LAMPORTS_PER_SOL;
}

export async function sendSolWithMessage(
  connection: Connection,
  wallet: WalletData,
  recipientAddress: string,
  amountSol: number,
  message: string
): Promise<string> {
  const keypair = getKeypair(wallet);
  const recipient = new PublicKey(recipientAddress);
  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);

  const transaction = new Transaction();

  // SOL transfer instruction
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: recipient,
      lamports,
    })
  );

  // Memo instruction with custom message
  transaction.add(
    new TransactionInstruction({
      keys: [{ pubkey: keypair.publicKey, isSigner: true, isWritable: true }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(message, "utf-8"),
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = keypair.publicKey;

  transaction.sign(keypair);

  const signature = await connection.sendRawTransaction(transaction.serialize());
  await connection.confirmTransaction(signature, "confirmed");

  return signature;
}

export async function getTransactionHistory(
  connection: Connection,
  publicKey: string,
  limit: number = 50
): Promise<MessageTransaction[]> {
  const pubkey = new PublicKey(publicKey);

  let signatures: ConfirmedSignatureInfo[];
  try {
    signatures = await connection.getSignaturesForAddress(pubkey, { limit });
  } catch {
    return [];
  }

  if (signatures.length === 0) return [];

  // Fetch transactions individually to avoid batch requests (Helius free tier)
  const txs: (ParsedTransactionWithMeta | null)[] = await Promise.all(
    signatures.map((s) =>
      connection.getParsedTransaction(s.signature, { maxSupportedTransactionVersion: 0 }).catch(() => null)
    )
  );

  const results: MessageTransaction[] = [];

  for (let i = 0; i < txs.length; i++) {
    const tx = txs[i];
    const sig = signatures[i];
    if (!tx || !tx.meta) continue;

    // Extract memo
    let message = "";
    for (const ix of tx.transaction.message.instructions) {
      if ("programId" in ix && ix.programId.toBase58() === MEMO_PROGRAM_ID.toBase58()) {
        if ("data" in ix && typeof ix.data === "string") {
          try {
            message = Buffer.from(ix.data, "base64").toString("utf-8");
          } catch {
            message = ix.data;
          }
        } else if ("parsed" in ix && typeof ix.parsed === "string") {
          message = ix.parsed;
        }
      }
    }

    // Extract transfer details
    let from = "";
    let to = "";
    let amount = 0;

    for (const ix of tx.transaction.message.instructions) {
      if (
        "programId" in ix &&
        ix.programId.toBase58() === SystemProgram.programId.toBase58() &&
        "parsed" in ix &&
        ix.parsed?.type === "transfer"
      ) {
        from = ix.parsed.info.source;
        to = ix.parsed.info.destination;
        amount = ix.parsed.info.lamports / LAMPORTS_PER_SOL;
        break;
      }
    }

    if (!from && !to) {
      // Fallback: use account keys
      const accounts = tx.transaction.message.accountKeys;
      if (accounts.length >= 2) {
        from = accounts[0].pubkey.toBase58();
        to = accounts[1].pubkey.toBase58();
      }
      // Try to get amount from balance changes
      if (tx.meta.preBalances && tx.meta.postBalances && tx.meta.preBalances.length >= 2) {
        const change = (tx.meta.preBalances[1] - tx.meta.postBalances[1]);
        amount = Math.abs(change) / LAMPORTS_PER_SOL;
      }
    }

    const direction = from === publicKey ? "sent" : "received";

    results.push({
      signature: sig.signature,
      from,
      to,
      amount,
      message,
      timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
      slot: sig.slot,
      status: sig.err ? "failed" : "success",
      direction,
    });
  }

  return results;
}

export async function requestAirdrop(
  connection: Connection,
  publicKey: string,
  amountSol: number = 1
): Promise<string> {
  const signature = await connection.requestAirdrop(
    new PublicKey(publicKey),
    amountSol * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(signature, "confirmed");
  return signature;
}

export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function getSolscanUrl(signature: string, network: Network): string {
  const cluster = network === "devnet" ? "?cluster=devnet" : "";
  return `https://solscan.io/tx/${signature}${cluster}`;
}

export function getSolscanAddressUrl(address: string, network: Network): string {
  const cluster = network === "devnet" ? "?cluster=devnet" : "";
  return `https://solscan.io/account/${address}${cluster}`;
}
