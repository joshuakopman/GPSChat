function SocketHandler(){
  navigator.geolocation.getCurrentPosition(SocketHandler.Connect,SocketHandler.errorCallback,{timeout:10000});
}

SocketHandler.errorCallback = function(err){
 if(err.code == 1) {
    alert("Error: Access is denied!");
  }else if( err.code == 2) {
    alert("Error: Position is unavailable!");
  }
}

SocketHandler.Connect = function(location){
  console.log('connected');
  var locationLat = location.coords.latitude;
  var locationLon = location.coords.longitude;
  EventHandler.trigger('userLocationFound',{ Lat : locationLat, Lon : locationLon });
  EventHandler.unbind('connect').on('connect',function(){
        var socket = io.connect(window.location.protocol + '//' + window.location.hostname+":"+3000,
                     { 
                        forceNew : true 
                     });

        socket.emit('initialize',{ UserName : NameEntryView.userName , Lat : locationLat , Lon : locationLon });
        SocketHandler.RegisterInboundEvents(socket);
        SocketHandler.RegisterOutboundEvents(socket);
  });
}

SocketHandler.RegisterInboundEvents = function(socket){
    var receivedSocketEvents = ['message','title','joined','selfjoined','left','selfLeft','usersInRoomUpdate','userError',
                                'messageHistory','injectMessage','selfMessage','imageMessage','selfImageMessage','userBooted',
                                'lightMessage','selfLightMessage','chatLoaded','typing','stopTyping','weather'];

    receivedSocketEvents.forEach(function(eventType){
      socket.on(eventType, function (data) {
        EventHandler.trigger(eventType,data);
      });
    });
}

SocketHandler.RegisterOutboundEvents = function(socket){
    EventHandler.unbind('sendMessage').on('sendMessage', function (mess) {  
      socket.emit('message', mess, Date.now());
    });
    
    EventHandler.unbind('leave').on('leave', function () {  
       socket.emit('leave');
    });

    EventHandler.unbind('chatLoaded').on('chatLoaded',function(){
      socket.emit('getMessageHistory',ChatView.disconnectTime);
    });

    EventHandler.unbind('bootUser').on('bootUser', function (bootedUserInfo) {  
      socket.emit('bootUser', bootedUserInfo);
    });

    EventHandler.unbind('notifyTyping').on('notifyTyping', function (socketID) {  
      socket.emit('notifyTyping',NameEntryView.userName);
    });

    EventHandler.unbind('stoppedTyping').on('stoppedTyping', function (user) {  
      socket.emit('stoppedTyping',NameEntryView.userName);
    });

    EventHandler.unbind('getWeather').on('getWeather', function () { 
       socket.emit('getWeather');
    });
}