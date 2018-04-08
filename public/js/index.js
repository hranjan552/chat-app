var socket = io();

socket.on('connect', function () {
    console.log('Connected to server');
});

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

socket.on('newMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = $('#message-template').html();
    var html = Mustache.render(template, {
      text: message.text,
      from: message.from,
      createdAt: formattedTime
    });
     $('#messages').append(html);
});

$('#message-form').submit(function (e) {
    e.preventDefault();
var msg = $('[name=message]').val().trim();
if(msg===""){
    $('[name=message]').focus();
    return false
}
    socket.emit('createMessage', {
        from: 'User',
        text: $('[name=message]').val()
    }, function () {
        $('[name=message]').val('')
    });
});

socket.on('newLocationMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template, {
      from: message.from,
      url: message.url,
      createdAt: formattedTime
    });
    $('#messages').append(html);
  });

var locationButton = $('#send-location');
locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return Materialize.toast('Geolocation not supported by your browser...', 4000);
    }
    $('#send-location').prop('disabled', true).html('<i class="material-icons right">location_on</i>Please Wait');
    navigator.geolocation.getCurrentPosition(function (position) {
        $('#send-location').prop('disabled', false).html('<i class="material-icons right">location_on</i>Share Location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function () {
        $('#send-location').prop('disabled', false).html('<i class="material-icons right">location_on</i>Share Location');
        Materialize.toast('Unable to fetch your location...', 4000);
    });
});