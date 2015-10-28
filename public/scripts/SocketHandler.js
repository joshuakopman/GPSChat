 
var SocketHandler = function (){
  var socket = io.connect(window.location.protocol + '//' + window.location.hostname + ":" + 3000,
                { 
                  forceNew : true 
                });
  var gpsLocation = '';
  var EventsRegistered = false;

  return {
    errorCallback : function(err){
     if(err.code == 1) {
        alert("Error: Access is denied!");
      }else if( err.code == 2) {
        alert("Error: Position is unavailable!");
      }
    },
    DetermineLocationAndEstablishSocketConnection : function(cb){
      navigator.geolocation.getCurrentPosition(function(location){
                  gpsLocation = location;
                  cb();
      },this.errorCallback,{timeout:10000});
    },
    ConnectToChatRoom : function(timeLastDisconnected){
      var self = this;
      this.GetServerEventNames(function(serverEventsList){
            if(EventsRegistered == false){
                 self.FireBackboneEventsOnInboundSocketEvents(serverEventsList);
                 OutboundEventHandler.RegisterOutboundEvents(socket);
            }
            socket.emit('enterChatRoom',{ UserName : NameEntryView.userName , Lat : gpsLocation.coords.latitude , Lon : gpsLocation.coords.longitude, TimeDisconnected: timeLastDisconnected });
       });
    },
    GetServerEventNames : function(cb){
      var eventList = [];
       $.getJSON('/events',function(receivedSocketEvents){
          for (var property in receivedSocketEvents) {
              if (receivedSocketEvents.hasOwnProperty(property)){
                  eventList.push(receivedSocketEvents[property]);
              }
          }
          cb(eventList);
        }); 
    },
    FireBackboneEventsOnInboundSocketEvents : function(serverEvents){
        serverEvents.forEach(function(eventName){
          socket.removeAllListeners(eventName).on(eventName, function (data) {
            InboundEventDomHandler.trigger(eventName,data);
          });
        });
        EventsRegistered = true;
    }   
  }
};