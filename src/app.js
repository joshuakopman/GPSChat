var express = require('express');
var app = express();
var path = require('path');
var CurrentRoomName='';
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

     socket.on('findFriends', function (gps) {
    		 CurrentRoomName = gps.Lat.toFixed(2) + " " + gps.Lon.toFixed(2);

         //check if room exists
         var foundRoom = FindRoomInRange(gps.Lat.toFixed(2),gps.Lon.toFixed(2))
         if(foundRoom != '')
         {
    		    socket.join(foundRoom);
            CurrentRoomName = foundRoom;

         }
         else //no room close enough, create
         {
            socket.join(CurrentRoomName);
         }

         io.to(CurrentRoomName).emit('joined', UserName);
         socket.emit('title', CurrentRoomName);

     });

    socket.on('message', function(data) {
        io.to(CurrentRoomName).emit('message',data);
    });

    socket.on('leave', function(data) {
       console.log('leaving '+CurrentRoomName);
       	socket.leave(CurrentRoomName); //leave room
       	io.to(CurrentRoomName).emit('left',data); //tell everyone i left
       	socket.emit('selfLeft'); //let myself know i left
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
