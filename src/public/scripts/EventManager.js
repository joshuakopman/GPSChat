var EventManager = function(lat,lon){
  domManager = new DOMManager(lat,lon);
  this.OnDisconnect({Lat : lat, Lon : lon});
  NameEntryView.showStartButton(); 
}

EventManager.prototype.HideUserName =  function(){
 domManager.HideUserName(); 
}

EventManager.prototype.OnDisconnect = function(callback){
  domManager.OnDisconnect(callback);
}

EventManager.prototype.GetLastDisconnect = function(){
	return domManager.GetLastDisconnect();
}

EventManager.prototype.Leave = function(){
  domManager.Leave();
}

