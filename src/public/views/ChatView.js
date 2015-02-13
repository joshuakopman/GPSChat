ChatView = Backbone.View.extend({
        el: "#chat",
        initialize: function(){
          this.Lat ='';
       	  this.Lon='';
          this.messageCount = 0;
          this.showTimestamps = false;
          this.disconnectTime = Date.now();
          this.render();
		},
        render: function(){
            var self = this;
            $.get('/templates/ChatTemplate.html', function (data) {
              template = _.template(data, {  });
              self.$el.html(template);  
            }, 'html');

            $(window).on("focus",function(){
		      document.title = "Yosaaaa.ly";
		      self.messageCount = 0;
		   });
        },
        events:{
        	'click #timestampChkBox':'toggleTimestamps',
        	'DOMSubtreeModified #chatlog':'autoScroll',
        	'keypress #msgbox':'handleMessageBox',
        	'click #btnDisconnect':'handleDisconnect'
    	},
		addMessage: function(m,messageClassName,userClassName,timestamp) {
		  var $chatLog =  $("#chatlog");
		  var toggleTimestampClass = (this.showTimestamps) ? "showTimestamp" : "hideTimestamp";
		  var messTimestamp = (timestamp)? "<div class=\"timestamp "+toggleTimestampClass+"\">" + new Date(timestamp).toString("hh:mm tt") + " </div>":
										   "<div class=\"timestamp "+toggleTimestampClass+"\">" + new Date().toString("hh:mm tt") + " </div>";

		  if(m.indexOf(':') > -1)
		  {
			    var user = m.split(':',2)[0];  
			    m = m.replace(/^[^:]*:/,'');
			    $chatLog.append('<div class="' + userClassName + '">' + messTimestamp + user + '<div class="' + messageClassName + '">' + m + '</div></div>');
			    if(userClassName == "userNameMessage" && $("#chkBoxSounds").is(":checked"))
			    {
			      $("#newMessageSound").get(0).play();
			    }
		  }
		  else
		  {
		    	$chatLog.append('<div class="' + messageClassName + '">' + messTimestamp + ' ' + m + '</div>');
		  }
		},
		addImageMessage : function(m,messageClassName,userClassName,timestamp) {
		  	var $chatLog =  $("#chatlog");
		  	var toggleTimestampClass = (this.showTimestamps) ? "showTimestamp" : "hideTimestamp";
		  	var messTimestamp = (timestamp)? "<div class=\"timestamp "+toggleTimestampClass+"\">" + new Date(timestamp).toString("hh:mm tt") + " </div>":
											 "<div class=\"timestamp "+toggleTimestampClass+"\">" + new Date().toString("hh:mm tt") + " </div>";

		 	$chatLog.append('<div class="' + userClassName + '">' + messTimestamp + m.User + '<br/><div class="' + messageClassName + '"><a href="' + m.URL + '" target="_blank"><img src="' + m.URL +'" height="100" width="100"/></a></div></div>');
		 	if(userClassName == "userNameMessage" && $("#chkBoxSounds").is(":checked"))
		    {
		      $("#newMessageSound").get(0).play();
		    }
		},
		addMember : function(m) {
		    $("#memberList").append('<div title="Boot User" class="memberName">' + m + '</div>');
		},
		autoScroll: function(){
		    var $chatLog = $("#chatlog");
		    $chatLog.animate({scrollTop: $chatLog.get(0).scrollHeight}, 1);
		},
		bindBootEvent : function(socketElement){
		  socketElement.prev().unbind('click').on('click',function(){
		      EventHandler.trigger('bootUser',{ UserName : socketElement.id, SocketID : socketElement.html()});
		  });
		},
		displayChatRoom : function(title){
		    $("#chatLoader").hide();
		    $("h2").show().html('<div class="title">Current Room </div>' + title);
		    $("#chat").show();
		    $("#msgbox").show();
		    $("#btnDisconnect").show();
		},  
		displayUserError : function(err){
		  $("#chat").hide();
		  $("#userDiv").show();
		  $("#userExistsError").show().html(err);
		  $("#txtUserName").removeClass("valid").addClass("invalid");
		},
		handleDisconnect: function(){
	      EventHandler.trigger('leave',{Lat : this.Lat, Lon : this.Lon});
	      this.disconnectTime = Date.now();
	      this.hideRoom();
		},
		handleMessageBox : function(event){
	         if (event.which == '13') {
	            this.sendMsg();
	            event.preventDefault();
	        } 
		},
		hideRoom: function(){
			$("#chat").hide();
		},
		refreshUserList : function(data){
		    var self = this;
		    $("#memberList").html('');
		    $.each(data,function(key,val){
		       self.addMember(val.Name);
		       $("#memberList").append("<div id='socket_"+val.Name+"' class='socketID'>"+val.SocketID+"</div>");
		       self.bindBootEvent($("#socket_"+val.Name));
		    });
		},
		resetState : function(){
		    $("#btnDisconnect").hide();
		    $("#userDiv").show();
		    $("#msgbox").hide();
		    $("h2").hide();
		},
		sendMsg : function(){
			var $msgBox = $("#msgbox");
		    var r = $msgBox.val();
		    EventHandler.trigger('sendMessage',NameEntryView.userName + ": " + r ,this.Lat,this.Lon);
		    $msgBox.val('');
		},
		toggleTimestamps : function(){
    		var $timestamp = $(".timestamp");
    		if($timestamp.is(":visible")){
    			$timestamp.removeClass('showTimestamp');
    			$timestamp.addClass('hideTimestamp');
    			this.showTimestamps = false;
    		}
    		else{
    			$timestamp.removeClass('hideTimestamp');
    			$timestamp.addClass('showTimestamp');
    			this.showTimestamps = true;
    		}
    	},
    	updateTitle: function(){
		  if(!document.hasFocus())
		  {
		    this.messageCount++;
		    document.title = "Yosaaaa.ly ("+ this.messageCount + ")"; 
		  }
		}
      });

    var ChatView = new ChatView();