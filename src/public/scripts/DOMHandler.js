var Lat;
var Lon;

function DOMHandler(lat,lon){
    Lat = lat;
    Lon = lon;
    DOMHandler.prototype.messageBoxEventHandler();
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
     var $chatLog = $("#chatlog");
     $chatLog.bind("DOMSubtreeModified",function() {
        $chatLog.animate({
          scrollTop: $chatLog[0].scrollHeight
       });
     });

    $("#txtUserName").on('focus',function(){
      $("#error").hide();
      $("#txtUserName").removeClass("invalid").addClass("valid");
    }).keypress( function(event) {
         if (event.which == '13') {
            event.preventDefault();
            EnterChat(callback);
         }
    });

   $("#btnSendUser").on('click',function(){
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
      }
      else
      {
         $("#error").show();
         $txtUserName.removeClass("valid").addClass("invalid");
      }
}

DOMHandler.prototype.OnDisconnect = function(callback){
  $("#btnDisconnect").show().on('click',function(){
      callback();
  });
}

DOMHandler.prototype.HideUserName = function(){
    $("#userDiv").hide();
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