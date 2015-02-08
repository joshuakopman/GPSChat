var Lat;
var Lon;

function DOMManager(lat,lon){
    Lat = lat;
    Lon = lon;
    this.messageBoxEventHandler();
     var $chatLog = $("#chatlog");
         $chatLog.bind("DOMSubtreeModified",function() {
         $chatLog.animate({
            scrollTop: $chatLog[0].scrollHeight
         });
    });
}

DOMManager.prototype.sendMsg = function(){
    var r = $("#msgbox").val();
    EventHandler.trigger('sendMessage',userName + ": " + r ,Lat,Lon);
    $("#msgbox").val('');
} 

DOMManager.prototype.addMessage = function(m,messageClassName,userClassName) {
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
 
DOMManager.prototype.addMember = function(m) {
    $("#memberList").append(m).append("<br>");
}

DOMManager.prototype.setTitle = function(title){
    $("h2").show().html('You are now in room: ' + title);
}  

DOMManager.prototype.messageBoxEventHandler = function(){
  var self = this;
  $("#msgbox").keypress( function(event) {
         if (event.which == '13') {
            self.sendMsg();
            event.preventDefault();
        }
    });   
}

DOMManager.prototype.startChat = function(callback){
  var self = this;
   $("#txtUserName").unbind('focus').on('focus',function(){
         $("#error").hide();
         $("#userExistsError").hide();
         $("#txtUserName").removeClass("invalid").addClass("valid");
    }).keypress( function(event) {
         if (event.which == '13') {
            event.preventDefault();
            if(!$("#userExistsError").is(':visible'))
            {
                EnterChat(callback,self);
            }
         }
    });

   $("#btnSendUser").unbind('click').on('click',function(){
       EnterChat(callback,self);
   });
}

function EnterChat(callback,self){
      var $txtUserName = $("#txtUserName");
      userName = $txtUserName.val();
      if(userName)
      {                 
          $txtUserName.removeClass("invalid").addClass("valid");
          $("#error").hide();
          $("#chat").show();
          $("#msgbox").show();
          self.HideUserName();
          callback(userName);
      }
      else
      {
         $("#error").show();
         $txtUserName.removeClass("valid").addClass("invalid");
      }
}

DOMManager.prototype.OnDisconnect = function(data){
  $("#btnDisconnect").show().unbind( "click" ).on('click',function(){
      EventHandler.trigger('leave',data);
  });
}

DOMManager.prototype.HideUserName = function(){
    $("#userDiv").hide();
}

DOMManager.prototype.ShowUserName = function(){
    $("#userDiv").show();
}

DOMManager.prototype.ShowStartButton = function(){
   $("#btnSendUser").show();
}

DOMManager.prototype.refreshUserList = function(data){
    var self = this;
    $("#memberList").html('<div id="MemberHeader">Members</div>');
    $.each(data,function(key,val){
       self.addMember(val);
    });
}

DOMManager.prototype.displayUserError = function(err){
  $("#chat").hide();
  this.ShowUserName();
  $("#userExistsError").show().html(err);
  $("#txtUserName").removeClass("valid").addClass("invalid");
}

DOMManager.prototype.resetState = function(){
    $("#btnDisconnect").hide();
    $("#userDiv").show();
    $("#msgbox").hide();
    $("h2").hide();
}


