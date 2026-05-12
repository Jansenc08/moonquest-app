# Moonquest

A gamified Web3 rewards platform that turns everyday actions into earning opportunities. Users complete quests, build streaks, and redeem points for real rewards.

**Live Demo:** https://moonquest-app.vercel.app  

---

## Overview

Moonquest addresses the engagement problem in loyalty and rewards programs — users sign up, forget about them, and never return. By borrowing mechanics from gaming (daily streaks, spin wheels, progress tracking, leaderboards), Moonquest creates a habit loop that keeps users coming back.

The platform combines traditional Web2 authentication with optional Web3 wallet connectivity, positioning it for both mainstream users and crypto-native audiences.

---

## Features

| Feature | Description |
|---------|-------------|
| Email + Google OAuth login | Flexible authentication options |
| Quest storefront | Browse available quests with details and point rewards |
| Quest completion tracking | Visual status indicators across all quests |
| Daily check-in with streak multiplier | Functional quest with escalating rewards |
| Daily spin wheel | Randomized bonus points with weighted outcomes |
| Monthly missions | Time-bound goals with claimable rewards |
| Rewards storefront | Browse redeemable items with costs and stock |
| Tabbed rewards store | Three category tabs (Featured, Web3, NFTs) with filtered card views and category-specific redemption flows |
| Points redemption | Full flow with balance validation and stock management |
| Real-time points display | Live updates via Supabase Realtime |
| Web3 wallet connection | Optional RainbowKit integration for wallet linking |
| Leaderboard | Competitive ranking across all users |
| Profile page | Points ledger, stats, and account management |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI Library | React 19 |
| Styling | Tailwind CSS, shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google OAuth) |
| Realtime | Supabase Realtime |
| Web3 | Wagmi, RainbowKit |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, floating cards, how it works, stats |
| `/login` | Email/password + Google OAuth, password strength indicator |
| `/dashboard` | Hero stats, daily check-in card with moon phases, active quests, rewards preview |
| `/quests` | Mission Board: spin wheel, monthly missions slider, leaderboard, all quests grid |
| `/rewards` | Loot Shop: reward cards with redemption modal |
| `/profile` | Points ledger, leaderboard rank, account settings |

---

## Key Mechanics

### Daily Check-in

- One check-in per calendar day, gated by SGT (UTC+8) timezone
- Streak multiplier: Day N awards `10 + (streak-1) * 2` points, capped at 50 points/day
- Last 7 days displayed as moon phase icons; today glows white when available
- Server-side validation against `profiles.last_checkin_at`

### Daily Spin Wheel

- Weighted random prizes: 0, 5, 10, 15, 25, 50, 75, or 100 points
- Collapses after spin with countdown to next available spin
- One spin per SGT calendar day, tracked in `quest_completions`

### Monthly Missions

- 3D drag/swipe carousel with momentum physics
- Claimable mission rewards (e.g., 3-Day Streak = 50 points)
- Progress tracked against `profiles.streak_count`

### Reward Redemption

- Tabbed storefront: Featured (physical rewards), Web3 (wallet-gated drops), NFTs (exclusive collectibles)
- Modal with live balance check before confirmation
- Blocks redemption if `points_balance < points_cost`
- Category-aware CTAs: "Redeem" / "Mint to Wallet" / "Claim NFT"
- Web3 and NFT rewards require a connected wallet address
- On success: deducts points, inserts redemption record, decrements stock
- NFT redemption shows airdrop confirmation message

### Wallet Connection

- One-time quest worth 50 points
- RainbowKit `ConnectButton.Custom` in Navbar for persistent wallet state
- Wallet address persisted to `profiles.wallet_address`

### Real-time Updates

- Supabase Realtime subscription on `profiles` table
- Points balance and streak animate on change in navbar

---

## Architecture Decisions

### 1. Next.js App Router with Server Components

All page data fetching happens server-side in `page.tsx` files. Client components receive data as props and handle only interactivity. Pages render with complete data on first load — no loading spinners, no client-side fetches on mount.

### 2. Supabase as Full Backend

PostgreSQL, REST API, Auth, and Realtime in one service — ideal for rapid development. A database trigger auto-creates a `profiles` row on `auth.users` insert. Realtime subscriptions on the `profiles` table drive live navbar updates without polling.

