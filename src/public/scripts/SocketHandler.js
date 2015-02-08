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

        self.RegisterSocketEvents(socket,lat,lon);
    });
  }

SocketHandler.prototype.RegisterSocketEvents = function(socket,lat,lon){
    socket.on('message', function (data) {
      EventHandler.trigger('message',data);
    });

    socket.on('title', function (data) {
      EventHandler.trigger('title',data);
    });

    socket.on('joined', function (data) {
      EventHandler.trigger('joined',data);
    });

    socket.on('selfjoined', function (data) {
      EventHandler.trigger('selfjoined',data);
    });

    socket.on('left', function (data) {
       EventHandler.trigger('left',data);
    });

    socket.on('selfLeft', function (data) {
      EventHandler.trigger('selfLeft',data);
    });

    socket.on('usersInRoomUpdate', function (data) {
     EventHandler.trigger('usersInRoomUpdate',data);
    });

    socket.on('userError', function (data) {
      EventHandler.trigger('userError',data);
    });

    EventHandler.on('sendMessage', function (mess) {  
      socket.emit('message', mess);
    });
    
    EventHandler.on('leave', function () {  
       socket.emit('leave');
    });
}