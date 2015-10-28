var Room = require('../models/Room');
var Client = require('../models/Client');
var SocketHelper = require('../helpers/SocketHelper');
var messageHelper = require('../helpers/MessageHelper');
var ServiceManager = require('./ServiceManager');
var Config = require('../Config');
var Events = require('../constants/Events');
var ClientEvents = require('../constants/ClientEvents');

var SocketManager = function(io,socket,rooms){

    var socketHelper = new SocketHelper(io.sockets);

    return{
        onConnection : function(){
            var self = this;
            socket.on(ClientEvents.OnEnterChatRoom,function(userInformation){
                self.findAndJoinChatRoom(userInformation,function(room,userName){
                    if(room)
                    {
                        self.registerLeaveEvent(rooms[room.Key],room.Name,userName);
                        self.registerDisconnectEvent(rooms[room.Key],room.Name,userName);
                        self.registerMessageEvent(room,userName);
                        self.registerBootEvent(room,userName);
                        self.registerTypingEvents(room,userName);
                        self.registerWeatherEvent(userInformation,socket);
                        self.initializeChatRoom(room,userInformation,userName);

                        if(room.Clients.length > Config.RoomCapacity){
                            room.Radius = room.Radius - Config.RadiusInterval;
                        }

                    }
                });
            });
        },
        initializeChatRoom : function(room,initialObj,user){
            socket.emit(Events.SendRoomTitle,rooms[room.Key].Neighborhood + ' (' + room.Name + ')');
            this.pushUpdatedMemberList(room.Name,rooms[room.Key].Clients,user);
            socket.broadcast.to(room.Name).emit(Events.NewUserJoined, user);
            this.sendMissedMessageHistory(room,initialObj);
            socket.emit(Events.SelfJoined,socketHelper.getRoomTitle(room.Neighborhood,room.Name));
            console.log("You have joined");
            new ServiceManager().GetWeather(initialObj.Lat,initialObj.Lon,function(data){
                     socket.emit(Events.SendWeather,data);
                     socket.emit(Events.Loaded);
            });
        },
        findAndJoinChatRoom : function(userInformation,callback){
             var UserName = userInformation.UserName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
             var latNum = parseFloat(userInformation.Lat).toFixed(2);
             var lonNum = parseFloat(userInformation.Lon).toFixed(2);
             var existingRoom = socketHelper.findExistingRoom(latNum,lonNum,rooms);
             if(existingRoom)
             {
                if(socketHelper.checkIfNameTaken(existingRoom.Clients,UserName) == false)
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
                new ServiceManager().GetNeighborhoodByCoords(latNum,lonNum,function(neighborhood){
                       var newRoom = new Room(latNum + " " + lonNum,neighborhood);
                       rooms[newRoom.Key] = newRoom;
                       socket.join(newRoom.Name);

                       return callback(newRoom,UserName);
                });
             }

             console.log("User Joined | Name: '" + userInformation.UserName + "' | IP: '" + socket.handshake.address + "'");
        },
        registerTypingEvents : function(Room,userName){
            socket.on(ClientEvents.OnNotifyTyping, function(userType){
                io.to(Room.Name).emit(Events.StartedTyping,userType);
            });

           socket.on(ClientEvents.OnStoppedTyping, function(userStop){
                io.to(Room.Name).emit(Events.StoppedTyping,userStop);
            });
        },
        registerMessageEvent : function(Room,userName){
           socket.on(ClientEvents.OnMessageReceived, function(clientMessage,timestamp){
              clientMessage = clientMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;");
              if(clientMessage.indexOf('&lt;script') < 0)
              {
                 messageHelper.handleSpecialMessage(clientMessage, timestamp, function(result){
                      socket.broadcast.to(Room.Name).emit(Events.Message, result);
                      socket.emit(Events.SelfMessage,result);
                      rooms[Room.Key].Messages.push(result);
                 });
              }
              else
              {
                  io.to(Room.Name).emit(Events.BlockedJavascript,userName +" tried to inject javascript and FAILED");
              }
           });
        },
        registerLeaveEvent : function(existingRoom,currentRoomName,userName){
            var self = this;
             socket.on(ClientEvents.OnLeave, function() {
                    self.handleLeave(existingRoom, currentRoomName,userName,true);
             })
        },
        registerDisconnectEvent : function(existingRoom,currentRoomName,userName){
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
                      self.handleLeave(existingRoom, currentRoomName,userName,true);
                      isUserInRoom = false;
                  }
               }
          });
      },
      registerBootEvent : function(Room,myUserName){
          var self = this;
          socket.on(ClientEvents.OnBootUser, function(data) {
              if(typeof io.sockets.connected[data.SocketID] != 'undefined' && socket.id != data.SocketID)
              {
                   self.handleLeave(io.sockets.connected[data.SocketID],rooms[Room.Key],Room.Name,data.UserName,false);
                   io.sockets.connected[data.SocketID].emit(Events.BootedUser);
              }
          });
      },
      registerWeatherEvent : function(initialObject){
          socket.on(ClientEvents.OnWeatherRequested,function(){
              new ServiceManager().GetWeather(initialObject.Lat,initialObject.Lon,function(data){
                   socket.emit(Events.SendWeather,data);
              });
          });
      },
      handleLeave : function(CurrentRoom,CurrentRoomName,userName,notBoot){
          socket.leave(CurrentRoomName); //leave room
          io.to(CurrentRoomName).emit(Events.UserLeft,userName); //tell everyone i left
          if(notBoot)
          {
            socket.emit(Events.SelfLeft,socketHelper.getRoomTitle(CurrentRoom.Neighborhood,CurrentRoom.Name)); //let myself know i left
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
      },
      pushUpdatedMemberList : function(roomName,clients,userName){
          var client = new Client();
              client.Name = userName;
              client.SocketID = socket.id;
          clients.push(client);
          io.to(roomName).emit(Events.SendUpdatedMemberList,clients);
      },
      sendMissedMessageHistory : function(room,initialObject){
        var timestamp = initialObject.TimeDisconnected;
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
                  recentMessages.push(mess);
                }
              });
             
        }
        socket.emit(Events.SendMessageHistory,recentMessages);
      }
  }

}


module.exports = SocketManager;