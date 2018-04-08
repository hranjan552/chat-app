var socket = io();

function scrollToBottom() {
    var msgDivId = document.getElementById('ScrollStyle');
    msgDivId.scrollTop = msgDivId.scrollHeight;
}
scrollToBottom();

var timeout;
function timeoutFunction() {
    typing = false;
    socket.emit("typing", false);
    socket.emit("notTyping", true)
}

$("#message").keyup(function (e) {
    if (e.which !== 13) {
        typing = true;
        socket.emit("typing", true);
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 4000);
    } else {
        clearTimeout(timeout);
        timeoutFunction();
    }
});

socket.on("isTyping", function (data) {
    if (data.isTyping) {
        if ($("#" + data.pid + "").length === 0) {
            $("#userTyping").append("<div id='" + data.pid + "'>" + data.person + " is typing...</div>");
            timeout = setTimeout(timeoutFunction, 4000);
        }
    } else {
        $("#" + data.pid + "").remove();
    }
});

socket.on('connect', function () {
    var matches1 = window.location.search.match(/name=([^&]*)/);
    var matches2 = window.location.search.match(/group=([^&]*)/);
    if (!matches1 || !matches2) {
        window.location.href = '/';
    }
    var params = jQuery.deparam(window.location.search);
    socket.emit('join', params, function (err) {
        if (err) {
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
    var ol = jQuery('<ul class="collection"></ul>');

    users.forEach(function (user) {
        ol.append(jQuery(' <li class="collection-item teal-text"></li>').text(user));
    });

    jQuery('#users').html(ol);
});

socket.on('newMessage', function (message) {
    var msgDivId = document.getElementById('ScrollStyle');
    shouldScroll = msgDivId.scrollTop + msgDivId.clientHeight === msgDivId.scrollHeight;

    var formattedTime = moment(message.createdAt).format('h:mm:ss A');
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

socket.on('newAlertMessage', function (message) {
Materialize.toast(message.text, 4000);
});


$('#message-form').submit(function (e) {
    e.preventDefault();
    var msg = $('[name=message]').val().trim();
    if (msg === "") {
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
    var formattedTime = moment(message.createdAt).format('h:mm:ss A');
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