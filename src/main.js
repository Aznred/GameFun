// ============================================================
//  MEGAOPOLY CLIENT — Main entry point
// ============================================================

import * as THREE from 'three';
import { io } from 'socket.io-client';
import { TILES, T, CHARACTERS, BUILDINGS, tilePos, getTile } from './constants.js';

// ── State ───────────────────────────────────────────────────
let scene, camera, renderer, boardGroup;
let socket = null;
let roomId = null;
let gameState = null;
let players = [];
let myPlayerId = null;
let isLocalGame = false;
let localPlayers = [];
let localGameState = null;
let currentCharSelectPlayerIdx = 0;

// ── Init 3D Scene ───────────────────────────────────────────
function initScene() {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 25, 25);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lights
  const ambient = new THREE.AmbientLight(0x404060, 0.6);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  // Board tiles
  boardGroup = new THREE.Group();
  for (let i = 0; i < TILES.length; i++) {
    const tile = TILES[i];
    const pos = tilePos(i);
    const geom = new THREE.PlaneGeometry(1.8, 1.2);
    const mat = new THREE.MeshBasicMaterial({
      color: tile.hex || 0x333333,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(pos.x, 0, pos.z);
    mesh.rotation.x = -Math.PI / 2;
    mesh.userData = { tileId: i };
    boardGroup.add(mesh);
  }
  scene.add(boardGroup);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}

// ── Lobby UI ───────────────────────────────────────────────
function setupLobby() {
  const btnCreateLocal = document.getElementById('btn-create-local');
  const btnCreateOnline = document.getElementById('btn-create-online');
  const btnJoinOnline = document.getElementById('btn-join-online');
  const btnBackLobby = document.getElementById('btn-back-lobby');
  const btnStartLocal = document.getElementById('btn-start-local');
  const numPlayers = document.getElementById('num-players');
  const playerNamesContainer = document.getElementById('player-names-container');
  const lobby = document.getElementById('lobby');
  const localSetup = document.getElementById('local-setup');

  btnCreateLocal?.addEventListener('click', () => {
    lobby.style.display = 'none';
    localSetup.style.display = 'flex';
    updatePlayerNamesInputs();
  });

  numPlayers?.addEventListener('change', updatePlayerNamesInputs);

  function updatePlayerNamesInputs() {
    const n = parseInt(numPlayers?.value || '4', 10);
    playerNamesContainer.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const div = document.createElement('div');
      div.className = 'input-group';
      div.innerHTML = `
        <label>Player ${i + 1} Name</label>
        <input type="text" data-player-idx="${i}" placeholder="Player ${i + 1}" maxlength="20" value="Player ${i + 1}" />
      `;
      playerNamesContainer.appendChild(div);
    }
  }

  btnBackLobby?.addEventListener('click', () => {
    localSetup.style.display = 'none';
    lobby.style.display = 'flex';
  });

  btnStartLocal?.addEventListener('click', () => {
    const n = parseInt(numPlayers?.value || '4', 10);
    localPlayers = [];
    for (let i = 0; i < n; i++) {
      const input = playerNamesContainer.querySelector(`input[data-player-idx="${i}"]`);
      localPlayers.push({
        id: `local-${i}`,
        name: input?.value || `Player ${i + 1}`,
        characterId: null,
      });
    }
    localSetup.style.display = 'none';
    showCharacterSelect(0);
  });

  btnCreateOnline?.addEventListener('click', () => {
    const name = document.getElementById('player-name')?.value?.trim() || 'Player';
    if (!socket) socket = io(window.location.origin, { path: '/socket.io' });
    socket.emit('create_room', { playerName: name }, (res) => {
      if (res?.success) {
        roomId = res.roomId;
        myPlayerId = socket.id;
        lobby.style.display = 'none';
        document.getElementById('room-code').value = res.roomId;
        document.getElementById('char-select').style.display = 'flex';
        document.getElementById('char-select').style.flexDirection = 'column';
        document.getElementById('char-select').style.justifyContent = 'center';
        document.getElementById('char-select').style.alignItems = 'center';
        showCharacterSelect(0, res.room?.players);
      }
    });
  });

  btnJoinOnline?.addEventListener('click', () => {
    const code = document.getElementById('room-code')?.value?.trim()?.toUpperCase();
    const name = document.getElementById('player-name')?.value?.trim() || 'Player';
    if (!code) return alert('Enter room code');
    if (!socket) socket = io(window.location.origin, { path: '/socket.io' });
    socket.emit('join_room', { roomId: code, playerName: name }, (res) => {
      if (res?.success) {
        roomId = res.roomId;
        myPlayerId = socket.id;
        lobby.style.display = 'none';
        showCharacterSelect(res.room.players.findIndex(p => p.id === socket.id), res.room.players);
      } else {
        alert(res?.error || 'Failed to join');
      }
    });
  });
}

