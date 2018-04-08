const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const { generateMessage, generateLocationMessage, typingMessage } = require('./services/message');
const { isRealString } = require('./services/validation');
const { Users } = require('./services/users');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

var users = new Users();
// Set static folder
app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.group)) {
      return callback('Display Name and Group name are required.');
    }
    socket.join(params.group);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.group);
    io.to(params.group).emit('updateUserList', users.getUserList(params.group));
    socket.emit('newAlertMessage', generateMessage('Admin', 'Welcome to the E-Chat :)'));
    socket.broadcast.to(params.group).emit('newAlertMessage', generateMessage('(Admin) ', `${params.name} has joined the Group...`));
    callback();
  });

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);
    if (user && isRealString(message.text)) {
      io.to(user.group).emit('newMessage', generateMessage(user.name, message.text));
    }
    callback();
  });


  socket.on("typing", function (data) {
    var user = users.getUser(socket.id);
    if (user) {
      io.to(user.group).emit("isTyping", { isTyping: data, person: user.name, pid: user.id });
    }
  });


  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);

    if (user) {
      io.to(user.group).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });


  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);
    if (user) {
      io.to(user.group).emit('updateUserList', users.getUserList(user.group));
      io.to(user.group).emit('newAlertMessage', generateMessage('Admin', `${user.name} has left the Group...`));
    }
  });
});


const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server started on port ${port}`)
});
