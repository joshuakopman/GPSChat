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

     socket.on('leave', function(gps) {
            HandleLeave(socket,rooms[currentRoomNameKey], CurrentRoomName);
        })

     socket.on('disconnect', function(data) {
            HandleLeave(socket,data,CurrentRoomName);
        })
}

function PushUpdatedMemberList(roomName,userName,existingClients){
    existingClients.push(userName);
    io.to(roomName).emit('usersInRoomUpdate',existingClients);
}

function HandleLeave(socket,CurrentRoom,CurrentRoomName){
    socket.leave(CurrentRoomName); //leave room
    io.to(CurrentRoomName).emit('left',socket.handshake.query.UserName); //tell everyone i left
    socket.emit('selfLeft'); //let myself know i left
    if(typeof CurrentRoom.Clients != 'undefined')
    {
        var removeIndex = CurrentRoom.Clients.indexOf(socket.handshake.query.UserName);
        CurrentRoom.Clients.splice(removeIndex,1);
        io.to(CurrentRoomName).emit('usersInRoomUpdate',CurrentRoom.Clients); //remove me from room for everyone in it
        socket.emit('usersInRoomUpdate',CurrentRoom.Clients); //remove me from dead room list
    }
}

module.exports = SocketHandler;