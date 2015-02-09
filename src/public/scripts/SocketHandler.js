function SocketHandler(){
  navigator.geolocation.getCurrentPosition(this.GetLocation,this.errorCallback,{timeout:10000});
}

SocketHandler.prototype.errorCallback = function(err){
 if(err.code == 1) {
    alert("Error: Access is denied!");
  }else if( err.code == 2) {
    alert("Error: Position is unavailable!");
  }
}

SocketHandler.prototype.GetLocation = function(location){
  var lat = location.coords.latitude;
  var lon = location.coords.longitude;
  SocketHandler.prototype.Connect(lat,lon);
}

SocketHandler.prototype.Connect = function(lat,lon){
  var self = this;
  eventManager = new EventManager(lat,lon);

  eventManager.StartChat(function(userName){
        var socket = io.connect('http://' + window.location.hostname +':3000',
                     { 
                        query : 'UserName=' +  userName + "&Lat=" + lat + "&Lon=" + lon , 
                        forceNew : true 
                     });

        self.RegisterSocketEvents(socket);
        EventHandler.trigger('getMessageHistory');
    });
  }

SocketHandler.prototype.RegisterSocketEvents = function(socket){
     var receivedSocketEvents = ['message','title','joined','selfjoined','left','selfLeft','usersInRoomUpdate','userError','messageHistory','injectMessage'];

     receivedSocketEvents.forEach(function(eventType){
      socket.on(eventType, function (data) {
        EventHandler.trigger(eventType,data);
      });
     });


    EventHandler.unbind('sendMessage').on('sendMessage', function (mess) {  
      socket.emit('message', mess, Date.now());
    });
    
    EventHandler.unbind('leave').on('leave', function () {  
       socket.emit('leave');
    });

    EventHandler.unbind('getMessageHistory').on('getMessageHistory',function(){
      socket.emit('getMessageHistory',eventManager.GetLastDisconnect());
    });
}