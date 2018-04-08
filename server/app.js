const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const {generateMessage, generateLocationMessage} = require('./services/message');
const {isRealString} = require('./services/validation');
const {Users} = require('./services/users');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

var users = new Users();
// Set static folder
app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {

    console.log('New user connected');
  
  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.group)) {
     return callback('Display Name and Group name are required.');
    }
    socket.join(params.group);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.group);
    io.to(params.group).emit('updateUserList', users.getUserList(params.group));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.group).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    console.log('createMessage', message);
    io.emit('newMessage', generateMessage(message.from, message.text));
    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    io.emit('newLocationMessage', generateLocationMessage('Him', coords.latitude, coords.longitude));
  });

    socket.on('disconnect', () => {
      var user = users.removeUser(socket.id);
      if (user) {
        io.to(user.group).emit('updateUserList', users.getUserList(user.group));
        io.to(user.group).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
      }
    });
});



const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server started on port ${port}`)
});
