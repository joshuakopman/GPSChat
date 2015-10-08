var EventHandler = _.extend({}, Backbone.Events);

EventHandler.unbind('userLocationFound').on('userLocationFound', function (location) {
  NameEntryView.showStartButton();
});

EventHandler.unbind('selfMessage').on('selfMessage', function (data) {
  ChatView.chatWindowPartial.addMessage(data,'message','myNameMessage');
});

EventHandler.unbind('message').on('message', function (data) {
  ChatView.chatWindowPartial.addMessage(data,'message','userNameMessage');
  ChatView.updateTitle();
});

EventHandler.unbind('selfImageMessage').on('selfImageMessage', function (data) {
  ChatView.chatWindowPartial.addImageMessage(data,'message','myNameMessage');
});

EventHandler.unbind('imageMessage').on('imageMessage', function (data) {
  ChatView.chatWindowPartial.addImageMessage(data,'message','userNameMessage');
});

EventHandler.unbind('selfLightMessage').on('selfLightMessage', function (data) {
  ChatView.chatWindowPartial.addLightMessage(data,'message','myNameLightMessage');
});

EventHandler.unbind('lightMessage').on('lightMessage', function (data) {
  ChatView.chatWindowPartial.addLightMessage(data,'message','userNameLightMessage');
});

EventHandler.unbind('injectMessage').on('injectMessage', function (data) {
  ChatView.chatWindowPartial.addMessage(data,'roomMessage','');
});

EventHandler.unbind('title').on('title', function (data) {
  ChatView.displayChatTemplate(data);
});

EventHandler.unbind('joined').on('joined', function (data) {
  ChatView.chatWindowPartial.addMessage(data + " has joined",'roomMessage','');
});

EventHandler.unbind('selfjoined').on('selfjoined', function (data) {
  ChatView.chatWindowPartial.addMessage("You have joined the room '" + data + "'",'roomMessage','');
});

EventHandler.unbind('left').on('left', function (data) {
  ChatView.chatWindowPartial.addMessage(data +" has left the room",'roomMessage','');
});

EventHandler.unbind('selfLeft').on('selfLeft', function (data) {
  ChatView.chatWindowPartial.addMessage("You left the room " + data,'roomMessage','');
});

EventHandler.unbind('usersInRoomUpdate').on('usersInRoomUpdate', function (data) {
 ChatView.memberListPartial.refreshUserList(data);
});

EventHandler.unbind('userError').on('userError', function (data) {
  ChatView.displayUserError(data);
});

EventHandler.unbind('messageHistory').on('messageHistory', function(data){
	data.forEach(function(mess){
    if(mess.IsImage == false)
    {
		  ChatView.chatWindowPartial.addMessage(mess.Content,'missedMessage','userNameMissedMessage', mess.Timestamp);
    }
    else
    {
      ChatView.chatWindowPartial.addImageMessage(mess.Content,'missedMessage','userNameMissedMessage', mess.Timestamp);
    }
	});
});

EventHandler.unbind('userBooted').on('userBooted', function (data) {
  ChatView.chatWindowPartial.addMessage("You have been booted from the room",'roomMessage','');
  ChatView.disconnectTime = Date.now();
  ChatView.displayNameEntryTemplate();
});

EventHandler.unbind('typing').on('typing', function (userName) {
  ChatView.chatWindowPartial.startedTyping(userName);
});

EventHandler.unbind('stopTyping').on('stopTyping', function (userName) {
  ChatView.chatWindowPartial.stoppedTyping(userName);
});

EventHandler.unbind('weather').on('weather', function (data) {
  ChatView.chatWindowPartial.setWeather(data);
  setTimeout(function(){  EventHandler.trigger('getWeather');},60000);
});