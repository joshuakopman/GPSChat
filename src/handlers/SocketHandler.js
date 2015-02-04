var SocketHelper = require('../helpers/SocketHelper');
var Room = require('../models/Room');
var io;
var rooms=[];
var ServiceHandler = require('./ServiceHandler');

function SocketHandler(IO){
    io = IO;
}

SocketHandler.prototype.RegisterEvents = function(){
    io.sockets.on('connection', function (socket) {

         socket.on('findFriends', function (gps) {
        	HandleFindFriends(socket,gps);
         });

        socket.on('leave', function(gps) {
           	HandleLeave(socket,rooms,gps);
        })

         socket.on('disconnect', function(data) {
            HandleLeave(socket,data,rooms);
        })
     });
}

function HandleFindFriends(socket,gps){
     var UserName = socket.handshake.query.UserName;
     var CurrentRoomName = gps.Lat.toFixed(2) + " " + gps.Lon.toFixed(2);
     var currentRoomNameKey='';
     //check if room exists
     var foundRoom = new SocketHelper(io.sockets).FindRoomInRange(gps.Lat.toFixed(2),gps.Lon.toFixed(2))

     if(foundRoom != '')
     {
        socket.join(foundRoom);
        CurrentRoomName = foundRoom;
        currentRoomNameKey = CurrentRoomName.replace(/[\s\-\.]/g, '').toString();
        socket.emit('title',rooms[currentRoomNameKey].Neighborhood + '(' + CurrentRoomName + ')');
        PushUpdatedMemberList(CurrentRoomName,UserName,rooms[currentRoomNameKey].Clients);
     }
     else //no room close enough, create
     {
        socket.join(CurrentRoomName);
        currentRoomNameKey = CurrentRoomName.replace(/[\s\-\.]/g, '').toString();
        new ServiceHandler().GetNeighborhoodByCoords(gps.Lat.toFixed(2),gps.Lon.toFixed(2), function(neighborhood){
           rooms[currentRoomNameKey] = new Room(CurrentRoomName.toString(),neighborhood);
           socket.emit('title',rooms[currentRoomNameKey].Neighborhood + '(' + CurrentRoomName + ')');
           PushUpdatedMemberList(CurrentRoomName,UserName,rooms[currentRoomNameKey].Clients);
        });
     }

     socket.broadcast.to(CurrentRoomName).emit('joined', UserName);
     socket.emit('selfjoined',UserName+" (You)");
     
     socket.on('message', function(data) {
            io.to(CurrentRoomName).emit('message',data);
        });
}

function PushUpdatedMemberList(roomName,userName,existingClients){
    existingClients.push(userName);
    io.to(roomName).emit('usersInRoomUpdate',existingClients);
}

function HandleLeave(socket,rooms,gps){
    if(typeof gps.Lat != 'undefined' && typeof gps.Lon != 'undefined')
    {
        var CurrentRoomName = gps.Lat.toFixed(2) + " " + gps.Lon.toFixed(2);
        socket.leave(CurrentRoomName); //leave room
        io.to(CurrentRoomName).emit('left',socket.handshake.query.UserName); //tell everyone i left
        socket.emit('selfLeft'); //let myself know i left
        currentRoomNameKey = CurrentRoomName.replace(/[\s\-\.]/g, '').toString();
        if(typeof rooms[currentRoomNameKey] != 'undefined')
        {
            var removeIndex = rooms[currentRoomNameKey].Clients.indexOf(socket.handshake.query.UserName);
            rooms[currentRoomNameKey].Clients.splice(removeIndex,1);
            io.to(CurrentRoomName).emit('usersInRoomUpdate',rooms[currentRoomNameKey].Clients); //remove me from room for everyone in it
            socket.emit('usersInRoomUpdate',rooms[currentRoomNameKey].Clients); //remove me from dead room list
        }
    }
}

module.exports = SocketHandler;