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
  var locationLat = location.coords.latitude;
  var locationLon = location.coords.longitude;
  EventHandler.trigger('userLocationFound');
  EventHandler.unbind('connect').on('connect',function(){
        var socket = io.connect(window.location.protocol + '//' + window.location.hostname + ":" + 3000,
                     { 
                        forceNew : true 
                     });
        SocketHandler.GetInboundEvents(function(eventsList){
           SocketHandler.RegisterInboundEvents(socket,eventsList);
           SocketHandler.RegisterOutboundEvents(socket);
           socket.emit('initialize',{ UserName : NameEntryView.userName , Lat : locationLat , Lon : locationLon });
        });

  });
}

SocketHandler.GetInboundEvents = function(callback){
    var eventList = [];
     $.getJSON('/events',function(receivedSocketEvents){
        for (var property in receivedSocketEvents) {
            if (receivedSocketEvents.hasOwnProperty(property)){
                eventList.push(receivedSocketEvents[property]);
            }
        }
        callback(eventList);
      }); 
}

SocketHandler.RegisterInboundEvents = function(socket, inboundEvents){
    inboundEvents.forEach(function(eventName){
      socket.on(eventName, function (data) {
        EventHandler.trigger(eventName,data);
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