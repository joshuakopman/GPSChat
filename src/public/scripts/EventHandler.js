var EventHandler = _.extend({}, Backbone.Events);

EventHandler.unbind('message').on('message', function (data) {
  domManager.addMessage(data,'message','userNameMessage');
});

EventHandler.unbind('injectMessage').on('injectMessage', function (data) {
  domManager.addMessage(data,'roomMessage','');
});

EventHandler.unbind('title').on('title', function (data) {
  domManager.displayChatRoom(data);
});

EventHandler.unbind('joined').on('joined', function (data) {
  domManager.addMessage(data + " has joined",'roomMessage','');
});

EventHandler.unbind('selfjoined').on('selfjoined', function (data) {
  domManager.addMessage("You have joined the room '" + data + "'",'roomMessage','');
});

EventHandler.unbind('left').on('left', function (data) {
  domManager.addMessage(data +" has left the room",'roomMessage','');
});

EventHandler.unbind('selfLeft').on('selfLeft', function (data) {
  domManager.addMessage("You left the room " + data,'roomMessage','');
  domManager.resetState();
});

EventHandler.unbind('usersInRoomUpdate').on('usersInRoomUpdate', function (data) {
 domManager.refreshUserList(data);
});

EventHandler.unbind('userError').on('userError', function (data) {
  domManager.displayUserError(data);
});

EventHandler.unbind('messageHistory').on('messageHistory', function(data){
  console.log(data);
	data.forEach(function(mess){
		domManager.addMessage(mess.Content,'missedMessage','userNameMissedMessage');
	});
});