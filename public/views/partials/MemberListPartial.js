MemberListPartial = Backbone.View.extend({
        el: "#chatTemplate",
        initialize: function(){
        	var self = this;
        	this.newMemberPartial = '';
        	this.socketIDPartial = '';
         	$.get('/templates/partials/NewMember.html', function (data) {
         		self.newMemberPartial = data;
         	},'html');
         	$.get('/templates/partials/MemberSocketID.html', function (data) {
         		self.socketIDPartial = data;
         	},'html');
        },
        events:{
          'click .memberName': 'handleBoot'
        },
    	addMember : function(m) {
    		var memberHTML = _.template(this.newMemberPartial)({memberName : m});
			$("#memberList").append(memberHTML);
		},
		handleBoot : function(event){
		  var $socketElement = $(event.currentTarget).next();
		  OutboundEventHandler.trigger('bootUser',{ UserName : $socketElement.attr("id"), SocketID : $socketElement.html()});
		},
		refreshUserList : function(data){
		    var self = this;
		    var $memberList = $("#memberList");
		    $memberList.html('');
		    $.each(data,function(key,val){
		       self.addMember(val.Name);
		       var socketIDHTML = _.template(self.socketIDPartial)({memberName : val.Name,socketID : val.SocketID});
		       $memberList.append(socketIDHTML);
		    });
		},
  });