/* ===========================================================
   SMITTEDROP — сервер дуелей.
   Дає змогу двом реальним гравцям грати разом:
   - хост створює кімнату → отримує ПОСИЛАННЯ і КОД
   - другий гравець переходить за посиланням або вводить КОД
   - сервер сам "крутить" кейси (чесно, однаково для обох)
     і синхронно шле результати кожного раунду обом гравцям
=========================================================== */
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const GameData = require('./public/gameData.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (req, res) => res.json({ ok: true, rooms: rooms.size }));

const PORT = process.env.PORT || 3000;

/** @type {Map<string, Room>} */
const rooms = new Map();

function makeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // без плутаних символів (0/O, 1/I)
  let code;
  do {
    code = Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function publicRoomState(room) {
  return {
    code: room.code,
    status: room.status,
    caseId: room.caseId,
    rounds: room.rounds,
    players: room.playerOrder.map(id => ({
      id,
      name: room.players[id].name,
      isHost: id === room.hostId,
      ready: room.players[id].ready,
      connected: room.players[id].connected,
    })),
  };
}

function broadcastState(room) {
  io.to(room.code).emit('duel:state', publicRoomState(room));
}

function cleanupRoom(room) {
  if (room.playerOrder.length === 0) {
    rooms.delete(room.code);
  }
}

io.on('connection', (socket) => {

  socket.on('duel:create', ({ name }) => {
    const code = makeCode();
    const room = {
      code,
      hostId: socket.id,
      playerOrder: [socket.id],
      players: { [socket.id]: { name: (name || 'Гравець 1').slice(0, 20), ready: false, connected: true } },
      caseId: GameData.CASES[1].id, // стартовий кейс за замовчуванням
      rounds: 3,
      status: 'waiting', // waiting -> ready -> battling -> done
    };
    rooms.set(code, room);
    socket.join(code);
    socket.data.room = code;
    socket.emit('duel:created', { code });
    broadcastState(room);
  });

  socket.on('duel:join', ({ code, name }) => {
    code = (code || '').toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) return socket.emit('duel:error', { message: 'Кімнату з таким кодом не знайдено.' });
    if (room.playerOrder.length >= 2 && !room.players[socket.id]) {
      return socket.emit('duel:error', { message: 'Ця дуель вже заповнена (2/2 гравці).' });
    }
    if (!room.players[socket.id]) {
      room.playerOrder.push(socket.id);
      room.players[socket.id] = { name: (name || 'Гравець 2').slice(0, 20), ready: false, connected: true };
    }
    socket.join(code);
    socket.data.room = code;
    socket.emit('duel:joined', { code });
    broadcastState(room);
  });

  socket.on('duel:configure', ({ caseId, rounds }) => {
    const room = rooms.get(socket.data.room);
    if (!room || room.hostId !== socket.id || room.status !== 'waiting') return;
    if (GameData.getCase(caseId)) room.caseId = caseId;
    if ([1, 3, 5, 7].includes(rounds)) room.rounds = rounds;
    broadcastState(room);
  });

  socket.on('duel:ready', ({ ready }) => {
    const room = rooms.get(socket.data.room);
    if (!room || !room.players[socket.id]) return;
    room.players[socket.id].ready = !!ready;
    broadcastState(room);

    const allReady = room.playerOrder.length === 2 && room.playerOrder.every(id => room.players[id].ready);
    if (allReady && room.status === 'waiting') {
      startDuel(room);
    }
  });

  socket.on('duel:leave', () => leaveRoom(socket));
  socket.on('disconnect', () => leaveRoom(socket));

  function leaveRoom(sock) {
    const code = sock.data.room;
    if (!code) return;
    const room = rooms.get(code);
    if (!room) return;
    if (room.players[sock.id]) {
      room.players[sock.id].connected = false;
    }
    io.to(code).emit('duel:opponent-left');
    room.playerOrder = room.playerOrder.filter(id => id !== sock.id);
    delete room.players[sock.id];
    if (room.hostId === sock.id && room.playerOrder.length > 0) {
      room.hostId = room.playerOrder[0];
    }
    sock.leave(code);
    sock.data.room = null;
    if (room.playerOrder.length === 0) {
      rooms.delete(code);
    } else {
      room.status = 'waiting';
      Object.values(room.players).forEach(p => p.ready = false);
      broadcastState(room);
    }
  }
});

function startDuel(room) {
  room.status = 'battling';
  const caseObj = GameData.getCase(room.caseId);
  const totals = {};
  room.playerOrder.forEach(id => totals[id] = 0);

  io.to(room.code).emit('duel:starting', { caseId: room.caseId, rounds: room.rounds, caseName: caseObj.name, price: caseObj.price });

  let round = 0;
  function nextRound() {
    round++;
    const drops = {};
    room.playerOrder.forEach(id => {
      const item = GameData.rollCase(caseObj);
      drops[id] = item;
      totals[id] += item.value;
    });
    io.to(room.code).emit('duel:round', { round, drops, totals: { ...totals } });

    if (round >= room.rounds) {
      setTimeout(() => finishDuel(room, totals), 900);
    } else {
      setTimeout(nextRound, 900);
    }
  }
  setTimeout(nextRound, 600);
}

function finishDuel(room, totals) {
  room.status = 'done';
  const [a, b] = room.playerOrder;
  let winnerId = null;
  if (a != null && b != null) {
    if (totals[a] > totals[b]) winnerId = a;
    else if (totals[b] > totals[a]) winnerId = b;
    // рівний рахунок -> нічия, winnerId лишається null
  }
  io.to(room.code).emit('duel:finished', { totals, winnerId });
  room.playerOrder.forEach(id => { room.players[id].ready = false; });
  broadcastState(room);
}

server.listen(PORT, () => {
  console.log(`SMITTEDROP duel server running on port ${PORT}`);
});
