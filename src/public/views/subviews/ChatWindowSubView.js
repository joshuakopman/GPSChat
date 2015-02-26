ChatWindowSubView = Backbone.View.extend({
        el: "#chatTemplate",
        initialize: function(){
          this.Lat ='';
       	  this.Lon='';
          this.showTimestamps = false;
          this.messTimestampPartial = '';
          this.messagePartial = '';
          this.typingTimeout='';
          this.renderTemplates();
		},
        events:{
        	'click #timestampChkBox':'toggleTimestamps',
        	'DOMSubtreeModified #chatlog':'autoScroll',
        	'keypress #msgbox':'handleMessageBox',
        	'keyup #msgbox':'checkForFlags',
        	'click #btnDisconnect':'handleDisconnect'
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
		handleDisconnect: function(){
	      EventHandler.trigger('leave',{Lat : this.Lat, Lon : this.Lon});
	      ChatView.disconnectTime = Date.now();
	      ChatView.showUserTemplate();
		},
		handleMessageBox : function(event){
	         if (event.which == '13') {
	            this.sendMsg();
	            event.preventDefault();
	        }else{
        		clearTimeout(this.typingTimeout);
        		EventHandler.trigger('notifyTyping');
        		this.typingTimeout = setTimeout(function(){EventHandler.trigger('stoppedTyping',NameEntryView.userName);}, 250);

	        } 
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
    	}
      });