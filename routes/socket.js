const DEVICE_QUEUE = [];
const SECRET_CODE_STORAGE = {};
const ALL_DEVICES = {};

const findAnotherDevice = (socket, token) => {
  if (DEVICE_QUEUE.length) {
    console.log('MULTIPLE CONNECT!!');
    const ANOTHER_DEVICE = DEVICE_QUEUE.pop();
    const SECRET_CODE = token;

    socket.join(SECRET_CODE);
    ANOTHER_DEVICE.join(SECRET_CODE);

    SECRET_CODE_STORAGE[socket.id] = SECRET_CODE;
    SECRET_CODE_STORAGE[ANOTHER_DEVICE.id] = SECRET_CODE;

    socket.emit('connecting message', true);
    ANOTHER_DEVICE.emit('connecting message', true);
  } else {
    console.log('ONE CONNECT!!');
    DEVICE_QUEUE.push(socket);
    socket.emit('connecting message', false);
  }
};

const connectSocket = io => {
  io.on('connection', socket => {
    console.log('socket connecting');
    socket.on('connect device', token => {
      ALL_DEVICES[socket.id] = socket;

      findAnotherDevice(socket, token);
    });

    socket.on('start game', isStart => {
      const SECRET_CODE = SECRET_CODE_STORAGE[socket.id];

      io.to(SECRET_CODE).emit('game start', isStart);
    });

    socket.on('move airplane', direction => {
      const SECRET_CODE = SECRET_CODE_STORAGE[socket.id];

      socket.broadcast.to(SECRET_CODE).emit('airplane moving', direction);
    });

    socket.on('disconnect', () => {
      console.log('Disconnect');
    });
  });
};

module.exports = connectSocket;
