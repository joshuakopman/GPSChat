 
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
    determineLocationAndEstablishSocketConnection : function(cb){
      navigator.geolocation.getCurrentPosition(function(location){
                  gpsLocation = location;
                  cb();
      },this.errorCallback,{timeout:10000});
    },
    connectToChatRoom : function(timeLastDisconnected){
      var self = this;
      this.getServerEventNames(function(serverEventsList){
            if(!EventsRegistered){
                console.log("events registered");
                 self.fireBackboneEventsOnInboundSocketEvents(serverEventsList);
                 OutboundEventHandler.registerOutboundEvents(socket);
            }
            socket.emit('enterChatRoom',{ UserName : NameEntryView.userName , Lat : gpsLocation.coords.latitude , Lon : gpsLocation.coords.longitude, TimeDisconnected: timeLastDisconnected });
       });
    },
    getServerEventNames : function(cb){
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
    fireBackboneEventsOnInboundSocketEvents : function(serverEvents){
        serverEvents.forEach(function(eventName){
          socket.removeAllListeners(eventName).on(eventName, function (data) {
            InboundEventDomHandler.trigger(eventName,data);
          });
        });
        EventsRegistered = true;
    }   
  }
};