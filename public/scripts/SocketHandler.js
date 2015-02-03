function SocketHandler(){
    navigator.geolocation.getCurrentPosition(this.GetLocation);
}

SocketHandler.prototype.GetLocation = function(location){
    lat = location.coords.latitude;
    lon = location.coords.longitude;
    SocketHandler.prototype.Connect();
}

SocketHandler.prototype.Connect = function(){
  domHandler.startChat(function(userName){
        socket = io.connect('http://localhost:3000',{ query : 'UserName=' +  userName });

        domHandler.HideUserName();

        SocketHandler.prototype.RegisterEvents(socket);

        domHandler.handleDisconnect(function(){
            socket.emit('leave',{userName : userName});
        });
    });
  }

SocketHandler.prototype.RegisterEvents = function(socket){
     socket.on('connect',function (data) {
          socket.emit('findFriends', {Lat : lat, Lon : lon} );
      });

      socket.on('message', function (data) {
          domHandler.addMessage(data);
      });

      socket.on('title', function (data) {
          domHandler.setTitle(data);
      });

      socket.on('joined', function (data) {
        domHandler.addMessage(data + " has joined");
      });

      socket.on('left', function (data) {
        domHandler.addMessage(data.userName +" has left the room");
      });

      socket.on('selfLeft', function (data) {
        domHandler.addMessage("You have left the room");
        domHandler.resetState();
      });
}