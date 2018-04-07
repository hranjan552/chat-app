const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Set static folder
app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
    console.log('New user connected');
  
    socket.on('disconnect', () => {
      console.log('User was disconnected');
    });
  });
  
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server started on port ${port}`)
});
