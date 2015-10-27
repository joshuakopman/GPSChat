var Room = require('../models/Room');
var Client = require('../models/Client');
var SocketHelper = require('../helpers/SocketHelper');
var MessageHelper = require('../helpers/MessageHelper');
var ServiceController = require('./ServiceController');
var io;
var socketHelper;
var rooms=[];
var Config = require('../Config');
var Events = require('../constants/Events');
var ClientEvents = require('../constants/ClientEvents');

function SocketController(IO){
    io = IO;
    socketHelper = new SocketHelper(io.sockets);
}

SocketController.prototype.OnConnection = function(socket){
    var self = this;
    socket.on(ClientEvents.OnEnterChatRoom,function(initialObject){
        self.FindAndJoinChatRoom(socket,initialObject,function(room,userName){
            if(room)
            {
                self.RegisterLeaveEvent(socket,rooms[room.Key],room.Name,userName);
                self.RegisterDisconnectEvent(socket,rooms[room.Key],room.Name,userName);
                self.RegisterMessageHistoryEvent(socket,room);
                self.RegisterMessageEvent(socket,room,userName);
                self.RegisterBootEvent(socket,room,userName);
                self.RegisterTypingEvents(socket,room,userName);
                self.RegisterWeatherEvent(initialObject,socket);
                self.InitializeChatRoom(socket,room,initialObject,userName);

                if(room.Clients.length > Config.RoomCapacity){
                    room.Radius = room.Radius - Config.RadiusInterval;
                }

            }
        });
    });
}

SocketController.prototype.InitializeChatRoom = function(socket,room,initialObj,user){
    socket.emit(Events.SendRoomTitle,rooms[room.Key].Neighborhood + ' (' + room.Name + ')');
    this.PushUpdatedMemberList(room.Name,rooms[room.Key].Clients,socket,user);
    socket.broadcast.to(room.Name).emit(Events.NewUserJoined, user);
    new ServiceController().GetWeather(initialObj.Lat,initialObj.Lon,function(data){
             socket.emit(Events.SendWeather,data);
             socket.emit(Events.Loaded);
    });
}

SocketController.prototype.FindAndJoinChatRoom = function(socket,initializeObject,callback){
     var UserName = initializeObject.UserName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
     var latNum = parseFloat(initializeObject.Lat).toFixed(2);
     var lonNum = parseFloat(initializeObject.Lon).toFixed(2);
     var existingRoom = socketHelper.FindExistingRoom(latNum,lonNum,rooms);
     if(existingRoom)
     {
        if(socketHelper.CheckIfNameTaken(existingRoom.Clients,UserName) == false)
        {
            socket.join(existingRoom.Name);
            return callback(existingRoom,UserName);
        }
        else
        {   
            socket.emit(Events.UserError,'A user with that name is already in the room.');
            return callback(null);
        }
     }
     else
     {
        new ServiceController().GetNeighborhoodByCoords(latNum,lonNum,function(neighborhood){
               var newRoom = new Room(latNum + " " + lonNum,neighborhood);
               rooms[newRoom.Key] = newRoom;
               socket.join(newRoom.Name);

               return callback(newRoom,UserName);
        });
     }

     console.log("User Joined | Name: '" + initializeObject.UserName + "' | IP: '" + socket.handshake.address + "'");
}

SocketController.prototype.RegisterTypingEvents = function(socket,Room,userName){
    socket.on(ClientEvents.OnNotifyTyping, function(userType){
        io.to(Room.Name).emit(Events.StartedTyping,userType);
    });

   socket.on(ClientEvents.OnStoppedTyping, function(userStop){
        io.to(Room.Name).emit(Events.StoppedTyping,userStop);
    });
}

