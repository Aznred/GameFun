export interface GameMeta {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  players: string;
  duration: string;
  available: boolean;
  color: string;
}

export const GAMES: GameMeta[] = [
  { id: 'reaction', name: 'Reaction Game', icon: '⚡', tagline: 'Click when it turns red!', players: '2–10', duration: '1 min', available: true, color: '#f87171' },
  { id: 'meme-battle', name: 'Meme Battle', icon: '😂', tagline: 'Write the funniest caption', players: '2–10', duration: '2 min', available: true, color: '#fbbf24' },
  { id: 'truth-lie', name: 'Truth or Lie', icon: '🎭', tagline: 'Vote: true, false, or partial', players: '2–10', duration: '1 min', available: true, color: '#a78bfa' },
  { id: 'drawing-telephone', name: 'Drawing Telephone', icon: '✏️', tagline: 'Phrase → Draw → Guess chain', players: '4–10', duration: '5 min', available: false, color: '#4ade80' },
  { id: 'fake-answer', name: 'Fake Answer', icon: '🤥', tagline: 'Fibbage-style bluffing', players: '2–8', duration: '3 min', available: false, color: '#38bdf8' },
  { id: 'secret-word-impostor', name: 'Secret Word Impostor', icon: '🕵️', tagline: 'One impostor, one word', players: '3–8', duration: '5 min', available: false, color: '#818cf8' },
  { id: 'trivia-battle', name: 'Trivia Battle', icon: '🧠', tagline: 'Quiz + bet on others', players: '2–10', duration: '5 min', available: false, color: '#f472b6' },
  { id: 'bluff-battle', name: 'Bluff Battle', icon: '🃏', tagline: 'Coup / Among Us style', players: '3–8', duration: '10 min', available: false, color: '#fb923c' },
  { id: 'betting-game', name: 'Betting Game', icon: '🎲', tagline: 'Bet on random events', players: '2–10', duration: '2 min', available: false, color: '#22c55e' },
  { id: 'chaos-dice', name: 'Chaos Dice', icon: '🎲', tagline: 'Steal, swap, explode!', players: '2–8', duration: '3 min', available: false, color: '#e879f9' },
  { id: 'puzzle-race', name: 'Puzzle Race', icon: '🧩', tagline: 'First to finish wins', players: '2–10', duration: '2 min', available: false, color: '#0ea5e9' },
  { id: 'guess-the-rank', name: 'Guess the Rank', icon: '📊', tagline: 'Order items correctly', players: '2–10', duration: '3 min', available: false, color: '#64748b' },
  { id: 'bomb-game', name: 'Bomb Game', icon: '💣', tagline: 'Cut wires, find saboteurs', players: '4–8', duration: '5 min', available: false, color: '#ef4444' },
  { id: 'fast-werewolf', name: 'Fast Werewolf', icon: '🐺', tagline: 'Quick werewolf rounds', players: '4–10', duration: '10 min', available: false, color: '#7c3aed' },
];

export const AVATARS = ['🐮', '🐷', '🦊', '🐺', '🦁', '🐯', '🐸', '🐧', '🦉', '🐙', '🦄', '🐲'];
