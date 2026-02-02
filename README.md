# ⚽ Football Auction Game

A modern, interactive web-based football strategy game where two players compete head-to-head in a live football player auction.

## 🎮 Features

- **Real-time Bidding**: Live auction system with Socket.IO
- **$1B Budget**: Each player starts with $1 billion to build their squad
- **749 Players**: Real football player data with stats and images
- **Strategic Gameplay**: Balance your budget across 11 squad positions
- **Dark Mode UI**: FIFA/Football Manager inspired design
- **Scoring System**: Team score based on ratings, position balance, and synergy
- **Responsive Design**: Works on desktop and mobile

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Real-time**: Socket.IO
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to the project folder
cd football_action

# Install dependencies
npm install

# Start the development servers (Next.js + Socket.IO)
npm run dev
```

This will start:
- **Next.js** on http://localhost:3000
- **Socket.IO Server** on http://localhost:3001

### Player Data

The game uses player data from the `auction-game-data` folder. Make sure you have run the migration script to populate the data:

```bash
cd ../football-player-data-set/auction-game-data
npm install
npm run migrate
```

## 🎯 How to Play

1. **Create or Join a Room**
   - Enter your name
   - Create a new room or join with a room code

2. **Wait for Opponent**
   - Share the room code with a friend
   - Both players must click "Ready"

3. **Auction Phase**
   - Players are presented one at a time
   - Place bids in real-time
   - Highest bidder wins the player
   - Timer counts down for each auction

4. **Build Your Squad**
   - Draft 11 players within your budget
   - Balance positions (GK, DEF, MID, ATT)
   - Consider synergy (same nation/club bonuses)

5. **Final Score**
   - Average Rating × 0.5
   - Position Balance × 0.3
   - Synergy × 0.2

---

## 🔐 Admin Panel (Players CRUD & Image Upload)

You can manage players directly from the admin panel.

- Route: `/admin` in the app (e.g., http://localhost:3000/admin)
- Protected by an admin token set with the `ADMIN_TOKEN` environment variable.
- Endpoints (server-side):
  - `GET /api/admin/players` — list players (pagination supported)
  - `POST /api/admin/players` — create player
  - `GET /api/admin/players/:id` — get single player
  - `PUT /api/admin/players/:id` — update player
  - `DELETE /api/admin/players/:id` — delete player
  - `POST /api/admin/players/upload` — upload player face image (multipart/form-data)

Setup:
1. Add `ADMIN_TOKEN` to your `.env` (the repo contains a placeholder `ADMIN_TOKEN=change-me`).
2. Install new dependencies: `npm install` (adds `mongodb` and `cloudinary`).
3. Run the app: `npm run dev` and visit `/admin` to sign in with your token.

Note: This panel uses MongoDB for persistent player storage and Cloudinary for image hosting.

## 📁 Project Structure

```
football_action/
├── src/
│   ├── app/
│   │   ├── game/[roomId]/page.tsx  # Game room
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Home/lobby
│   │   └── globals.css
│   ├── components/
│   │   ├── game/
│   │   │   ├── AuctionStage.tsx    # Main auction UI
│   │   │   ├── BidPanel.tsx        # Bidding controls
│   │   │   ├── GameResult.tsx      # End game screen
│   │   │   ├── Lobby.tsx           # Pre-game lobby
│   │   │   └── PlayerCard.tsx      # Player display card
│   │   └── ui/
│   │       └── Notification.tsx
│   ├── lib/
│   │   ├── socket.ts               # Socket.IO client
│   │   └── utils.ts                # Utility functions
│   ├── stores/
│   │   └── gameStore.ts            # Zustand game state
│   └── types/
│       └── index.ts                # TypeScript types
├── server.js                        # Socket.IO server
├── package.json
├── tailwind.config.js
└── next.config.js
```

## 🎨 UI Components

### Player Card
- Displays player image, rating, position
- Rarity-based styling (legendary, epic, rare)
- Stats display option
- Spotlight animation for auctions

### Auction Stage
- Real-time bid feed
- Countdown timer with visual ring
- Quick bid buttons (+1M, +5M, +10M, +25M)
- Custom bid slider
- Live squad slots

### Game Result
- Winner announcement with animations
- Score breakdown comparison
- MVP showcase
- Game statistics

## 🔧 Configuration

### Game Settings (in `server.js`)

```javascript
const DEFAULT_SETTINGS = {
  startingBudget: 1000000000,  // $1 billion
  squadSize: 11,               // Players per team
  auctionTimeLimit: 30,        // Seconds per auction
  minBidIncrement: 1000000,    // $1 million minimum
  totalPlayers: 22,            // Total auctions
};
```

## 📝 Scoring Algorithm

```javascript
// Position Balance
const idealPositions = { GK: 1, DEF: 4, MID: 3, ATT: 3 };

// Synergy Bonuses
- 3+ players from same nation: +5 per extra player
- 2+ players from same club: +10 per extra player

// Final Score
finalScore = (avgRating × 0.5) + (positionBalance × 0.3) + (synergy × 0.2)
```

## 🤝 Contributing

Feel free to contribute! Open issues and pull requests are welcome.

## 📄 License

MIT License
