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
     var latNum = gps.Lat.toFixed(2);
     var lonNum = gps.Lon.toFixed(2);
     var CurrentRoomName = latNum + " " + lonNum;
     var currentRoomNameKey='';
     //check if room exists
     var foundRoom = new SocketHelper(io.sockets).FindRoomInRange(latNum,lonNum)

     if(foundRoom != '')
     {
        socket.join(foundRoom);
        CurrentRoomName = foundRoom;
        currentRoomNameKey = CurrentRoomName.replace(/[\s\-\.]/g, '').toString();
        socket.emit('title',rooms[currentRoomNameKey].Neighborhood + '(' + CurrentRoomName + ')');
        PushUpdatedMemberList(CurrentRoomName,UserName,rooms[currentRoomNameKey].Clients);
        RegisterLeaveEvent(socket,rooms[currentRoomNameKey],CurrentRoomName)
     }
     else //no room close enough, create
     {
        socket.join(CurrentRoomName);
        currentRoomNameKey = CurrentRoomName.replace(/[\s\-\.]/g, '').toString();
        var serviceHandler = new ServiceHandler();
        serviceHandler.GetNeighborhoodByCoords(latNum,lonNum, 
           function(neighborhood){
               rooms[currentRoomNameKey] = new Room(CurrentRoomName.toString(),neighborhood);
               socket.emit('title',rooms[currentRoomNameKey].Neighborhood + '(' + CurrentRoomName + ')');
               PushUpdatedMemberList(CurrentRoomName,UserName,rooms[currentRoomNameKey].Clients);
               RegisterLeaveEvent(socket,rooms[currentRoomNameKey],CurrentRoomName) //needs to be in callback so you leave correct room
        });
     }

     socket.broadcast.to(CurrentRoomName).emit('joined', UserName);
    
     socket.emit('selfjoined',UserName+" (You)");

     socket.on('message', function(data) {
        io.to(CurrentRoomName).emit('message',data);
     });

     socket.on('disconnect', function() {
            io.to(CurrentRoomName).emit('left',socket.handshake.query.UserName);
    })
}

function RegisterLeaveEvent(mySocket,existingRooms,currentRoomName){
     mySocket.on('leave', function() {
            HandleLeave(mySocket,existingRooms, currentRoomName);
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