var express = require('express');
var app = express();
var path = require('path');
var RoomName='';
var UserName='';

app.use(express.static(path.join(__dirname, 'public')));

var server = app.listen(3000, function() {
    console.log("server started on port 3000");
});

var io = require('socket.io').listen(server);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.sockets.on('connection', function (socket) {
	 UserName = socket.handshake.query.UserName;
	 io.to(RoomName).emit('joined', UserName);

     socket.on('findFriends', function (gps) {
		 RoomName = "Latitude: "+gps.Lat.toFixed(2) + " Longitude: " + gps.Lon.toFixed(2);
		 socket.join(RoomName);
		 socket.emit('title', RoomName);
     })

    socket.on('message', function(data) {
        io.to(RoomName).emit('message',data);
    })

    socket.on('leave', function(data) {
       	socket.leave(RoomName);
       	io.to(RoomName).emit('left',data);
       	socket.emit('selfLeft');
    })
 });