// ── Character Select ────────────────────────────────────────
function showCharacterSelect(playerIdx, roomPlayers) {
  const charSelect = document.getElementById('char-select');
  const charGrid = document.getElementById('char-grid');
  const charPrompt = document.getElementById('char-select-prompt');
  const btnConfirm = document.getElementById('btn-confirm-char');

  charSelect.style.display = 'flex';
  charSelect.style.flexDirection = 'column';
  charSelect.style.justifyContent = 'center';
  charSelect.style.alignItems = 'center';

  const players = roomPlayers || localPlayers;
  const player = players[playerIdx];
  currentCharSelectPlayerIdx = playerIdx;

  charPrompt.textContent = `${player?.name || 'Player'} — Choose your character`;

  charGrid.innerHTML = '';
  let selectedId = null;
  CHARACTERS.forEach((c) => {
    const card = document.createElement('div');
    card.className = 'char-card';
    card.innerHTML = `
      <div class="char-emoji">${c.emoji}</div>
      <div class="char-name">${c.name}</div>
      <div class="char-ability">${c.passive}</div>
    `;
    card.addEventListener('click', () => {
      charGrid.querySelectorAll('.char-card').forEach((el) => el.classList.remove('selected'));
      card.classList.add('selected');
      selectedId = c.id;
      btnConfirm.disabled = false;
    });
    charGrid.appendChild(card);
  });

  btnConfirm.disabled = true;
  btnConfirm.onclick = () => {
    if (!selectedId) return;
    if (roomPlayers) {
      socket?.emit('select_character', { characterId: selectedId });
      const nextIdx = playerIdx + 1;
      if (nextIdx < roomPlayers.length) {
        showCharacterSelect(nextIdx, roomPlayers);
      } else {
        charSelect.style.display = 'none';
        document.getElementById('hud').style.display = 'block';
      }
    } else {
      localPlayers[playerIdx].characterId = selectedId;
      const nextIdx = playerIdx + 1;
      if (nextIdx < localPlayers.length) {
        showCharacterSelect(nextIdx);
      } else {
        charSelect.style.display = 'none';
        startLocalGame();
      }
    }
  };
}

// ── Local Game ──────────────────────────────────────────────
function startLocalGame() {
  isLocalGame = true;
  localGameState = {
    turn: 0,
    currentPlayerIdx: 0,
    phase: 'roll',
    players: localPlayers.map((p) => ({
      id: p.id,
      name: p.name,
      characterId: p.characterId || 'duck',
      money: 2000000,
      tileId: 0,
      properties: [],
      buildings: {},
      isBankrupt: false,
    })),
  };
  gameState = localGameState;
  players = localPlayers;
  document.getElementById('hud').style.display = 'block';
  updateGameUI();
}

// ── Socket Events (Online) ──────────────────────────────────
function setupSocketEvents() {
  if (!socket) return;
  socket.on('room_updated', ({ room }) => {
    players = room.players;
  });
  socket.on('game_started', ({ gameState: gs, players: p }) => {
    gameState = gs;
    players = p;
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('char-select').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    updateGameUI();
  });
  socket.on('game_action_result', ({ gameState: gs }) => {
    gameState = gs;
    updateGameUI();
  });
  socket.on('player_left', ({ room }) => {
    players = room.players;
  });
}

