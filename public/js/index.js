var socket = io();

socket.on('connect', function () {
    console.log('Connected to server');
});

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

socket.on('newMessage', function (message) {
    console.log('newMessage', message);
    var li = $('<li class="collection-item"></li>');
    li.text(`${message.from}: ${message.text}`);
    $('#messages').append(li);
});

$('#message-form').submit(function (e) {
    e.preventDefault();

    socket.emit('createMessage', {
        from: 'User',
        text: $('[name=message]').val()
    }, function () {
    });
});

socket.on('newLocationMessage', function (message) {
    var li = $('<li class="collection-item"></li>');
    var a = $('<a target="_blank" class="waves-effect waves-light btn btn-small blue lighten-2"> <i class="material-icons right">my_location</i>My current location</a>');
  
    li.text(`${message.from}: `);
    a.attr('href', message.url);
    li.append(a);
    $('#messages').append(li);
  });

var locationButton = $('#send-location');
locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return Materialize.toast('Geolocation not supported by your browser...', 4000);
    }

    navigator.geolocation.getCurrentPosition(function (position) {
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function () {
        Materialize.toast('Unable to fetch your location...', 4000);
    });
});