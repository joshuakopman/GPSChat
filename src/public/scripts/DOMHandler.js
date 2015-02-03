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
 
DOMHandler.prototype.addMember = function(m) {
    $("#memberList").append("<BR>").append(m);
}

DOMHandler.prototype.setTitle = function(title){
    $("h2").show().html('You are now in room: ' + title);
}  

DOMHandler.prototype.messageBoxEventHandler = function(){
  $("#msgbox").keypress( function(event) {
         if (event.which == '13') {
            DOMHandler.prototype.sendMsg(socket);
            event.preventDefault();
        }
    });   
}

DOMHandler.prototype.startChat = function(callback){
   $("#btnSendUser").on('click',function(){
      userName = $("#txtUserName").val();
      $("#chat").show();
      $("#msgbox").show();
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
    $("#msgbox").hide();
}

DOMHandler.prototype.HideUserName = function(){
    $("#userDiv").hide();
}

DOMHandler.prototype.refreshUserList = function(data){
    $("#memberList").html('Members');
    $.each(data,function(key,val){
       DOMHandler.prototype.addMember(val);
    });
}