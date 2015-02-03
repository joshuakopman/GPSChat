function DOMHandler(){
    DOMHandler.prototype.messageBoxEventHandler();
}

DOMHandler.prototype.sendMsg = function(socket){
    var r = $("#msgbox").val();
    socket.emit('message', userName + " : " + r );
    $("#msgbox").val('');
} 

DOMHandler.prototype.addMessage = function(m) {
    $("#chatlog").append(m).append("<BR>");
}
 
DOMHandler.prototype.setTitle = function(title){
    $("h2").show().html('You are now in room: ' + title);
}  

DOMHandler.prototype.messageBoxEventHandler = function(){
  $("#msgbox").keypress( function(event) {
         if (event.which == '13') {
            domHandler.sendMsg(socket);
            event.preventDefault();
        }
    });   
}
DOMHandler.prototype.startChat = function(callback){
   $("#btnSendUser").on('click',function(){
      userName = $("#txtUserName").val();
      callback(userName);
   });
}

DOMHandler.prototype.handleDisconnect = function(callback){
  $("#btnDisconnect").show().on('click',function(){
      callback();
  });
}

DOMHandler.prototype.resetState = function(){
    $("#btnDisconnect").hide();
    $("#userDiv").show();
}

DOMHandler.prototype.HideUserName = function(){
    $("#userDiv").hide();
}