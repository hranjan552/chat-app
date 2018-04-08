var socket = io();

function scrollToBottom() {
    var msgDivId = document.getElementById('ScrollStyle');
    msgDivId.scrollTop = msgDivId.scrollHeight;
  }

  scrollToBottom();

socket.on('connect', function () {
    var params = jQuery.deparam(window.location.search);

    socket.emit('join', params, function (err) {
        if (err) {
         // Materialize.toast(err, 4000);
         alert(err);
          window.location.href = '/';
        } else {
          console.log('No error');
        }
      });
});

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

socket.on('updateUserList', function (users) {
    var ol = jQuery('<ol></ol>');
  
    users.forEach(function (user) {
      ol.append(jQuery('<li></li>').text(user));
    });
  
    jQuery('#users').html(ol);
  });

socket.on('newMessage', function (message) {
    var msgDivId = document.getElementById('ScrollStyle');
    shouldScroll = msgDivId.scrollTop + msgDivId.clientHeight === msgDivId.scrollHeight;

    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = $('#message-template').html();
    var html = Mustache.render(template, {
      text: message.text,
      from: message.from,
      createdAt: formattedTime
    });
     $('#messages').append(html);
     if (!shouldScroll) {
        scrollToBottom();
      }
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
    var msgDivId = document.getElementById('ScrollStyle');
    shouldScroll = msgDivId.scrollTop + msgDivId.clientHeight === msgDivId.scrollHeight;
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template, {
      from: message.from,
      url: message.url,
      createdAt: formattedTime
    });
    $("#messages").append(html);
    if (!shouldScroll) {
        scrollToBottom();
      }
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