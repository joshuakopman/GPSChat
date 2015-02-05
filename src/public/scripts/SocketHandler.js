var lat;
var lon;
var domHandler;

function SocketHandler(){
    navigator.geolocation.getCurrentPosition(this.GetLocation);
}

SocketHandler.prototype.GetLocation = function(location){
    lat = location.coords.latitude;
    lon = location.coords.longitude;
    domHandler = new DOMHandler(lat,lon);
    SocketHandler.prototype.Connect();
}

SocketHandler.prototype.Connect = function(){
  domHandler.startChat(function(userName){
        socket = io.connect('http://' + window.location.hostname +':3000',{ query : 'UserName=' +  userName });

        domHandler.HideUserName();

        SocketHandler.prototype.RegisterEvents(socket);

        domHandler.handleDisconnect(function(){
            socket.emit('leave', {Lat : lat, Lon : lon});
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
        domHandler.addMessage(data + " has joined",'roomMessage');
      });

      socket.on('selfjoined', function (data) {
        domHandler.addMessage("You have joined",'roomMessage');

      });

      socket.on('left', function (data) {
        domHandler.addMessage(data +" has left the room",'roomMessage');
      });

      socket.on('selfLeft', function (data) {
           location.reload();
      });

      socket.on('usersInRoomUpdate', function (data) {
        domHandler.refreshUserList(data);
      });

}