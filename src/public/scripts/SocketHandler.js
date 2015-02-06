var lat;
var lon;
var domHandler;

function SocketHandler(){
  navigator.geolocation.getCurrentPosition(this.GetLocation,this.errorCallback,{timeout:10000});
}

SocketHandler.prototype.errorCallback =function(err){
 if(err.code == 1) {
    alert("Error: Access is denied!");
  }else if( err.code == 2) {
    alert("Error: Position is unavailable!");
  }
}

SocketHandler.prototype.GetLocation = function(location){
  lat = location.coords.latitude;
  lon = location.coords.longitude;
  domHandler = new DOMHandler(lat,lon);
  domHandler.ShowStartButton(); //can't join chat until coords are calculated
  SocketHandler.prototype.Connect();
}

SocketHandler.prototype.Connect = function(){
  domHandler.startChat(function(userName){
        socket = io.connect('http://' + window.location.hostname +':3000',
                 { 
                    query : 'UserName=' +  userName + "&Lat=" + lat + "&Lon=" + lon , 
                    forceNew : true 
                  });

        domHandler.HideUserName();

        SocketHandler.prototype.RegisterSocketEvents(socket);

        domHandler.OnDisconnect(function(){
            socket.emit('leave', {Lat : lat, Lon : lon});
        });
    });
  }

SocketHandler.prototype.RegisterSocketEvents = function(socket){
    socket.on('message', function (data) {
      domHandler.addMessage(data,'message','userNameMessage');
    });

    socket.on('title', function (data) {
      domHandler.setTitle(data);
    });

    socket.on('joined', function (data) {
      domHandler.addMessage(data + " has joined",'roomMessage','');
    });

    socket.on('selfjoined', function (data) {
      domHandler.addMessage("You have joined the room '" + data + "'",'roomMessage','');
    });

    socket.on('left', function (data) {
      domHandler.addMessage(data +" has left the room",'roomMessage','');
    });

    socket.on('selfLeft', function (data) {
      domHandler.addMessage("You have left the room " + data,'roomMessage','');
      domHandler.resetState();
    });

    socket.on('usersInRoomUpdate', function (data) {
      domHandler.refreshUserList(data);
    });

    socket.on('userError', function (data) {
      domHandler.displayUserError(data);
    });
}