ChatView = Backbone.View.extend({
        el: "#chat",
        initialize: function(){
          this.messageCount = 0;
          this.showTimestamps = false;
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
        	'keypress #msgbox':'handleMessageBox'
    	},
		addMessage: function(m,messageClassName,userClassName,timestamp) {
		  var $chatLog =  $("#chatlog");
		  var messTimestamp = "";
		  var toggleTimestampClass = (this.showTimestamps) ? "showTimestamp" : "hideTimestamp";

		  if(timestamp)
		  {
		      messTimestamp = "<div class=\"timestamp "+toggleTimestampClass+"\">" + new Date(timestamp).toString("hh:mm tt") + " </div>";
		  }
		  else
		  {
		  	  messTimestamp = "<div class=\"timestamp "+toggleTimestampClass+"\">" + new Date().toString("hh:mm tt") + " </div>";
		  }

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
		autoScroll: function(){
		    var $chatLog = $("#chatlog");
		    $chatLog.animate({scrollTop: $chatLog.get(0).scrollHeight}, 1);
		},
		handleMessageBox : function(event){
	         if (event.which == '13') {
	            this.sendMsg();
	            event.preventDefault();
	        } 
		},
		sendMsg : function(){
			var $msgBox = $("#msgbox");
		    var r = $msgBox.val();
		    EventHandler.trigger('sendMessage',NameEntryView.userName + ": " + r ,Lat,Lon);
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