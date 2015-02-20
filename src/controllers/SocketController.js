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
    var self = this;
	this.FindAndJoinChatRoom(socket,function(room){
        if(room != '')
        {
            self.RegisterMessageHistoryEvent(socket,room);
            self.RegisterNewMemberJoinedEvent(socket,room);
            self.RegisterMessageEvent(socket,room);
            self.RegisterBootEvent(socket,room);
        }
    });
}

SocketController.prototype.FindAndJoinChatRoom = function(socket,callback){
     var SocketQuery = socket.handshake.query;
     var UserName = SocketQuery.UserName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
     var existingRoomDTO;
     var latNum = parseFloat(SocketQuery.Lat).toFixed(2);
     var lonNum = parseFloat(SocketQuery.Lon).toFixed(2);
     var CurrentRoomName = latNum + " " + lonNum;
     var currentRoomNameKey = '';

     //check if room exists
     var socketHelper = new SocketHelper(io.sockets);
     var foundRoomName = socketHelper.FindRoomInRange(latNum,lonNum);
     if(foundRoomName != '')
     {
        currentRoomNameKey = foundRoomName.replace(/[\s\-\.]/g, '').toString();
        if(socketHelper.CheckIfNameTaken(rooms[currentRoomNameKey].Clients,UserName) == false)
        {
            existingRoomDTO = new Room(foundRoomName,rooms[currentRoomNameKey].Neighborhood,rooms[currentRoomNameKey].Clients);
            socket.join(existingRoomDTO.Name);
            socket.emit('title',rooms[existingRoomDTO.Key].Neighborhood + ' (' + existingRoomDTO.Name + ')');
            this.PushUpdatedMemberList(existingRoomDTO.Name,rooms[existingRoomDTO.Key].Clients,socket,UserName);
            this.RegisterLeaveEvent(socket,rooms[existingRoomDTO.Key],existingRoomDTO.Name,UserName);
            this.RegisterDisconnectEvent(socket,rooms[existingRoomDTO.Key],existingRoomDTO.Name,UserName);

            return callback(existingRoomDTO);
        }
        else
        {   
            socket.emit('userError','A user with that name is already in the room.');
            return callback('');
        }
     }
     else //no room close enough, create
     {
        var self = this;
        new ServiceController().GetNeighborhoodByCoords(latNum,lonNum,function(neighborhood){
               existingRoomDTO = new Room(CurrentRoomName.toString(),neighborhood);
               rooms[existingRoomDTO.Key] = existingRoomDTO;
               socket.join(existingRoomDTO.Name);
               socket.emit('title',rooms[existingRoomDTO.Key].Neighborhood + '(' + existingRoomDTO.Name + ')');
               self.PushUpdatedMemberList(existingRoomDTO.Name,rooms[existingRoomDTO.Key].Clients,socket,UserName);
               self.RegisterLeaveEvent(socket,rooms[existingRoomDTO.Key],existingRoomDTO.Name,UserName);
               self.RegisterDisconnectEvent(socket,rooms[currentRoomNameKey],existingRoomDTO.Name,UserName);

               return callback(existingRoomDTO);
        });
     }

     console.log("User Joined | Name: '" + socket.handshake.query.UserName + "' | IP: '" + socket.handshake.address + "'");
}

SocketController.prototype.RegisterNewMemberJoinedEvent= function(socket,Room){
    UserName = socket.handshake.query.UserName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    socket.broadcast.to(Room.Name).emit('joined', UserName);
}

SocketController.prototype.RegisterMessageEvent = function(socket,Room){
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
                    socket.broadcast.to(Room.Name).emit('imageMessage', result);
                    socket.emit('selfImageMessage',result);
                    mess.Content = result;
                    isImage = true;
                }
                else
                {
                    socket.broadcast.to(Room.Name).emit('message', data);
                    socket.emit('selfMessage',data);
                    mess.Content = data;
                    isImage = false;
                }
                mess.Timestamp = timestamp;
                mess.IsImage  = isImage;
                rooms[Room.Name.replace(/[\s\-\.]/g, '').toString()].Messages.push(mess);
            });
        }
        else
        {
            io.to(RoomName).emit('injectMessage',UserName +" tried to inject javascript and FAILED");
        }
     });
}

SocketController.prototype.RegisterMessageHistoryEvent = function(socket,room){
    socket.on('getMessageHistory', function(timestamp) {
        var key = room.Name.replace(/[\s\-\.]/g, '').toString();
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
        socket.emit('selfjoined',room.Neighborhood + ' (' + room.Name + ')');
    });
}

SocketController.prototype.RegisterLeaveEvent = function(socket,existingRoom,currentRoomName,userName){
    var self = this;
     socket.on('leave', function() {
            self.HandleLeave(socket,existingRoom, currentRoomName,userName);
        })
}

SocketController.prototype.RegisterDisconnectEvent = function(socket,existingRoom,currentRoomName,userName){
    var self = this;
     socket.on('disconnect', function() {
         var isUserInRoom = false;
         if(typeof existingRoom != 'undefined' && typeof existingRoom.Clients != 'undefined' )
         {
            existingRoom.Clients.forEach(function(val,index){
                if(val.Name == userName)
                {
                    isUserInRoom = true;
                }
            });
            if(isUserInRoom)
            {
                self.HandleLeave(socket, existingRoom, currentRoomName,userName);
                isUserInRoom = false;
            }
         }
    });
}

SocketController.prototype.PushUpdatedMemberList = function(roomName,clients,socket,userName){
    var client = new Client();
        client.Name = userName;
        client.SocketID = socket.id;
    clients.push(client);
    io.to(roomName).emit('usersInRoomUpdate',clients);
}

SocketController.prototype.HandleLeave = function(socket,CurrentRoom,CurrentRoomName,userName){
    socket.leave(CurrentRoomName); //leave room
    io.to(CurrentRoomName).emit('left',userName); //tell everyone i left
    socket.emit('selfLeft',CurrentRoom.Neighborhood + ' (' + CurrentRoom.Name + ')'); //let myself know i left
    if(typeof CurrentRoom.Clients != 'undefined')
    {
        var removeUserIndex;
        CurrentRoom.Clients.forEach(function(val,index){
            if(val.Name == userName)
            {
                removeUserIndex = index;
                CurrentRoom.Clients.splice(removeUserIndex,1);
            }
        });
        io.to(CurrentRoomName).emit('usersInRoomUpdate',CurrentRoom.Clients); //remove me from room for everyone in it
        socket.emit('usersInRoomUpdate',CurrentRoom.Clients); //remove me from dead room list
    }
}

SocketController.prototype.RegisterBootEvent = function(socket,Room){
    var self = this;
    socket.on('bootUser', function(data) {
        if(typeof io.sockets.connected[data.SocketID] != 'undefined' && socket.handshake.query.UserName != io.sockets.connected[data.SocketID].handshake.query.UserName)
        {
             self.HandleLeave(io.sockets.connected[data.SocketID],rooms[Room.Key],Room.Name,io.sockets.connected[data.SocketID].handshake.query.UserName);
             io.sockets.connected[data.SocketID].emit('userBooted');
        }
    });
}
module.exports = SocketController;