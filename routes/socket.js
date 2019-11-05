const USER_QUEUE = [];
const ROOM_STORAGE = {};
const USER_NAMES = {};
const ALL_USERS = {};

const findPeer = socket => {
  if (USER_QUEUE.length) {
    const PEER = USER_QUEUE.pop();
    const ROOM = `${socket.id}#${PEER.id}`;

    socket.join(ROOM);
    PEER.join(ROOM);

    ROOM_STORAGE[socket.id] = ROOM;
    ROOM_STORAGE[PEER.id] = ROOM;

    PEER.emit('wait message', true);
    PEER.emit('enter message', { username: USER_NAMES[socket.id] });
    socket.emit('enter message', { username: USER_NAMES[PEER.id] });
  } else {
    USER_QUEUE.push(socket);
    socket.emit('wait message', false);
  }
};

const connectSocket = io => {
  io.on('connection', socket => {
    socket.on('join room', ({ username }) => {
      USER_NAMES[socket.id] = username;
      ALL_USERS[socket.id] = socket;
      findPeer(socket);
    });

    socket.on('is typing', () => {
      const ROOM = ROOM_STORAGE[socket.id];
      socket.broadcast.to(ROOM).emit('typing');
    });

    socket.on('send', messageData => {
      const ROOM = ROOM_STORAGE[socket.id];
      io.to(ROOM).emit('send message', messageData);
    });

    socket.on('leave room', () => {
      const ROOM = ROOM_STORAGE[socket.id];
      socket.broadcast
        .to(ROOM)
        .emit('chat end', { username: USER_NAMES[socket.id] });
      socket.leave(ROOM);
      let peerId = ROOM.split('#');
      peerId = peerId[0] === socket.id ? peerId[1] : peerId[0];

      findPeer(ALL_USERS[peerId]);
      findPeer(socket);
    });

    socket.on('exit room', () => {
      const ROOM = ROOM_STORAGE[socket.id];
      socket.broadcast.to(ROOM).emit('exit chat');
      socket.leave(ROOM);
    });

    socket.on('disconnect', () => {
      console.log('Disconnect');
    });
  });
};

module.exports = connectSocket;
