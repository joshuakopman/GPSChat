var SocketHelper = require('../helpers/SocketHelper');
var Room = require('../models/Room');
var ServiceHandler = require('./ServiceHandler');
var io;
var rooms=[];

function SocketHandler(IO){
    io = IO;
}

SocketHandler.prototype.HandleSocketConnect = function(){
    io.sockets.on('connection', function (socket){
    	currentRoomName = FindAndJoinChatRoom(socket);
        AlertMemberJoined(socket,currentRoomName);
        RegisterMessageEvent(socket,currentRoomName);
    });
}

function FindAndJoinChatRoom(socket){
     var SocketQuery = socket.handshake.query;
     var UserName = SocketQuery.UserName;
     var latNum = parseFloat(SocketQuery.Lat).toFixed(2);
     var lonNum = parseFloat(SocketQuery.Lon).toFixed(2);
     console.log(latNum);
     console.log(lonNum);
     var CurrentRoomName = latNum + " " + lonNum;
     var currentRoomNameKey = '';

     //check if room exists
     var foundRoomName = new SocketHelper(io.sockets).FindRoomInRange(latNum,lonNum)

     if(foundRoomName != '')
     {
        socket.join(foundRoomName);
        CurrentRoomName = foundRoomName;
        currentRoomNameKey = CurrentRoomName.replace(/[\s\-\.]/g, '').toString();
        socket.emit('title',rooms[currentRoomNameKey].Neighborhood + '(' + CurrentRoomName + ')');
        PushUpdatedMemberList(CurrentRoomName,UserName,rooms[currentRoomNameKey].Clients);
        RegisterLeaveEvent(socket,rooms[currentRoomNameKey],CurrentRoomName);
        RegisterDisconnectEvent(socket,rooms[currentRoomNameKey],CurrentRoomName);
     }
     else //no room close enough, create
     {
        socket.join(CurrentRoomName);
        currentRoomNameKey = CurrentRoomName.replace(/[\s\-\.]/g, '').toString();
        var serviceHandler = new ServiceHandler();
        serviceHandler.GetNeighborhoodByCoords(latNum,lonNum,function(neighborhood){
               rooms[currentRoomNameKey] = new Room(CurrentRoomName.toString(),neighborhood);
               socket.emit('title',rooms[currentRoomNameKey].Neighborhood + '(' + CurrentRoomName + ')');
               PushUpdatedMemberList(CurrentRoomName,UserName,rooms[currentRoomNameKey].Clients);
               RegisterLeaveEvent(socket,rooms[currentRoomNameKey],CurrentRoomName); //needs to be in callback so you leave correct room
               RegisterDisconnectEvent(socket,rooms[currentRoomNameKey],CurrentRoomName);
        });
     }

     return CurrentRoomName;
}

function AlertMemberJoined(socket,RoomName){
    socket.broadcast.to(RoomName).emit('joined', socket.handshake.query.UserName);
    socket.emit('selfjoined',socket.handshake.query.UserName + " (You)");
}

function RegisterMessageEvent(socket,RoomName){
     socket.on('message', function(data){
        if(data.indexOf('<script>') < 0)
        {
            io.to(RoomName).emit('message',data);
        }
        else
        {
            io.to(RoomName).emit('message',socket.handshake.query.UserName +" tried to inject javascript and FAILED");
        }
     });
}

function RegisterLeaveEvent(socket,existingRoom,currentRoomName){
     socket.on('leave', function() {
            HandleLeave(socket,existingRoom, currentRoomName);
        })
}

function RegisterDisconnectEvent(socket,existingRoom,currentRoomName){
     socket.on('disconnect', function() {
        if(typeof existingRoom.Clients != 'undefined' && existingRoom.Clients.indexOf(socket.handshake.query.UserName) > -1)
        {
            HandleLeave(socket,existingRoom, currentRoomName);
        }
    })
}

function PushUpdatedMemberList(roomName,userName,clients){
    clients.push(userName);
    io.to(roomName).emit('usersInRoomUpdate',clients);
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