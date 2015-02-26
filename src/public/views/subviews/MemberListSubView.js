MemberListSubView = Backbone.View.extend({
        el: "#chatTemplate",
        initialize: function(){
        },
        events:{
          'click .memberName': 'handleBoot'
        },
    	addMember : function(m) {
		    $("#memberList").append('<div title="Boot User" class="memberName">' + m + '<div class="hidetyping"> (typing)</div></div>');
		},
		handleBoot : function(event){
		  var $socketElement = $(event.currentTarget).next();
		  EventHandler.trigger('bootUser',{ UserName : $socketElement.id, SocketID : $socketElement.html()});
		},
		refreshUserList : function(data){
		    var self = this;
		    var $memberList = $("#memberList");
		    $memberList.html('');
		    $.each(data,function(key,val){
		       self.addMember(val.Name);
		       $memberList.append("<div id='socket_"+val.Name+"' class='socketID'>"+val.SocketID+"</div>");
		    });
		},
  });