### 3. SGT Timezone Enforcement

All daily gates (check-in, spin) compare timestamps in UTC+8 to correctly reset at midnight Singapore Time. This ensures consistent behavior for users in the target region.

### 4. Points as Integer Ledger

Points are stored as a single `points_balance` integer on `profiles`. All mutations go through server-side code (API routes or Server Actions) to ensure atomic read-modify-write operations with no race conditions.

### 5. Quest Type System

Quests use a `type` field (`daily_checkin`, `wallet_connect`, `monthly_mission`, `dummy`) to drive rendering logic. Dummy quests display as "Coming Soon" with no completion action, allowing the storefront to appear populated without backend complexity.

### 6. Web3 as Optional Layer

Wallet connection is additive — the app is fully functional without a wallet. RainbowKit handles multi-wallet support and connection state. The wallet address is persisted to `profiles` so it survives auth sessions.

---

## Database Schema

```sql
profiles (
  id uuid PRIMARY KEY,            -- matches auth.users.id
  username text,
  points_balance int DEFAULT 0,
  streak_count int DEFAULT 0,
  last_checkin_at timestamptz,
  wallet_address text,
  created_at timestamptz
)

quests (
  id uuid PRIMARY KEY,
  title text,
  description text,
  points_reward int,
  type text,                      -- 'daily_checkin' | 'dummy' | 'wallet_connect' | 'monthly_mission'
  is_active boolean DEFAULT true,
  created_at timestamptz
)

quest_completions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  quest_id uuid REFERENCES quests(id),
  completed_at timestamptz,
  points_earned int
)

rewards (
  id uuid PRIMARY KEY,
  title text,
  description text,
  points_cost int,
  stock int,                          -- NULL means unlimited
  image_url text,
  category text DEFAULT 'featured',   -- 'featured' | 'web3' | 'nft'
  is_active boolean DEFAULT true,
  created_at timestamptz
)

redemptions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  reward_id uuid REFERENCES rewards(id),
  points_spent int,
  redeemed_at timestamptz DEFAULT NOW()
)
```

---

## API Routes and Server Actions

| Endpoint / Action | Type | Description |
|-------------------|------|-------------|
| `checkIn()` | Server Action | Daily check-in, awards points based on streak |
| `/api/quests/spin` | POST | Daily spin wheel, awards random points |
| `/api/quests/claim-mission` | POST | Claim monthly mission reward |
| `/api/quests/connect-wallet` | POST | Save wallet address, award one-time points |
| `/api/rewards/redeem` | POST | Redeem reward, deduct points, decrement stock |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- WalletConnect project ID (for Web3 features)

### Installation

```bash
git clone https://github.com/Jansenc08/moonquest-app.git
cd moonquest-app
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required due to peer dependency conflicts between Wagmi/RainbowKit and React 19. This does not affect runtime behavior.

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

### Vercel Deployment

1. Import the repository in Vercel
2. Set environment variables in project settings (see below)
3. Override the install command to: `npm install --legacy-peer-deps`

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

---

## Project Structure

```
moonquest-app/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── api/
│   │   ├── quests/
│   │   │   ├── spin/route.ts
│   │   │   ├── claim-mission/route.ts
│   │   │   └── connect-wallet/route.ts
│   │   └── rewards/
│   │       └── redeem/route.ts
│   ├── dashboard/
│   │   ├── actions.ts
│   │   └── ...
│   ├── profile/
│   ├── quests/
│   ├── rewards/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── quests/
│   ├── rewards/
│   ├── ui/
│   ├── Navbar.tsx
│   └── Web3Provider.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── auth.ts
│   └── utils.ts
└── README.md
```

---

## Known Considerations

- **`reactStrictMode: false`** in `next.config.ts` prevents double-invocation issues with Supabase Realtime and RainbowKit modals in development mode.

- **Daily Spin quest** is stored with `type='dummy'` and `title='Daily Spin'`. The UI detects this by title to render the spin wheel instead of a standard quest card.

- **SGT timezone (UTC+8)** is used throughout for all daily gate checks to ensure consistent reset times.

---

## Author

Jansen Castillo
