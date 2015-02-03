var SocketHelper = require('../helpers/SocketHelper');
var Room = require('../models/Room');
var io;
var CurrentRoomName='';
var UserName='';
var rooms=[];
var currentRoomNameKey='';

function SocketHandler(IO){
    io = IO;
}

SocketHandler.prototype.RegisterEvents = function()
{
    io.sockets.on('connection', function (socket) {
    	 UserName = socket.handshake.query.UserName;

         socket.on('findFriends', function (gps) {
        	HandleFindFriends(socket,gps);
         });

        socket.on('message', function(data) {
            io.to(CurrentRoomName).emit('message',data);
        });

        socket.on('leave', function(data) {
           	HandleLeave(socket,data,rooms);
        })
     });
}

function HandleFindFriends(socket,gps){
     CurrentRoomName = gps.Lat.toFixed(2) + " " + gps.Lon.toFixed(2);

     //check if room exists
     var foundRoom = new SocketHelper(io.sockets).FindRoomInRange(gps.Lat.toFixed(2),gps.Lon.toFixed(2))
     if(foundRoom != '')
     {
        socket.join(foundRoom);
        CurrentRoomName = foundRoom;
     }
     else //no room close enough, create
     {
        socket.join(CurrentRoomName);
        currentRoomNameKey = CurrentRoomName.replace(/[\s\-\.]/g, '').toString();
        rooms[currentRoomNameKey] = new Room(CurrentRoomName.toString());
     }

     socket.emit('title', CurrentRoomName);
     socket.broadcast.to(CurrentRoomName).emit('joined', UserName);
     socket.emit('selfjoined',UserName+" (You)");

     if(typeof rooms[currentRoomNameKey] != 'undefined')
     {
         rooms[currentRoomNameKey].Clients.push(UserName);
         io.to(CurrentRoomName).emit('usersInRoomUpdate',rooms[currentRoomNameKey].Clients);
     }
}

function HandleLeave(socket,data,rooms){
    socket.leave(CurrentRoomName); //leave room
    io.to(CurrentRoomName).emit('left',data); //tell everyone i left
    socket.emit('selfLeft'); //let myself know i left
    var removeIndex = rooms[currentRoomNameKey].Clients.indexOf(UserName);
    rooms[currentRoomNameKey].Clients.splice(removeIndex,1);
    io.to(CurrentRoomName).emit('usersInRoomUpdate',rooms[currentRoomNameKey].Clients); //remove me from room for everyone in it
    socket.emit('usersInRoomUpdate',rooms[currentRoomNameKey].Clients); //remove me from dead room list
}


module.exports = SocketHandler;