SocketController.prototype.RegisterMessageEvent = function(socket,Room,userName){
     socket.on(ClientEvents.OnMessageReceived, function(clientMessage,timestamp){
        clientMessage = clientMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var messageHelper = new MessageHelper();
        if(clientMessage.indexOf('&lt;script') < 0)
        {
           messageHelper.HandleSpecialMessage(clientMessage, timestamp, function(result){
                socket.broadcast.to(Room.Name).emit(Events.Message, result);
                socket.emit(Events.SelfMessage,result);
                console.log("adding to message history"+result);
                rooms[Room.Key].Messages.push(result);
           });
        }
        else
        {
            io.to(Room.Name).emit(Events.BlockedJavascript,userName +" tried to inject javascript and FAILED");
        }
     });
}

SocketController.prototype.RegisterMessageHistoryEvent = function(socket,room){
    socket.on(ClientEvents.OnMessageHistoryRequested, function(timestamp) {

        if(typeof timestamp == 'undefined')
        {
            var d1 = new Date();
            var d2 = new Date(d1);
            d2.setHours(d1.getHours() - 3);
            timestamp = d2;
        }

        var key = room.Key;
        if(typeof rooms[key] != 'undefined')
        {
            rooms[key].Messages = rooms[key].Messages.slice(-100); //make sure to not store more than 100 messages back
            var allMessages = rooms[key].Messages;
            var recentMessages=[];
            allMessages.forEach( function (mess){
              if(mess.Timestamp > timestamp){
                console.log(mess);
                recentMessages.push(mess);
              }
            });
           socket.emit(Events.SendMessageHistory,recentMessages);
        }
        socket.emit(Events.SelfJoined,socketHelper.GetRoomTitle(room.Neighborhood,room.Name));
    });
}

SocketController.prototype.RegisterLeaveEvent = function(socket,existingRoom,currentRoomName,userName){
    var self = this;
     socket.on(ClientEvents.OnLeave, function() {
            self.HandleLeave(socket,existingRoom, currentRoomName,userName,true);
        })
}

SocketController.prototype.RegisterDisconnectEvent = function(socket,existingRoom,currentRoomName,userName){
    var self = this;
     socket.on(ClientEvents.OnDisconnect, function() {
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
                self.HandleLeave(socket, existingRoom, currentRoomName,userName,true);
                isUserInRoom = false;
            }
         }
    });
}

SocketController.prototype.RegisterBootEvent = function(socket,Room,myUserName){
    var self = this;
    socket.on(ClientEvents.OnBootUser, function(data) {
        if(typeof io.sockets.connected[data.SocketID] != 'undefined' && socket.id != data.SocketID)
        {
             self.HandleLeave(io.sockets.connected[data.SocketID],rooms[Room.Key],Room.Name,data.UserName,false);
             io.sockets.connected[data.SocketID].emit(Events.BootedUser);
        }
    });
}

SocketController.prototype.PushUpdatedMemberList = function(roomName,clients,socket,userName){
    var client = new Client();
        client.Name = userName;
        client.SocketID = socket.id;
    clients.push(client);
    io.to(roomName).emit(Events.SendUpdatedMemberList,clients);
}

SocketController.prototype.HandleLeave = function(socket,CurrentRoom,CurrentRoomName,userName,notBoot){
    socket.leave(CurrentRoomName); //leave room
    io.to(CurrentRoomName).emit(Events.UserLeft,userName); //tell everyone i left
    if(notBoot)
    {
      socket.emit(Events.SelfLeft,socketHelper.GetRoomTitle(CurrentRoom.Neighborhood,CurrentRoom.Name)); //let myself know i left
    }
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
        io.to(CurrentRoomName).emit(Events.SendUpdatedMemberList,CurrentRoom.Clients); //remove me from room for everyone in it
        socket.emit(Events.SendUpdatedMemberList,CurrentRoom.Clients); //remove me from dead room list
    }
}

SocketController.prototype.RegisterWeatherEvent = function(initialObject,socket){
    socket.on(ClientEvents.OnWeatherRequested,function(){
        new ServiceController().GetWeather(initialObject.Lat,initialObject.Lon,function(data){
             socket.emit(Events.SendWeather,data);
        });
    });
}

module.exports = SocketController;