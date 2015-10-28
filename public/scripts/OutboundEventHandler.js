var OutboundEventHandler = _.extend({}, Backbone.Events);

OutboundEventHandler.registerOutboundEvents = function(socket){

OutboundEventHandler.off('sendMessage').on('sendMessage', function (mess) {  
console.log("client firing message");
      socket.emit('message', mess, Date.now());
    });
    
    OutboundEventHandler.off('leave').on('leave', function () {  
       socket.emit('leave');
    });

    OutboundEventHandler.off('bootUser').on('bootUser', function (bootedUserInfo) {  
      socket.emit('bootUser', bootedUserInfo);
    });

    OutboundEventHandler.off('notifyTyping').on('notifyTyping', function () {  
      socket.emit('notifyTyping',NameEntryView.userName);
    });

    OutboundEventHandler.off('stoppedTyping').on('stoppedTyping', function () {  
      socket.emit('stoppedTyping',NameEntryView.userName);
    });

    OutboundEventHandler.off('getWeather').on('getWeather', function () { 
       socket.emit('getWeather');
    });

    OutboundEventHandler.off('connect').on('connect', function () { 
       socket.emit('getWeather');
    });
}
