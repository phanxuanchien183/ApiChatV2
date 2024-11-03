const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        // origin: '*', // Chỉ cho phát triển
        origin: '*', // Chỉ cho phát triển
        methods: ['GET', 'POST'],
        credentials: true,
      },
  });

const rooms = ['Room1', 'Room2', 'Room3']; // Danh sách các phòng có sẵn

app.get('/', (req, res) => {
  res.send('Socket.io server is running');
});

app.get('/rooms', (req, res) => {
  res.json(rooms); // Gửi danh sách phòng
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
