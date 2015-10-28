var InboundEventDomHandler = _.extend({}, Backbone.Events);

InboundEventDomHandler.off('userLocationFound').on('userLocationFound', function (location) {
  NameEntryView.showStartButton();
});

InboundEventDomHandler.off('selfMessage').on('selfMessage', function (data) {
 if(typeof data.ImageUrl != 'undefined'){
      ChatView.chatWindowPartial.addImageMessage(data,'message','myNameMessage');
  }else{
      ChatView.chatWindowPartial.addMessage(data,'message','myNameMessage');
  }
});

InboundEventDomHandler.off('message').on('message', function (data) {
 if(typeof data.ImageUrl != 'undefined'){
      ChatView.chatWindowPartial.addImageMessage(data,'message','userNameMessage');
  }else{
    ChatView.chatWindowPartial.addMessage(data,'message','userNameMessage');
  }
  ChatView.updateTitle();
});


InboundEventDomHandler.off('injectMessage').on('injectMessage', function (data) {
  ChatView.chatWindowPartial.addMessage(data,'roomMessage','');
});

InboundEventDomHandler.off('title').on('title', function (data) {
  ChatView.displayChatTemplate(data);
});

InboundEventDomHandler.off('joined').on('joined', function (data) {
  ChatView.chatWindowPartial.addMessage(data + " has joined",'roomMessage','');
});

InboundEventDomHandler.off('selfjoined').on('selfjoined', function (data) {
  console.log("You have joined");
  ChatView.chatWindowPartial.addMessage("You have joined the room '" + data + "'",'roomMessage','');
});

InboundEventDomHandler.off('left').on('left', function (data) {
  ChatView.chatWindowPartial.addMessage(data +" has left the room",'roomMessage','');
});

InboundEventDomHandler.off('selfLeft').on('selfLeft', function (data) {
  ChatView.chatWindowPartial.addMessage("You left the room " + data,'roomMessage','');
});

InboundEventDomHandler.off('usersInRoomUpdate').on('usersInRoomUpdate', function (data) {
 ChatView.memberListPartial.refreshUserList(data);
});

InboundEventDomHandler.off('userError').on('userError', function (data) {
  ChatView.displayUserError(data);
});

InboundEventDomHandler.off('messageHistory').on('messageHistory', function(data){
	data.forEach(function(mess){
    if(typeof data.ImageUrl != 'undefined')
    {
        ChatView.chatWindowPartial.addImageMessage(mess,'missedMessage','userNameMissedMessage', mess.Timestamp);
    }
    else
    {
        ChatView.chatWindowPartial.addMessage(mess,'missedMessage','userNameMissedMessage', mess.Timestamp);
    }
	});
});

InboundEventDomHandler.off('userBooted').on('userBooted', function (data) {
  ChatView.chatWindowPartial.addMessage("You have been booted from the room",'roomMessage','');
  ChatView.disconnectTime = Date.now();
  ChatView.displayNameEntryTemplate();
});

InboundEventDomHandler.off('typing').on('typing', function (userName) {
  ChatView.chatWindowPartial.startedTyping(userName);
});

InboundEventDomHandler.unbind('stopTyping').on('stopTyping', function (userName) {
  ChatView.chatWindowPartial.stoppedTyping(userName);
});

InboundEventDomHandler.unbind('weather').on('weather', function (data) {
  ChatView.chatWindowPartial.setWeather(data);
  setTimeout(function(){  OutboundEventHandler.trigger('getWeather');},60000);
});
