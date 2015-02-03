var Lat;
var Lon;

function DOMHandler(lat,lon){
    Lat = lat;
    Lon = lon;
    DOMHandler.prototype.messageBoxEventHandler();
}

DOMHandler.prototype.sendMsg = function(socket){
    var r = $("#msgbox").val();
    socket.emit('message', userName + " : " + r ,Lat,Lon);
    $("#msgbox").val('');
} 

DOMHandler.prototype.addMessage = function(m,className) {
    $("#chatlog").append('<div class="' + className + '">' + m + '</div>');
}
 
DOMHandler.prototype.addMember = function(m) {
    $("#memberList").append(m).append("<br>");
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
    $("#memberList").html('<div id="MemberHeader">Members</div>');
    $.each(data,function(key,val){
       DOMHandler.prototype.addMember(val);
    });
}