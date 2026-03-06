# 🐮 6 qui prend! — Multijoueur en ligne

Implémentation complète en ligne du jeu de cartes **6 qui prend!** (aussi connu sous le nom *6 nimmt!*), jouable en multijoueur avec un système de salles par code.

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 18 · TypeScript · Vite · TailwindCSS · Zustand · Framer Motion |
| **Backend** | Node.js · Express · Socket.io · TypeScript |
| **Partagé** | Module TypeScript commun (logique de jeu, types) |
| **Déploiement** | Docker · Docker Compose |

---

## Démarrage rapide (local)

### Prérequis
- Node.js ≥ 18
- npm ≥ 9

### Installation et lancement

```bash
# Depuis le dossier six-qui-prend/
cd six-qui-prend

# 1. Installer les dépendances
npm install --prefix server
npm install --prefix client

# 2. Démarrer le serveur (terminal 1)
npm run dev:server

# 3. Démarrer le client (terminal 2)
npm run dev:client
```

Ouvrez ensuite **http://localhost:5173** dans votre navigateur.

Pour jouer en multijoueur local, ouvrez l'URL dans plusieurs onglets ou sur d'autres appareils du même réseau en remplaçant `localhost` par votre IP locale.

---

## Docker

```bash
# Construire et lancer les deux services
docker-compose up --build

# Frontend : http://localhost:5173
# Backend  : http://localhost:3001
```

---

## Tests unitaires

```bash
cd server
npm install
npm test
```

Les tests couvrent :
- Calcul des têtes de bœuf
- Génération du deck
- Initialisation du jeu
- Logique de placement des cartes
- Capture de rangée
- Fin de partie

---

## Règles du jeu

1. **Mise en place** : Chaque joueur reçoit 10 cartes. 4 rangées de 1 carte sont posées sur la table.
2. **Tour** : Tous les joueurs choisissent simultanément une carte à jouer.
3. **Révélation** : Les cartes sont placées en ordre croissant dans les rangées.
4. **Placement** : Une carte doit aller dans la rangée dont la dernière carte est la plus proche valeur inférieure.
5. **Capture** : Si une rangée atteint 6 cartes, le joueur récupère les 5 premières et marque leurs têtes de bœuf.
6. **Carte trop basse** : Si une carte est inférieure à toutes les rangées, le joueur doit choisir quelle rangée récupérer.
7. **Fin** : Après 10 manches, le joueur avec le moins de têtes de bœuf gagne !

### Décompte des têtes de bœuf
| Carte | Têtes de bœuf |
|-------|--------------|
| 55 | 7 🐂 |
| Multiple de 11 | 5 🐂 |
| Multiple de 10 | 3 🐂 |
| Multiple de 5 | 2 🐂 |
| Autres | 1 🐂 |

---

## Architecture

```
six-qui-prend/
├── shared/
│   ├── types.ts          # Types partagés (Card, Player, GameState, Socket events…)
│   └── gameLogic.ts      # Logique pure du jeu (deck, placement, scoring…)
│
├── server/
│   └── src/
│       ├── game/
│       │   └── GameManager.ts     # Gestion de l'état de jeu, résolution des tours
│       ├── rooms/
│       │   └── RoomManager.ts     # Cycle de vie des salles, lobby
│       ├── sockets/
│       │   └── socketHandler.ts   # Mapping événements Socket.io
│       └── index.ts               # Point d'entrée Express + Socket.io
│
└── client/
    └── src/
        ├── components/
        │   ├── Card.tsx            # Carte visuelle avec têtes de bœuf
        │   ├── GameRow.tsx         # Rangée de jeu interactive
        │   ├── PlayerHand.tsx      # Main du joueur avec sélection
        │   ├── Scoreboard.tsx      # Tableau des scores en temps réel
        │   ├── Chat.tsx            # Chat en temps réel
        │   ├── RoundResultOverlay  # Résultats de manche animés
        │   └── RowSelector.tsx     # Modal de sélection de rangée
        ├── pages/
        │   ├── HomePage.tsx        # Créer / rejoindre une salle
        │   ├── LobbyPage.tsx       # Salon d'attente
        │   ├── GamePage.tsx        # Table de jeu principale
        │   └── ResultsPage.tsx     # Classement final
        ├── socket/socket.ts        # Client Socket.io
        └── store/gameStore.ts      # État global Zustand
```

---

## Fonctionnalités

- ✅ Système de salles avec code d'invitation
- ✅ Lobby avec statut "prêt" et contrôles du créateur
- ✅ Logique de jeu complète et fidèle aux règles officielles
- ✅ Sélection de rangée interactive pour les cartes trop basses
- ✅ Animations fluides (Framer Motion)
- ✅ Chat en temps réel dans le lobby et en jeu
- ✅ Reconnexion automatique
- ✅ Expulsion de joueurs
- ✅ Design responsive mobile
- ✅ Tests unitaires de la logique de jeu
- ✅ Support Docker
