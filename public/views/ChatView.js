ChatView = Backbone.View.extend({
        el: "#chatTemplate",
        initialize: function(){
          this.messageCount = 0;
          this.disconnectTime = Date.now();
          this.render();
          this.memberListPartial = new MemberListPartial();
          this.chatWindowPartial = new ChatWindowPartial();
		},
        render: function(){
            var self = this;;
            $(window).on("focus",function(){
		      document.title = "GPS Chat";
		      self.messageCount = 0;
		   });
        },
		displayChatTemplate : function(title){
			$("#txtUserName").blur();
		    $("#userTemplate").hide();
		    $("h2").html('<div class="title">Current Room </div>' + title);
		    $("#chatTemplate").show();
		    $("#msgbox").focus();
		},  
		displayNameEntryTemplate : function(){
			$("#chatTemplate").hide();
		    $("#userTemplate").show();
		    $("#btnSendUser,#txtUserName").prop('disabled',false);
		},
		displayUserError : function(err){
		  this.displayNameEntryTemplate();
		  $("#userExistsError").show().html(err);
		  $("#txtUserName").removeClass("valid").addClass("invalid");
		},
    	updateTitle: function(){
		  if(!document.hasFocus())
		  {
		    this.messageCount++;
		    document.title = "GPS Chat ("+ this.messageCount + ")"; 
		  }
		}
      });

    var ChatView = new ChatView();