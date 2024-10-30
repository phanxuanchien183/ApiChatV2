const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Cấu hình CORS cho Socket.io
// const io = new Server(server, {
//     cors: {
//       origin: ['http://localhost:3000', 'https://chat-client-topaz-two.vercel.app'], // Cho phép cả localhost và Vercel
//       methods: ['GET', 'POST'],
//       allowedHeaders: ['my-custom-header'],
//       credentials: true,
//     },
//   });
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

// io.on('connection', (socket) => {
//   console.log('A user connected');

//   socket.on('joinRoom', (room) => {
//     if (rooms.includes(room)) {
//       socket.join(room);
//       console.log(`User joined room: ${room}`);
//       socket.emit('message', `Welcome to ${room}!`);
//     } else {
//       socket.emit('message', 'Room not found!');
//     }
//   });

//   socket.on('message', (msg) => {
//     io.to(msg.room).emit('message', msg.text);
//   });

//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//   });
// });

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
