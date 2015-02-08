var EventManager = function(lat,lon){
  domManager = new DOMManager(lat,lon);
  this.OnDisconnect({Lat : lat, Lon : lon});
}

EventManager.prototype.HideUserName =  function(){
 domManager.HideUserName(); 
}

EventManager.prototype.StartChat = function(callback){
 domManager.ShowStartButton(); 
 domManager.startChat(callback);
}

EventManager.prototype.OnDisconnect = function(callback){
  domManager.OnDisconnect(callback);
}

EventManager.prototype.GetLastDisconnect = function(){
	return domManager.GetLastDisconnect();
}