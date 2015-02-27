var EventHandler = _.extend({}, Backbone.Events);

EventHandler.unbind('userLocationFound').on('userLocationFound', function (location) {
  NameEntryView.Lat = location.Lat;
  NameEntryView.Lon = location.Lon;
  NameEntryView.showStartButton();
});

EventHandler.unbind('selfMessage').on('selfMessage', function (data) {
  ChatView.chatWindowSubView.addMessage(data,'message','myNameMessage');
});

EventHandler.unbind('message').on('message', function (data) {
  ChatView.chatWindowSubView.addMessage(data,'message','userNameMessage');
  ChatView.updateTitle();
});

EventHandler.unbind('selfImageMessage').on('selfImageMessage', function (data) {
  ChatView.chatWindowSubView.addImageMessage(data,'message','myNameMessage');
});

EventHandler.unbind('imageMessage').on('imageMessage', function (data) {
  ChatView.chatWindowSubView.addImageMessage(data,'message','userNameMessage');
});

EventHandler.unbind('selfLightMessage').on('selfLightMessage', function (data) {
  ChatView.chatWindowSubView.addLightMessage(data,'message','myNameLightMessage');
});

EventHandler.unbind('lightMessage').on('lightMessage', function (data) {
  ChatView.chatWindowSubView.addLightMessage(data,'message','userNameLightMessage');
});

EventHandler.unbind('injectMessage').on('injectMessage', function (data) {
  ChatView.chatWindowSubView.addMessage(data,'roomMessage','');
});

EventHandler.unbind('title').on('title', function (data) {
  ChatView.displayChatTemplate(data);
});

EventHandler.unbind('joined').on('joined', function (data) {
  ChatView.chatWindowSubView.addMessage(data + " has joined",'roomMessage','');
});

EventHandler.unbind('selfjoined').on('selfjoined', function (data) {
  ChatView.chatWindowSubView.addMessage("You have joined the room '" + data + "'",'roomMessage','');
});

EventHandler.unbind('left').on('left', function (data) {
  ChatView.chatWindowSubView.addMessage(data +" has left the room",'roomMessage','');
});

EventHandler.unbind('selfLeft').on('selfLeft', function (data) {
  ChatView.chatWindowSubView.addMessage("You left the room " + data,'roomMessage','');
});

EventHandler.unbind('usersInRoomUpdate').on('usersInRoomUpdate', function (data) {
 ChatView.memberListSubView.refreshUserList(data);
});

EventHandler.unbind('userError').on('userError', function (data) {
  ChatView.displayUserError(data);
});

EventHandler.unbind('messageHistory').on('messageHistory', function(data){
	data.forEach(function(mess){
    if(mess.IsImage == false)
    {
		  ChatView.chatWindowSubView.addMessage(mess.Content,'missedMessage','userNameMissedMessage', mess.Timestamp);
    }
    else
    {
      ChatView.chatWindowSubView.addImageMessage(mess.Content,'missedMessage','userNameMissedMessage', mess.Timestamp);
    }
	});
});

EventHandler.unbind('userBooted').on('userBooted', function (data) {
  ChatView.chatWindowSubView.addMessage("You have been booted from the room",'roomMessage','');
  ChatView.disconnectTime = Date.now();
  ChatView.displayNameEntryTemplate();
});

EventHandler.unbind('typing').on('typing', function (userName) {
  ChatView.chatWindowSubView.startedTyping(userName);
});

EventHandler.unbind('stopTyping').on('stopTyping', function (userName) {
  ChatView.chatWindowSubView.stoppedTyping(userName);
});

EventHandler.unbind('weather').on('weather', function (data) {
  ChatView.chatWindowSubView.setWeather(data);
  setTimeout(function(){  EventHandler.trigger('getWeather');},60000);
});