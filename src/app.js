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
    		 RoomName = gps.Lat.toFixed(2) + " " + gps.Lon.toFixed(2);

         //check if room exists
         var foundRoom = FindRoomInRange(gps.Lat.toFixed(2),gps.Lon.toFixed(2))
         console.log("Found Room name is:"+foundRoom);
         if(foundRoom != '')
         {
            console.log('Joining existing room')
    		    socket.join(foundRoom);
         }
         else //no room close enough, create
         {
          console.log('Creating new room')
          socket.join(RoomName);
         }

    		 socket.emit('title', RoomName);
     });

    socket.on('message', function(data) {
        io.to(RoomName).emit('message',data);
    });

    socket.on('leave', function(data) {
       	socket.leave(RoomName);
       	io.to(RoomName).emit('left',data);
       	socket.emit('selfLeft');
    })
 });

function FindRoomInRange(mylat,mylon)
{
    var existingRooms = io.sockets.adapter.rooms;
    var roomNameFound='';
    if(existingRooms.length < 1)
    {
        return roomNameFound;
    }

   Object.keys(existingRooms).forEach(function(roomName){

       var roomTokens = roomName.split(" ");

        if(!isNaN(parseFloat(roomTokens[0])) && !isNaN(parseFloat(roomTokens[1])))
        { 
          if(Math.abs(parseFloat(roomTokens[0]).toFixed(2) - mylat) < .03 && Math.abs(parseFloat(roomTokens[1]).toFixed(2) - mylon) < .03)
          {
            roomNameFound = roomName;
          }
        }
    });

    return roomNameFound;
}
