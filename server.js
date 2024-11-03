// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3001;

// Cấu hình CORS
app.use(cors({
    origin: '*', // Chỉ cho phát triển
    methods: ['GET', 'POST'],
    credentials: true,
}));

// Cấu hình multer để xử lý upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

// Thêm route cho đường dẫn gốc
app.get('/', (req, res) => {
    res.send('Server is running. Use /upload to upload files and Socket.IO for chat.');
});

// Lưu trữ các phòng chat
const rooms = {}; // Để lưu các phòng chat

io.on('connection', (socket) => {
    console.log('A user connected');

    // Nhân viên hoặc khách tham gia phòng
    socket.on('joinRoom', ({ customerId, employeeId }) => {
        const room = `${customerId}-${employeeId}`;
        socket.join(room); // Tham gia vào phòng
        rooms[room] = rooms[room] || { customers: [], employees: [] };
        rooms[room].customers.push(customerId);
        rooms[room].employees.push(employeeId);
        console.log(`User joined room: ${room}`);
    });

    // Nhận tin nhắn
    socket.on('message', (msg) => {
        const { room } = msg;
        io.to(room).emit('message', msg); // Gửi tin nhắn đến phòng cụ thể
    });

    // Ngắt kết nối
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Endpoint upload file
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send({ filePath: `/${req.file.filename}` });
});

// Khởi động server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
