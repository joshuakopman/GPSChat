 
var SocketHandler = function (){
  var socket = io.connect(window.location.protocol + '//' + window.location.host,
                { 
                  forceNew : true 
                });
  var gpsLocation = '';
  var EventsRegistered = false;

  return {
    showGeoError : function(message){
      $("#entryLoader").hide();
      $("#geoError").html(message).show();
      $("#btnRetryGeo").show();
      $("#txtUserName,#btnSendUser").hide().prop('disabled',true);
    },
    clearGeoError : function(){
      $("#geoError,#btnRetryGeo").hide();
    },
    errorCallback : function(err){
      if(err.code == 1) {
        this.showGeoError("Location access is blocked. Please allow location permissions for this site, then click Retry Location.");
      } else if( err.code == 2) {
        this.showGeoError("Location is currently unavailable. Please turn on location services and click Retry Location.");
      } else {
        this.showGeoError("Unable to get your location right now. Please check location settings and click Retry Location.");
      }
    },
    determineLocationAndEstablishSocketConnection : function(cb){
      var self = this;
      self.clearGeoError();
      navigator.geolocation.getCurrentPosition(function(location){
                  gpsLocation = location;
                  cb();
      },function(err){
        self.errorCallback(err);
      },{timeout:10000});
    },
    connectToChatRoom : function(timeLastDisconnected){
      var self = this;
      this.getServerEventNames(function(serverEventsList){
            if(!EventsRegistered){
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
