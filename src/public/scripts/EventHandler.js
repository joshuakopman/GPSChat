var EventHandler = _.extend({}, Backbone.Events);

EventHandler.on('message', function (data) {
  domManager.addMessage(data,'message','userNameMessage');
});

EventHandler.on('title', function (data) {
  domManager.setTitle(data);
});

EventHandler.on('joined', function (data) {
  domManager.addMessage(data + " has joined",'roomMessage','');
});

EventHandler.on('selfjoined', function (data) {
  domManager.addMessage("You have joined the room '" + data + "'",'roomMessage','');
});

EventHandler.on('left', function (data) {
  domManager.addMessage(data +" has left the room",'roomMessage','');
});

EventHandler.on('selfLeft', function (data) {
  domManager.addMessage("You have left the room " + data,'roomMessage','');
  domManager.resetState();
});

EventHandler.on('usersInRoomUpdate', function (data) {
 domManager.refreshUserList(data);
});

EventHandler.on('userError', function (data) {
  domManager.displayUserError(data);
});

EventHandler.on('messageHistory', function(data){
	data.forEach(function(mess){
		console.log(mess);
		domManager.addMessage(mess.Content,'missedMessage','userNameMissedMessage');
	});
});
	
