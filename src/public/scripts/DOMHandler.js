var Lat;
var Lon;

function DOMHandler(lat,lon){
    Lat = lat;
    Lon = lon;
    DOMHandler.prototype.messageBoxEventHandler();
     var $chatLog = $("#chatlog");
         $chatLog.bind("DOMSubtreeModified",function() {
         $chatLog.animate({
            scrollTop: $chatLog[0].scrollHeight
         });
    });
}

DOMHandler.prototype.sendMsg = function(socket){
    var r = $("#msgbox").val();
    socket.emit('message', userName + ": " + r ,Lat,Lon);
    $("#msgbox").val('');
} 

DOMHandler.prototype.addMessage = function(m,messageClassName,userClassName) {
  var $chatLog =  $("#chatlog");
  if(m.indexOf(':') > -1){
    messSplit  = m.split(':',2);
    user = messSplit[0];  
    m = m.replace(/^[^:]*:/,'');
    $chatLog.append('<div class="' + userClassName + '">' + user + ': <div class="' + messageClassName + '">' + m + '</div></div><br/>');
  }
  else{
    $chatLog.append('<div class="' + messageClassName + '">' + m + '</div>');
  }
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
   $("#txtUserName").unbind('focus').on('focus',function(){
         $("#error").hide();
         $("#userExistsError").hide();
         $("#txtUserName").removeClass("invalid").addClass("valid");
    }).keypress( function(event) {
         if (event.which == '13') {
            event.preventDefault();
            if(!$("#userExistsError").is(':visible'))
            {
                EnterChat(callback);
            }
         }
    });

   $("#btnSendUser").unbind('click').on('click',function(){
       EnterChat(callback);
   });
}

function EnterChat(callback){
      var $txtUserName = $("#txtUserName");
      userName = $txtUserName.val();
      if(userName)
      {                 
          $txtUserName.removeClass("invalid").addClass("valid");
          $("#error").hide();
          $("#chat").show();
          $("#msgbox").show();
          callback(userName);
          console.log('attempting to connect to server socket..')
      }
      else
      {
         $("#error").show();
         $txtUserName.removeClass("valid").addClass("invalid");
      }
}

DOMHandler.prototype.OnDisconnect = function(callback){
  $("#btnDisconnect").show().unbind( "click" ).on('click',function(){
      callback();
  });
}

DOMHandler.prototype.HideUserName = function(){
    $("#userDiv").hide();
}

DOMHandler.prototype.ShowUserName = function(){
    $("#userDiv").show();
}

DOMHandler.prototype.ShowStartButton = function(){
   $("#btnSendUser").show();
}

DOMHandler.prototype.refreshUserList = function(data){
    $("#memberList").html('<div id="MemberHeader">Members</div>');
    $.each(data,function(key,val){
       DOMHandler.prototype.addMember(val);
    });
}

DOMHandler.prototype.displayUserError = function(err){
  $("#chat").hide();
  DOMHandler.prototype.ShowUserName();
  $("#userExistsError").show().html(err);
  $("#txtUserName").removeClass("valid").addClass("invalid");
}

DOMHandler.prototype.resetState = function(){
    $("#btnDisconnect").hide();
    $("#userDiv").show();
    $("#msgbox").hide();
    $("h2").hide();
}