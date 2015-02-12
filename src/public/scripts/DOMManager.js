var Lat;
var Lon;
var disconnectTime;

function DOMManager(lat,lon){
    Lat = lat;
    Lon = lon;
}

DOMManager.prototype.addImageMessage = function(m,messageClassName,userClassName,timestamp) {
  var $chatLog =  $("#chatlog");
  var messTimestamp='';

    if(showTimestamps)
    {
        toggleTimestampClass = "showTimestamp";
    }
    else
    {
        toggleTimestampClass = "hideTimestamp";
    }
    messTimestamp = "<div class=\"timestamp "+toggleTimestampClass+"\">" + new Date().toString("hh:mm tt") + " </div>";
    if(timestamp)
    {
      messTimestamp = "<div class=\"timestamp "+toggleTimestampClass+"\">" + new Date(timestamp).toString("hh:mm tt") + " </div>";
    } 

  $chatLog.append('<div class="' + userClassName + '">' + messTimestamp + m.User + '<br/><div class="' + messageClassName + '"><a href="' + m.URL + '" target="_blank"><img src="' + m.URL +'" height="100" width="100"/></a></div></div>');
}

DOMManager.prototype.addMember = function(m) {
    $("#memberList").append('<div title="Boot User" class="memberName">'+m+'</div>');
}

DOMManager.prototype.displayChatRoom = function(title){
    $("#chatLoader").hide();
    $("h2").show().html('<div class="title">Current Room </div>' + title);
    $("#chat").show();
    $("#msgbox").show();
    $("#btnDisconnect").show();
}  

DOMManager.prototype.OnDisconnect = function(data){
  var self = this;
  $("#btnDisconnect").show().unbind( "click" ).on('click',function(){
      EventHandler.trigger('leave',data);
      disconnectTime = Date.now();
      self.Leave();
  });
}
DOMManager.prototype.Leave = function(){
     $("#chat").hide();
}

DOMManager.prototype.HideUserName = function(){
    $("#userDiv").hide();
}

DOMManager.prototype.ShowUserName = function(){
    $("#userDiv").show();
}


DOMManager.prototype.refreshUserList = function(data){
    var self = this;
    var $self = $(this);
    $("#memberList").html('<div id="MemberHeader"></div>');
    $.each(data,function(key,val){
       self.addMember(val.Name);
       $("#memberList").append("<div id='socket_"+val.Name+"' class='socketID'>"+val.SocketID+"</div>");
       self.registerBootEvent($("#socket_"+val.Name));
    });
}

DOMManager.prototype.registerBootEvent = function(socketElement){
  socketElement.prev().unbind('click').on('click',function(){
      EventHandler.trigger('bootUser',{ UserName : socketElement.id, SocketID : socketElement.html()});
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

DOMManager.prototype.GetLastDisconnect = function(){
  return disconnectTime;
}
