# SOLMessage

Send SOL with messages attached — permanently on-chain, visible on Solscan.

Like Venmo, Revolut, PayPal & Cash App, but on Solana. Ever wanted to message a wallet to sell their 6% or call out a scammer? Now you can.

**Live:** [solmessage.online](https://solmessage.online)

## What it does

SOLMessage lets you send SOL to any wallet with a custom message embedded in the transaction using Solana's Memo Program. The message is stored on-chain forever and visible on Solscan.

- **Send SOL + Message** — Compose a transfer with a note, just like Venmo
- **On-Chain Memo** — Your message is bundled into the transaction via the Memo Program
- **Visible on Solscan** — Anyone can see the message on the block explorer
- **Public Message Feed** — All message transactions from SOLMessage users show up in a public feed
- **Twitter/X Identity** — Link your Twitter via OAuth so transactions show @you instead of a wallet address. Verified badge, profile picture, hover cards
- **Stay Anonymous** — Skip Twitter entirely. Messages still go on-chain, just with wallet addresses

## Features

- Phantom-style dark UI
- Create or import Solana wallets
- Mainnet via Helius RPC
- Transaction history with search, filters, and pagination
- Twitter OAuth verification (no impersonation)
- Public message feed across all registered wallets
- Copy-to-clipboard wallet addresses
- Solscan links on every transaction

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **@solana/web3.js** — Solana transactions + Memo Program
- **NextAuth v5** — Twitter/X OAuth
- **Helius RPC** — Reliable Solana RPC

## Setup

```bash
git clone https://github.com/jeligambles-dev/SOLMessage.git
cd SOLMessage
npm install
```

Create `.env.local`:

```
AUTH_SECRET=your_auth_secret
AUTH_TWITTER_ID=your_twitter_client_id
AUTH_TWITTER_SECRET=your_twitter_client_secret
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Twitter OAuth Setup

1. Go to [developer.x.com](https://developer.x.com) and create a project/app
2. Set up OAuth 2.0 with callback URL: `https://your-domain.com/api/auth/callback/twitter`
3. Copy Client ID and Client Secret into `.env.local`

## Deployment

Deployed on Railway. Set `PORT=3000` and add `AUTH_URL=https://your-domain.com` to environment variables.

## License

MIT
