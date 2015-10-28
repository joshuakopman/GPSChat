
function SocketHandler(){
  this.socket = '';
  this.gpsLocation = '';
}

SocketHandler.prototype.errorCallback = function(err){
 if(err.code == 1) {
    alert("Error: Access is denied!");
  }else if( err.code == 2) {
    alert("Error: Position is unavailable!");
  }
}

SocketHandler.prototype.DetermineLocationAndEstablishSocketConnection = function(cb){
  var self = this;
  navigator.geolocation.getCurrentPosition(function(location){
              self.gpsLocation = location;
              self.socket = io.connect(window.location.protocol + '//' + window.location.hostname + ":" + 3000,
                            { 
                              forceNew : true 
                            });
              cb();
  },this.errorCallback,{timeout:10000});

}

SocketHandler.prototype.ConnectToChatRoom = function(timeLastDisconnected){
  var self = this;
  this.GetServerEventNames(function(eventsList){
           self.FireBackboneEventsOnInboundSocketEvents(eventsList);
           OutboundEventHandler.RegisterOutboundEvents(self.socket);
           self.socket.emit('enterChatRoom',{ UserName : NameEntryView.userName , Lat : self.gpsLocation.coords.latitude , Lon : self.gpsLocation.coords.longitude, TimeDisconnected: timeLastDisconnected });
     });
}
SocketHandler.prototype.GetServerEventNames = function(cb){
    var eventList = [];
     $.getJSON('/events',function(receivedSocketEvents){
        for (var property in receivedSocketEvents) {
            if (receivedSocketEvents.hasOwnProperty(property)){
                eventList.push(receivedSocketEvents[property]);
            }
        }
        cb(eventList);
      }); 
}

SocketHandler.prototype.FireBackboneEventsOnInboundSocketEvents = function(serverEvents){
   var self = this;
    serverEvents.forEach(function(eventName){
      self.socket.on(eventName, function (data) {
        InboundEventDomHandler.trigger(eventName,data);
      });
    });
}


