var SocketHelper = require('../helpers/SocketHelper');
var Room = require('../models/Room');
var Client = require('../models/Client');
var Message = require('../models/Message');
var MessageHelper = require('../helpers/MessageHelper');
var ServiceController = require('./ServiceController');
var io;
var rooms=[];

function SocketController(IO){
    io = IO;
}

SocketController.prototype.OnConnection = function(socket){
	currentRoomName = FindAndJoinChatRoom(socket);
    if(currentRoomName)
    {
        RegisterMessageHistoryEvent(socket,currentRoomName);
        RegisterNewMemberJoinedEvent(socket,currentRoomName);
        RegisterMessageEvent(socket,currentRoomName);
        RegisterBootEvent(socket,currentRoomName);
    }
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
     var socketHelper = new SocketHelper(io.sockets);
     var foundRoomName = socketHelper.FindRoomInRange(latNum,lonNum)
     if(foundRoomName != '')
     {
        CurrentRoomName = foundRoomName;
        currentRoomNameKey = CurrentRoomName.replace(/[\s\-\.]/g, '').toString();
        if(socketHelper.CheckIfNameTaken(rooms[currentRoomNameKey].Clients,UserName) == false)
        {
            socket.join(CurrentRoomName);
            socket.emit('title',rooms[currentRoomNameKey].Neighborhood + ' (' + CurrentRoomName + ')');
            PushUpdatedMemberList(CurrentRoomName,UserName,rooms[currentRoomNameKey].Clients,socket);
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
        var serviceController = new ServiceController();
        serviceController.GetNeighborhoodByCoords(latNum,lonNum,function(neighborhood){
               rooms[currentRoomNameKey] = new Room(CurrentRoomName.toString(),neighborhood);
               socket.join(CurrentRoomName);
               socket.emit('title',rooms[currentRoomNameKey].Neighborhood + '(' + CurrentRoomName + ')');
               PushUpdatedMemberList(CurrentRoomName,UserName,rooms[currentRoomNameKey].Clients,socket);
               RegisterLeaveEvent(socket,rooms[currentRoomNameKey],CurrentRoomName); //needs to be in callback so you leave correct room
               RegisterDisconnectEvent(socket,rooms[currentRoomNameKey],CurrentRoomName);
        });
     }

     console.log("User Joined | Name: '" + socket.handshake.query.UserName + "' | IP: '" + socket.handshake.address + "'");

     return CurrentRoomName;
}

function RegisterNewMemberJoinedEvent(socket,RoomName){
    UserName = socket.handshake.query.UserName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    socket.broadcast.to(RoomName).emit('joined', UserName);
}

function RegisterMessageEvent(socket,RoomName){
     UserName = socket.handshake.query.UserName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
     socket.on('message', function(data,timestamp){
        data = data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if(data.indexOf('&lt;script') < 0)
        {
                var result = new MessageHelper().HandleImageMessage(data, function(result){
                var mess = new Message();
                var isImage;
                if(result.URL)
                {
                    socket.broadcast.to(RoomName).emit('imageMessage', result);
                    socket.emit('selfImageMessage',result);
                    mess.Content = result;
                    isImage = true;
                }
                else
                {
                    socket.broadcast.to(RoomName).emit('message', data);
                    socket.emit('selfMessage',data);
                    mess.Content = data;
                    isImage = false;
                }
                mess.Timestamp = timestamp;
                mess.IsImage  = isImage;
                rooms[RoomName.replace(/[\s\-\.]/g, '').toString()].Messages.push(mess);
            });
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
            var recentMessages=[];
            allMessages.forEach( function (mess){
              if(mess.Timestamp > timestamp){
                recentMessages.push(mess);
              }
            });

           socket.emit('messageHistory',recentMessages);
        }
        socket.emit('selfjoined',RoomName);
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
     var isUserInRoom = false;
     if(typeof existingRoom.Clients != 'undefined' )
     {
        existingRoom.Clients.forEach(function(val,index){
            if(val.Name == UserName)
            {
                isUserInRoom = true;
            }
        });
        if(isUserInRoom)
        {
            HandleLeave(socket, existingRoom, currentRoomName);
            isUserInRoom = false;
        }
     }
    })
}

function PushUpdatedMemberList(roomName,userName,clients,socket){
    var client = new Client();
        client.Name = userName;
        client.SocketID = socket.id;
    clients.push(client);
    io.to(roomName).emit('usersInRoomUpdate',clients);
}

function HandleLeave(socket,CurrentRoom,CurrentRoomName){
    UserName = socket.handshake.query.UserName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    socket.leave(CurrentRoomName); //leave room
    io.to(CurrentRoomName).emit('left',UserName); //tell everyone i left
    socket.emit('selfLeft',CurrentRoomName); //let myself know i left
    if(typeof CurrentRoom.Clients != 'undefined')
    {
        var removeUserIndex;
        CurrentRoom.Clients.forEach(function(val,index){
            if(val.Name == UserName)
            {
                removeUserIndex = index;
                CurrentRoom.Clients.splice(removeUserIndex,1);
            }
        });
        io.to(CurrentRoomName).emit('usersInRoomUpdate',CurrentRoom.Clients); //remove me from room for everyone in it
        socket.emit('usersInRoomUpdate',CurrentRoom.Clients); //remove me from dead room list
    }
}

function RegisterBootEvent(socket,currentRoomName){
    socket.on('bootUser', function(data) {
        if(typeof io.sockets.connected[data.SocketID] != 'undefined' && socket.handshake.query.UserName != io.sockets.connected[data.SocketID].handshake.query.UserName)
        {
             HandleLeave(io.sockets.connected[data.SocketID],rooms[currentRoomName.replace(/[\s\-\.]/g, '').toString()],currentRoomName);
             io.sockets.connected[data.SocketID].emit('userBooted');
        }
    });
}
module.exports = SocketController;