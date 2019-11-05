const DEVICE_QUEUE = [];
const SECRET_CODE_STORAGE = {};
const USER_NAMES = {};
const ALL_DEVICES = {};

const findDevice = (socket, token) => {
  if (DEVICE_QUEUE.length) {
    console.log('CONNECT!!, CONNECT!!, CONNECT!!');
    const ANOTHER_DEVICE = DEVICE_QUEUE.pop();
    const SECRET_CODE = token;

    socket.join(SECRET_CODE);
    ANOTHER_DEVICE.join(SECRET_CODE);

    SECRET_CODE_STORAGE[socket.id] = SECRET_CODE;
    SECRET_CODE_STORAGE[ANOTHER_DEVICE.id] = SECRET_CODE;

    socket.emit('connecting message', true);
    ANOTHER_DEVICE.emit('connecting message', true);
    // ANOTHER_DEVICE.emit('enter message', { username: USER_NAMES[socket.id] });
    // socket.emit('enter message', { username: USER_NAMES[ANOTHER_DEVICE.id] });
  } else {
    console.log('CONNECT!!');
    DEVICE_QUEUE.push(socket);
    socket.emit('connecting message', false);
  }
};

const connectSocket = io => {
  io.on('connection', socket => {
    console.log('socket connecting');
    socket.on('connect device', token => {
      ALL_DEVICES[socket.id] = socket;
      findDevice(socket, token);
    });

    socket.on('join room', ({ username }) => {
      USER_NAMES[socket.id] = username;
      ALL_DEVICES[socket.id] = socket;
      findDevice(socket);
    });

    socket.on('is typing', () => {
      const ROOM = SECRET_CODE_STORAGE[socket.id];
      socket.broadcast.to(ROOM).emit('typing');
    });

    socket.on('send', messageData => {
      const ROOM = SECRET_CODE_STORAGE[socket.id];
      io.to(ROOM).emit('send message', messageData);
    });

    socket.on('leave room', () => {
      const ROOM = SECRET_CODE_STORAGE[socket.id];
      socket.broadcast
        .to(ROOM)
        .emit('chat end', { username: USER_NAMES[socket.id] });
      socket.leave(ROOM);
      let peerId = ROOM.split('#');
      peerId = peerId[0] === socket.id ? peerId[1] : peerId[0];

      findDevice(ALL_DEVICES[peerId]);
      findDevice(socket);
    });

    socket.on('exit room', () => {
      const ROOM = SECRET_CODE_STORAGE[socket.id];
      socket.broadcast.to(ROOM).emit('exit chat');
      socket.leave(ROOM);
    });

    socket.on('disconnect', () => {
      console.log('Disconnect');
    });
  });
};

module.exports = connectSocket;
