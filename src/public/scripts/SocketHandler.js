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
  ChatView.Lat = location.coords.latitude;
  ChatView.Lon = location.coords.longitude;
  SocketHandler.prototype.Connect();
}

SocketHandler.prototype.Connect = function(){
  var self = this;
  NameEntryView.showStartButton();
  EventHandler.unbind('connect').on('connect',function(){
        var socket = io.connect('http://' + window.location.hostname +':3000',
                     { 
                        forceNew : true 
                     });
        socket.emit('initialize',{ UserName : NameEntryView.userName , Lat : ChatView.Lat , Lon : ChatView.Lon });
        self.RegisterInboundEvents(socket);
        self.RegisterOutboundEvents(socket);
  });
}

SocketHandler.prototype.RegisterInboundEvents = function(socket){
    var receivedSocketEvents = ['message','title','joined','selfjoined','left','selfLeft','usersInRoomUpdate','userError',
                                'messageHistory','injectMessage','selfMessage','imageMessage','selfImageMessage','userBooted',
                                'lightMessage','selfLightMessage','chatLoaded'];

    receivedSocketEvents.forEach(function(eventType){
      socket.on(eventType, function (data) {
        EventHandler.trigger(eventType,data);
      });
    });
}

SocketHandler.prototype.RegisterOutboundEvents = function(socket){
    EventHandler.unbind('sendMessage').on('sendMessage', function (mess) {  
      socket.emit('message', mess, Date.now());
    });
    
    EventHandler.unbind('leave').on('leave', function () {  
       socket.emit('leave');
    });

    EventHandler.unbind('chatLoaded').on('chatLoaded',function(){
      socket.emit('getMessageHistory',ChatView.disconnectTime);
    });

    EventHandler.unbind('bootUser').on('bootUser', function (socketID) {  
      socket.emit('bootUser', socketID);
    });
}