var Room = require('../models/Room'),
    Client = require('../models/Client'),
    SocketHelper = require('../helpers/SocketHelper'),
    messageHelper = require('../helpers/MessageHelper'),
    ServiceManager = require('./ServiceManager'),
    Config = require('../Config'),
    Events = require('../constants/Events'),
    ClientEvents = require('../constants/ClientEvents');

var SocketManager = function(io,socket,rooms){

    var socketHelper = new SocketHelper(io.sockets),
        serviceManager = new ServiceManager(),
        eventsRegistered = false;

    return{
        onConnection : function(){
            var self = this;
            socket.on(ClientEvents.OnEnterChatRoom,function(userInformation){
                self.findAndJoinChatRoom(userInformation,function(room,userName){
                    if(room)
                    {
                      if(!eventsRegistered){
                        self.registerLeaveEvent(room,userName);
                        self.registerDisconnectEvent(room,userName);
                        self.registerMessageEvent(room,userName);
                        self.registerBootEvent(room,userName);
                        self.registerTypingEvents(room);
                        self.registerWeatherEvent(userInformation);
                        eventsRegistered = true;
                      }

                        self.initializeChatRoom(room,userInformation);
                    }
                });
            });
        },
        initializeChatRoom : function(room,userInformation){
            socket.emit(Events.SendRoomTitle,rooms[room.Key].Neighborhood + ' (' + room.Name + ')');
            this.pushUpdatedMemberList(room.Name,rooms[room.Key].Clients,userInformation.UserName );
            socket.broadcast.to(room.Name).emit(Events.NewUserJoined, userInformation.UserName );
            this.sendMissedMessageHistory(room,userInformation);
            socket.emit(Events.SelfJoined,socketHelper.getRoomTitle(room.Neighborhood,room.Name));
            serviceManager.getWeather(userInformation.Lat,userInformation.Lon,function(data){
                socket.emit(Events.SendWeather,data);
            });
        },
        findAndJoinChatRoom : function(userInformation,callback){
             userInformation.UserName = userInformation.UserName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
             var latNum = parseFloat(userInformation.Lat);
             var lonNum = parseFloat(userInformation.Lon);
             var maxGranularityIndex = Config.RoomBucketSizes.length - 1;
             var zoomLevels = Config.ReverseGeocodeZoomLevels || [];
             var self = this;

             if(isNaN(latNum) || isNaN(lonNum))
             {
                socket.emit(Events.UserError,'Invalid geolocation coordinates.');
                return callback(null);
             }

             var tryJoinAtLevel = function(level){
                var placement = socketHelper.getRoomPlacement(latNum,lonNum,level,Config.RoomBucketSizes);
                var existingRoom = socketHelper.findRoomByPlacement(rooms,placement);

                if(existingRoom)
                {
                    if(socketHelper.checkIfNameTaken(existingRoom.Clients,userInformation.UserName) == true)
                    {
                        socket.emit(Events.UserError,'A user with that name is already in the room.');
                        return callback(null);
                    }

                    if(existingRoom.Clients.length >= Config.RoomCapacity && placement.Level < maxGranularityIndex)
                    {
                        return tryJoinAtLevel(placement.Level + 1);
                    }

                    socket.join(existingRoom.Name);
                    return callback(existingRoom,userInformation.UserName);
                }

                var zoom = zoomLevels[placement.Level] || zoomLevels[zoomLevels.length - 1] || 10;
                serviceManager.getNeighborhoodByCoords(latNum,lonNum,zoom,function(neighborhood){
                       var newRoom = new Room(placement.RoomName, neighborhood, [], 0.9, placement.Key, placement.Level, placement.BucketSize);
                       rooms[newRoom.Key] = newRoom;
                       socket.join(newRoom.Name);
                       return callback(newRoom,userInformation.UserName);
                });
             };

             tryJoinAtLevel(0);
        },
        registerTypingEvents : function(Room){
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
        registerLeaveEvent : function(currentRoom,userName){
            var self = this;
             socket.on(ClientEvents.OnLeave, function() {
                    self.handleLeave(rooms[currentRoom.Key], currentRoom.Name,userName,true);
             })
        },
      registerDisconnectEvent : function(currentRoom,userName){
          var self = this;
           var onSocketDisconnected = function() {
               var isUserInRoom = false;
               var existingRoom = rooms[currentRoom.Key];
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
                      self.handleLeave(existingRoom,currentRoom.Name,userName,true);
                      isUserInRoom = false;
                  }
               }
          };

          // Handle real socket teardown (tab close, browser close, network drop).
          socket.on('disconnect', onSocketDisconnected);

          // Keep legacy client-emitted disconnect event support.
          socket.on(ClientEvents.OnDisconnect, onSocketDisconnected);
      },
      registerBootEvent : function(Room,myUserName){
          var self = this;
          socket.on(ClientEvents.OnBootUser, function(data) {
              var targetSocket = (io.sockets && io.sockets.sockets && io.sockets.sockets.get)
                ? io.sockets.sockets.get(data.SocketID)
                : undefined;

              if(typeof targetSocket != 'undefined' && socket.id != data.SocketID)
              {
                   self.handleLeave(rooms[Room.Key], Room.Name, data.UserName, false);
                   targetSocket.emit(Events.BootedUser);
              }
          });
      },
      registerWeatherEvent : function(initialObject){
          socket.on(ClientEvents.OnWeatherRequested,function(){
              serviceManager.getWeather(initialObject.Lat,initialObject.Lon,function(data){
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
              var recentMessages = [];
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
