var SocketHelper = require('../helpers/SocketHelper');
var Room = require('../models/Room');
var Message = require('../models/Message');
var ServiceHandler = require('./ServiceHandler');
var io;
var rooms=[];

function SocketHandler(IO){
    io = IO;
}

SocketHandler.prototype.HandleSocketConnect = function(){
    io.sockets.on('connection', function (socket){
    	currentRoomName = FindAndJoinChatRoom(socket);
        if(currentRoomName)
        {
            AlertMemberJoined(socket,currentRoomName);
            RegisterMessageEvent(socket,currentRoomName);
            RegisterMessageHistoryEvent(socket,currentRoomName);
        }
    });
}

function FindAndJoinChatRoom(socket){
     var SocketQuery = socket.handshake.query;
     var UserName = SocketQuery.UserName;

     UserName = UserName.replace(/</g, "&lt;").replace(/>/g, "&gt;");

     var latNum = parseFloat(SocketQuery.Lat).toFixed(2);
     var lonNum = parseFloat(SocketQuery.Lon).toFixed(2);
     var CurrentRoomName = latNum + " " + lonNum;
     var currentRoomNameKey = '';

     //check if room exists
     var foundRoomName = new SocketHelper(io.sockets).FindRoomInRange(latNum,lonNum)
     if(foundRoomName != '')
     {
        CurrentRoomName = foundRoomName;
        currentRoomNameKey = CurrentRoomName.replace(/[\s\-\.]/g, '').toString();
        if(!CheckIfNameTaken(rooms[currentRoomNameKey].Clients,UserName))
        {
            socket.join(CurrentRoomName);
            socket.emit('title',rooms[currentRoomNameKey].Neighborhood + ' (' + CurrentRoomName + ')');
            PushUpdatedMemberList(CurrentRoomName,UserName,rooms[currentRoomNameKey].Clients);
            RegisterLeaveEvent(socket,rooms[currentRoomNameKey],CurrentRoomName);
            RegisterDisconnectEvent(socket,rooms[currentRoomNameKey],CurrentRoomName);
        }
        else
        {
            socket.emit('userError','A user with that name is already in the room.');
            return '';
        }
     }
     else //no room close enough, create
     {
        currentRoomNameKey = CurrentRoomName.replace(/[\s\-\.]/g, '').toString();
        var serviceHandler = new ServiceHandler();
        serviceHandler.GetNeighborhoodByCoords(latNum,lonNum,function(neighborhood){
               rooms[currentRoomNameKey] = new Room(CurrentRoomName.toString(),neighborhood);
               socket.join(CurrentRoomName);
               socket.emit('title',rooms[currentRoomNameKey].Neighborhood + '(' + CurrentRoomName + ')');
               PushUpdatedMemberList(CurrentRoomName,UserName,rooms[currentRoomNameKey].Clients);
               RegisterLeaveEvent(socket,rooms[currentRoomNameKey],CurrentRoomName); //needs to be in callback so you leave correct room
               RegisterDisconnectEvent(socket,rooms[currentRoomNameKey],CurrentRoomName);
        });
     }

     console.log("User Joined | Name: '" + socket.handshake.query.UserName + "' | IP: '" + socket.handshake.address + "'");

     return CurrentRoomName;
}

function CheckIfNameTaken(roomList,user){

    if(roomList.indexOf(user) > -1)
    {
        return true;
    }
    return false;
}

function AlertMemberJoined(socket,RoomName){
    UserName = socket.handshake.query.UserName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    socket.broadcast.to(RoomName).emit('joined', UserName);
    socket.emit('selfjoined',RoomName);
}

function RegisterMessageEvent(socket,RoomName){
     UserName = socket.handshake.query.UserName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
     socket.on('message', function(data){
        data = data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if(data.indexOf('&lt;script') < 0)
        {
            io.to(RoomName).emit('message',data);
            var mess = new Message();
                mess.Content = data;
                mess.Timestamp = Date.now();
            rooms[RoomName.replace(/[\s\-\.]/g, '').toString()].Messages.push(mess);
        }
        else
        {
            io.to(RoomName).emit('injectMessage',UserName +" tried to inject javascript and FAILED");
        }
     });
}

function RegisterMessageHistoryEvent(socket,RoomName){
    socket.on('getMessageHistory', function(timestamp) {
        var key = RoomName.replace(/[\s\-\.]/g, '').toString();
        if(typeof rooms[key] != 'undefined')
        {
            rooms[key].Messages = rooms[key].Messages.slice(-100); //make sure to not store more than 100 messages back
            var allMessages = rooms[key].Messages;
            console.log(allMessages);
            var recentMessages=[];
            allMessages.forEach( function (mess){
              if(mess.Timestamp > timestamp){
                recentMessages.push(mess);
              }
            });

           socket.emit('messageHistory',recentMessages);
        }
    });
}

function RegisterLeaveEvent(socket,existingRoom,currentRoomName){
     socket.on('leave', function() {
            HandleLeave(socket,existingRoom, currentRoomName);
        })
}

function RegisterDisconnectEvent(socket,existingRoom,currentRoomName){
     UserName = socket.handshake.query.UserName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
     socket.on('disconnect', function() {
        if(typeof existingRoom.Clients != 'undefined' && existingRoom.Clients.indexOf(UserName) > -1)
        {
            HandleLeave(socket, existingRoom, currentRoomName);
        }
    })
}

function PushUpdatedMemberList(roomName,userName,clients){
    clients.push(userName);
    io.to(roomName).emit('usersInRoomUpdate',clients);
}

function HandleLeave(socket,CurrentRoom,CurrentRoomName){
    UserName = socket.handshake.query.UserName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    socket.leave(CurrentRoomName); //leave room
    io.to(CurrentRoomName).emit('left',UserName); //tell everyone i left
    socket.emit('selfLeft',CurrentRoomName); //let myself know i left
    if(typeof CurrentRoom.Clients != 'undefined')
    {
        var removeIndex = CurrentRoom.Clients.indexOf(UserName);
        CurrentRoom.Clients.splice(removeIndex,1);
        io.to(CurrentRoomName).emit('usersInRoomUpdate',CurrentRoom.Clients); //remove me from room for everyone in it
        socket.emit('usersInRoomUpdate',CurrentRoom.Clients); //remove me from dead room list
    }
}

module.exports = SocketHandler;