# Party Games Platform

Multiplayer party games platform — Jackbox / Gartic Phone / Skribbl.io style.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, Zustand, Framer Motion
- **Backend**: Node.js, Express, Socket.io, TypeScript
- **Shared**: Types and game logic

## Quick Start

```bash
npm run install:all   # Install dependencies
npm run dev:server    # Start server (port 3001)
npm run dev:client    # Start client (port 5174)
```

Or from root: `npm run dev` (starts both).

## Features

- **Room system**: Create room, join with code, 2–10 players
- **Lobby**: Avatars, ready status, host controls (kick, start)
- **Game hub**: Choose next game, view history, start
- **3 playable games**:
  - **Reaction Game** — Click when screen turns red
  - **Meme Battle** — Write captions, vote for funniest
  - **Truth or Lie** — Vote on story truthfulness

## Game Cards (Coming Soon)

- Drawing Telephone
- Fake Answer (Fibbage)
- Secret Word Impostor
- Trivia Battle
- Bluff Battle
- Betting Game
- Chaos Dice
- Puzzle Race
- Guess the Rank
- Bomb Game
- Fast Werewolf

## Structure

```
party-games-platform/
  client/     # React + Vite
  server/     # Express + Socket.io
  shared/     # Types
```
