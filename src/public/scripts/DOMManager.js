function DOMManager(){
}

DOMManager.prototype.addMember = function(m) {
    $("#memberList").append('<div title="Boot User" class="memberName">'+m+'</div>');
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
