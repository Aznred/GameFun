# 🏙️ MEGAOPOLY

> **Monopoly × Mario Party × Cities Skylines**
> Next-generation 3D multiplayer board game

---

## 🎮 What is MEGAOPOLY?

MEGAOPOLY is a chaotic, strategic, hilarious 3D board game inspired by classic Monopoly but cranked up to 11.

- **72 tiles** across 8 districts on a 3D living city board
- **2–8 players** local hot seat or online multiplayer
- **8 unique characters** each with special abilities
- **4 card decks**: Chaos, Business, Crime, Government
- **13 building types**: from simple Houses to Space Launchpads
- **Dynamic economy**: property values fluctuate with events
- **Random city events**: UFO attacks, crypto crashes, tax reforms
- **Special dice**: Gold, Chaos, Teleport
- **Full 3D scene**: animated cars, buildings, day/night cycle

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- npm v9+

### Installation

```bash
# In the project directory
cd monop

# Install all dependencies
npm install

# Start the development server (game + multiplayer backend)
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## 🎯 How to Play

### Starting a Game
1. Enter your name on the lobby screen
2. Click **"🏙️ Local Multiplayer (Hot Seat)"** for 2-8 players on the same computer
3. Set the number of players and their names
4. Each player picks a character
5. The game begins!

### Turn Structure
1. **Roll Dice** — Click the big dice button
2. **Move** — Your token animates along the board
3. **Tile Action** — Buy property, pay rent, draw cards, etc.
4. **Build** — Construct buildings on your properties
5. **End Turn** — Next player goes

### Controls
| Action | Control |
|--------|---------|
| Rotate camera | Left click + drag |
| Pan camera | Right click + drag |
| Zoom | Scroll wheel |
| Reset camera | `R` key |
| Inspect tile | Click on any tile |
| Toggle leaderboard | 🏆 button |

---

## 🗺️ The Board

### Districts (color-coded)
| District | Color | Specialty |
|----------|-------|-----------|
| 🟣 Residential | Purple | Affordable, stable income |
| 🔵 Commercial | Blue | Medium risk, good returns |
| ⚫ Industrial | Gray | Reliable factory income |
| 🔵 Tech | Cyan | Expensive, huge potential |
| 🟡 Luxury | Gold | Premium rent, elite status |
| 🔴 Casino Strip | Red | Random income, high stakes |
| 🟢 Nature | Green | Eco income, event bonuses |
| ⬛ Underground | Dark | Crime bonuses, shady dealings |

### Special Tiles
- **GO** — Collect $200K every time you pass
- **Jail** — Just visiting (or serving time)
- **Go To Jail** — Immediately go to jail
- **Free Parking** — Collect all city fines
- **City Metro** — Buy for fast travel income
- **Stock Exchange** — Risk your cash for returns
- **Lottery** — Win random $20K–$500K
- **Black Market** — 60% profit, 40% raid
- **Investment Bank** — Invest for 1.5x return
- **Police Raid** — Lose a turn + $80K fine
- **Portal** — Teleport to another tile
- **Card Tiles** — Draw from special decks

---

## 👤 Characters

| Character | Ability | Passive |
|-----------|---------|---------|
| 🦆 Billionaire Duck | Lucky reroll | +10% GO salary |
| 🕴️ Shady Banker | Steal 15% income | Mortgage for 80% |
| ₿ Crypto Bro | Double Tech income 3 turns | +25% Tech rent |
| 🤌 Mafia Boss | Extort 20% cash | Immune to raids |
| 🦈 Real Estate Shark | Hostile takeover | Build extra level |
| 📸 Influencer | Viral moment — all pay | 20% Luxury discount |
| 🤓 Startup Nerd | Free startup build | Startups earn 3x |
| 😈 Evil Landlord | Triple rents 4 turns | +15% all rents |

---

## 🏗️ Buildings

| Building | Cost | Income Type |
|----------|------|-------------|
| 🏠 House | $80K | Stable |
| 🏢 Apartment | $200K | Stable ×3 |
| 🗼 Tower | $400K | Stable ×6 |
| 🏙️ Mega Tower | $800K | Stable ×12 |
| 🏨 Hotel | $250K | Stable ×4 |
| 🎰 Casino | $500K | Random $50K–$500K |
| 🪩 Nightclub | $180K | Stable ×2.5 |
| 🛍️ Shopping Mall | $350K | Stable + area boost |
| 🏭 Factory | $220K | Stable ×3.5 |
| 💻 Tech Startup | $300K | Risky — 30% chance $600K |
| ✈️ Airport | $700K | Stable ×5 |
| 🎡 Theme Park | $600K | +25% area rent |
| 🚀 Space Launchpad | $1.2M | 10% chance $2M jackpot |

---

## 🃏 Card Decks

### ⚡ Chaos Cards (15 cards)
Wild and unpredictable. Can bless or destroy you.
- UFO steals your buildings
- Money Printer Go Brrr (+$200K)
- Casino Night (double or halve your cash)
- Teleport to random tile

### 💼 Business Cards (12 cards)
Corporate strategy at its finest.
- Bull Market (rents ×2 for 3 turns)
- Free Build
- IPO Event (Startups pay $500K instantly)
- Audit the Richest

### 🔫 Crime Cards (10 cards)
Crime pays. Sometimes.
- Bank Heist (+$200K)
- Bribery (Get Out of Jail Free)
- Blackmail (steal a property)
- Money Laundering (3 turns tax exempt)

### 🏛️ Government Cards (12 cards)
The city council has opinions.
- Tax Reform (8% wealth tax everyone)
- Stimulus Package (+$100K everyone)
- Lockdown (nobody moves)
- Economic Collapse (-30% property values)

---

## 🌪️ Random Events (16 types)

Events trigger every few turns automatically:
- **Housing Bubble** — Values +40% (then crash)
- **Crypto Crash** — Tech district halved
- **UFO Attack** — Steals most valuable building
- **Lottery Jackpot** — Random player wins $500K
- **Rent Strike** — No rent collected 2 turns
- **AI Mayor** — Tax rates randomized for 4 turns
- **Bank Robbery** — Free parking pool doubles
- **Meteor Shower** — Random buildings destroyed

---

## 🌐 Online Multiplayer

1. One player clicks **"➕ Create Room"** — a room code is generated
2. Share the code with friends
3. Other players enter the code and click **"🔗 Join Room"**
4. Host clicks Start when everyone has joined

> The multiplayer server runs on `localhost:3001`. For online play across the internet, deploy the `server/` folder to a Node.js host (Railway, Render, etc.)

---

## 📁 Project Structure

```
monop/
├── package.json              # Dependencies
├── vite.config.js            # Frontend build config
├── index.html                # Main HTML + UI structure
├── server/
│   ├── index.js              # Express + Socket.io server
│   └── GameRoom.js           # Server-side room management
└── src/
    ├── main.js               # Entry point
    ├── constants/
    │   ├── tiles.js          # All 72 tile definitions
    │   ├── characters.js     # 8 character definitions
    │   └── buildings.js      # 13 building types
    ├── game/
    │   ├── Game.js           # Core game orchestrator
    │   └── EventSystem.js    # Random events
    ├── players/
    │   └── Player.js         # Player class + state
    ├── dice/
    │   └── DiceSystem.js     # Rolling + special dice
    ├── cards/
    │   └── CardSystem.js     # 4 card decks + effects
    ├── economy/
    │   └── EconomySystem.js  # Rent, values, market
    ├── renderer/
    │   ├── SceneManager.js   # Three.js 3D scene
    │   └── CameraController.js # Orbit camera
    ├── ui/
    │   └── UIManager.js      # All UI logic
    └── network/
        └── NetworkManager.js # Socket.io client
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Three.js** | 3D rendering, city board, animations |
| **Socket.io** | Real-time multiplayer |
| **Express** | HTTP server + room API |
| **Vite** | Fast dev server + bundling |
| **Vanilla JS (ES modules)** | Clean, no framework |

---

## 🎨 Extending the Game

### Add a new character
Edit `src/constants/characters.js` and add to the `CHARACTERS` array.

### Add a new building
Edit `src/constants/buildings.js` and add to `BUILDING_TYPES`.

### Add a new event
Edit `src/game/EventSystem.js` in the `RANDOM_EVENTS` array.

### Add a new card
Edit `src/cards/CardSystem.js` in the appropriate deck array, then handle the effect in `applyCard()`.

### Add a new tile type
Edit `src/constants/tiles.js` and `TILE_TYPES`, then handle it in `Game.js` `_triggerTileEffect()`.

---

## 🐛 Known Issues / TODO

- [ ] Full auction UI (bidding between players)
- [ ] Trade UI (property + cash offers between players)
- [ ] Sound effects system
- [ ] Mobile-optimized touch UI
- [ ] AI opponent system
- [ ] Replay / spectator mode
- [ ] Achievements system
- [ ] Seasonal map themes
- [ ] Cosmetic skins for tokens

---

## 📄 License

MIT — Build your own empire. 🏙️
