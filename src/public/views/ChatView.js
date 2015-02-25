ChatView = Backbone.View.extend({
        el: "#chatTemplate",
        initialize: function(){
          this.Lat ='';
       	  this.Lon='';
          this.messageCount = 0;
          this.showTimestamps = false;
          this.disconnectTime = Date.now();
          this.messTimestampPartial = '';
          this.messagePartial = '';
          this.searchTimeout='';
          this.render();
		},
        render: function(){
            var self = this;
            this.renderTemplates();
            $(window).on("focus",function(){
		      document.title = "Yosaaaa.ly";
		      self.messageCount = 0;
		   });
        },
        events:{
        	'click #timestampChkBox':'toggleTimestamps',
        	'DOMSubtreeModified #chatlog':'autoScroll',
        	'keypress #msgbox':'handleMessageBox',
        	'keyup #msgbox':'checkForFlags',
        	'click #btnDisconnect':'handleDisconnect',
        	'click .memberName': 'handleBoot'
    	},
    	renderTemplates: function(){
            var self = this;

            $.get('/templates/ChatTemplate.html', function (data) {
              template = _.template(data, {  });
              self.$el.html(template);  
            }, 'html');

         	$.get('/templates/partials/Timestamp.html', function (data) {
         		self.messTimestampPartial = data;
         	},'html');

         	$.get('/templates/partials/Message.html', function (data) {
         		self.messagePartial = data;
         	},'html'); 
    	},
    	addMember : function(m) {
		    $("#memberList").append('<div title="Boot User" class="memberName">' + m + '<div class="hidetyping"> (typing)</div></div>');
		},
		addMessage: function(m,messageClassName,userClassName,timestamp) {
		  var $chatLog =  $("#chatlog");
		  var toggleTimestampClass = (this.showTimestamps) ? "showTimestamp" : "hideTimestamp";
		  var formattedMessTimestamp = (timestamp) ? new Date(timestamp).toString("hh:mm tt") : new Date().toString("hh:mm tt");
		  var messTimestampHTML = _.template(this.messTimestampPartial)({timeStamp : formattedMessTimestamp,toggleTimestampClass : toggleTimestampClass});
		  if(m.indexOf(':') > -1)
		  {
			    var user = m.split(':',2)[0];  
			    m = m.replace(/^[^:]*:/,'');
		  		var messageHTML = _.template(this.messagePartial)({timeStamp : messTimestampHTML,userClass : userClassName,userName:user,messageText:m,messageClass:messageClassName});
			    $chatLog.append(messageHTML);
			    if(userClassName == "userNameMessage" && $("#chkBoxSounds").is(":checked"))
			    {
			      $("#newMessageSound").get(0).play();
			    }
		  }
		  else
		  {
		  		var messageHTML = _.template(this.messagePartial)({timeStamp : '',userClass : '',userName:'',messageText:messTimestampHTML + m,messageClass:messageClassName});
			    $chatLog.append(messageHTML);
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
		addLightMessage: function(m,messageClassName,userClassName,timestamp) {
		  	var $chatLog =  $("#chatlog");
		  	var toggleTimestampClass = (this.showTimestamps) ? "showTimestamp" : "hideTimestamp";
		  	var messTimestamp = (timestamp)? "<div class=\"timestamp "+toggleTimestampClass+"\">" + new Date(timestamp).toString("hh:mm tt") + " </div>":
											 "<div class=\"timestamp "+toggleTimestampClass+"\">" + new Date().toString("hh:mm tt") + " </div>";

		 	$chatLog.append('<div class="' + userClassName + '">' + messTimestamp + m.User + '<div class="' + messageClassName + '">'+m.StateMessage+'</div></div>');
		 	if(userClassName == "userNameMessage" && $("#chkBoxSounds").is(":checked"))
		    {
		      $("#newMessageSound").get(0).play();
		    }
		},
		autoScroll: function(){
		   var $chatlog = $("#chatlog");
		   $chatlog.animate(
		   {
		   		scrollTop: $chatlog.get(0).scrollHeight
		   }, 1);
		},
		checkForFlags: function(){
			var $msgBox = $("#msgbox");
			if($msgBox.val().indexOf("/img") == 0 || $msgBox.val().indexOf("/lights") == 0){
				$msgBox.addClass("specialCommand");
			}
			else{
				$msgBox.removeClass("specialCommand");
			}
		},
		displayChatRoom : function(title){
			$("#txtUserName").blur();
		    $("#userTemplate").hide();
		    $("h2").html('<div class="title">Current Room </div>' + title);
		    $("#chatTemplate").show();
		    $("#msgbox").focus();
		},  
		displayUserError : function(err){
		  this.showUserTemplate();
		  $("#userExistsError").show().html(err);
		  $("#txtUserName").removeClass("valid").addClass("invalid");
		},
		handleBoot : function(event){
		  var $socketElement = $(event.currentTarget).next();
		  EventHandler.trigger('bootUser',{ UserName : $socketElement.id, SocketID : $socketElement.html()});
		},
		handleDisconnect: function(){
	      EventHandler.trigger('leave',{Lat : this.Lat, Lon : this.Lon});
	      this.disconnectTime = Date.now();
	      this.showUserTemplate();
		},
		handleMessageBox : function(event){
	         if (event.which == '13') {
	            this.sendMsg();
	            event.preventDefault();
	        }else{
        		clearTimeout(this.searchTimeout);
        		EventHandler.trigger('notifyTyping');
        		this.searchTimeout = setTimeout(function(){EventHandler.trigger('stoppedTyping',NameEntryView.userName);}, 250);

	        } 
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
		sendMsg : function(){
			var $msgBox = $("#msgbox");
		    var messageText = $msgBox.val();
		    EventHandler.trigger('sendMessage',NameEntryView.userName + ": " + messageText ,this.Lat,this.Lon);
		    $msgBox.val('');
		},
		setWeather : function(data){
			$("#weather").html('Current weather: <div class="weatherData">' + data.Weather + " " + data.Temp+"</div>");
		},
		showUserTemplate : function(){
			$("#chatTemplate").hide();
		    $("#userTemplate").show();
		    $("#btnSendUser,#txtUserName").prop('disabled',false);
		},
		startedTyping: function(data){
			var $userNameTypingDiv = $('#memberList').find('div').filter(':contains("'+data+'")').children().first();
			$userNameTypingDiv.removeClass('hidetyping');
			$userNameTypingDiv.addClass('typing');
		},
		stoppedTyping : function(userName){
			var $userNameTypingDiv = $('#memberList').find('div').filter(':contains("'+userName+'")').children().first();
			$userNameTypingDiv.addClass('hidetyping');
			$userNameTypingDiv.removeClass('typing');
		},
		toggleTimestamps : function(){
    		var $timestamp = $(".timestamp");
    		if($timestamp.is(":visible")){
    			$timestamp.removeClass('showTimestamp');
    			$timestamp.addClass('hideTimestamp');
    			$("#timestampChkBox").val('Show Timestamps');
    			this.showTimestamps = false;
    		}
    		else{
    			$timestamp.removeClass('hideTimestamp');
    			$timestamp.addClass('showTimestamp');
    			$("#timestampChkBox").val('Hide Timestamps');
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