// ── Game UI Update ──────────────────────────────────────────
function updateGameUI() {
  if (!gameState) return;
  const gs = gameState;
  const current = gs.players[gs.currentPlayerIdx];
  const isMyTurn = isLocalGame ? true : current?.id === myPlayerId;

  document.getElementById('current-player-name').textContent = current?.name || '—';
  document.getElementById('turn-phase').textContent =
    gs.phase === 'roll' ? ' · Roll the dice' : ' · Take action';

  const die1 = document.getElementById('die1');
  const die2 = document.getElementById('die2');
  if (gs.lastRoll) {
    die1.textContent = gs.lastRoll.d1;
    die2.textContent = gs.lastRoll.d2;
  } else {
    die1.textContent = '?';
    die2.textContent = '?';
  }

  document.getElementById('btn-roll').disabled = !isMyTurn || gs.phase !== 'roll';
  document.getElementById('btn-end-turn').disabled = !isMyTurn || gs.phase !== 'action';

  const tile = getTile(current?.tileId || 0);
  document.getElementById('btn-buy').style.display =
    isMyTurn && gs.phase === 'action' && tile?.type === T.PROP && !current?.properties?.includes(current.tileId)
      ? 'block'
      : 'none';

  // Players panel
  const panel = document.getElementById('players-panel');
  panel.innerHTML = '';
  gs.players.forEach((p, i) => {
    const char = CHARACTERS.find((c) => c.id === (p.characterId || 'duck'));
    const card = document.createElement('div');
    card.className = 'player-card' + (i === gs.currentPlayerIdx ? ' active' : '') + (p.isBankrupt ? ' bankrupt' : '');
    card.innerHTML = `
      <div class="player-card-header">
        <span class="player-avatar">${char?.emoji || '👤'}</span>
        <div class="player-info">
          <div class="player-card-name">${p.name}</div>
          <div class="player-money ${p.money < 500000 ? 'low' : ''}">$${(p.money / 1000).toFixed(0)}K</div>
          <div class="player-props">${p.properties?.length || 0} properties</div>
        </div>
      </div>
    `;
    panel.appendChild(card);
  });

  if (gs.winner) {
    const winner = gs.players.find((p) => p.id === gs.winner);
    document.getElementById('winner-screen').style.display = 'flex';
    document.getElementById('winner-name').textContent = winner?.name || 'Winner';
    document.getElementById('winner-money').textContent = `$${(winner?.money / 1000).toFixed(0)}K`;
  }
}

// ── Game Actions ────────────────────────────────────────────
function setupGameActions() {
  document.getElementById('btn-roll')?.addEventListener('click', () => {
    if (isLocalGame) {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2;
      const p = localGameState.players[localGameState.currentPlayerIdx];
      p.tileId = (p.tileId + total) % 40;
      if (p.tileId + total >= 40) p.money += 200000;
      localGameState.phase = 'action';
      localGameState.lastRoll = { d1, d2, total, isDoubles: d1 === d2 };
      updateGameUI();
    } else {
      socket?.emit('game_action', { roomId, action: 'roll_dice', data: {} });
    }
  });

  document.getElementById('btn-buy')?.addEventListener('click', () => {
    const p = gameState.players[gameState.currentPlayerIdx];
    const tile = getTile(p.tileId);
    if (!tile?.price) return;
    if (isLocalGame) {
      p.money -= tile.price;
      p.properties.push(p.tileId);
      updateGameUI();
    } else {
      socket?.emit('game_action', {
        roomId,
        action: 'buy_property',
        data: { tileId: p.tileId, price: tile.price },
      });
    }
  });

  document.getElementById('btn-end-turn')?.addEventListener('click', () => {
    if (isLocalGame) {
      localGameState.turn++;
      localGameState.currentPlayerIdx =
        (localGameState.currentPlayerIdx + 1) % localGameState.players.length;
      localGameState.phase = 'roll';
      localGameState.lastRoll = null;
      updateGameUI();
    } else {
      socket?.emit('game_action', { roomId, action: 'end_turn', data: {} });
    }
  });

  document.getElementById('btn-play-again')?.addEventListener('click', () => {
    document.getElementById('winner-screen').style.display = 'none';
    document.getElementById('lobby').style.display = 'flex';
    document.getElementById('hud').style.display = 'none';
    gameState = null;
  });

  document.getElementById('btn-toggle-leaderboard')?.addEventListener('click', () => {
    const lb = document.getElementById('leaderboard');
    lb.style.display = lb.style.display === 'none' ? 'block' : 'none';
  });
}

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScene();
  setupLobby();
  setupSocketEvents();
  setupGameActions();
});
