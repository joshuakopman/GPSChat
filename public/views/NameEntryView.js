NameEntryView = Backbone.View.extend({
        el: "#userTemplate",
        initialize: function(){
          this.userName = '';
          this.socketHandler = new SocketHandler();
          this.render();
        },
        render: function(){
            var self = this;
            $.get('/templates/NameEntryTemplate.html', function (data) {
              template = _.template(data, {  });
              self.$el.html(template);  
              self.socketHandler.determineLocationAndEstablishSocketConnection(function(){
                self.readyToEnterChat();
              });
            }, 'html');
        },
        events:{
          'focus #txtUserName':'hideErrors',
          'keypress #txtUserName':'startChat',
          'click #btnSendUser':'startChat',
          'click #btnRetryGeo':'retryLocation'
        },
        readyToEnterChat:function(){
            this.socketHandler.clearGeoError();
            $("#entryLoader").hide();
            $("#txtUserName,#btnSendUser").prop('disabled',false);
            $("#txtUserName").show();
            $("#btnSendUser").show();
        },
        retryLocation:function(){
            var self = this;
            this.socketHandler.determineLocationAndEstablishSocketConnection(function(){
              self.readyToEnterChat();
            });
        },
        hideErrors:function(){
           $("#error").hide();
           $("#userExistsError").hide();
           $("#txtUserName").removeClass("invalid").addClass("valid");
        },
        startChat:function(event){
          this.hideErrors();
          if (typeof event !='undefined' && (event.which == '13' || event.type == 'click')) {
            event.preventDefault();
            var $txtUserName = $("#txtUserName");
            var enteredUserName = $txtUserName.val();
            if(enteredUserName && /\S/.test(enteredUserName))
            {       
                $("#btnSendUser,#txtUserName").prop('disabled',true);
                this.userName = enteredUserName; 
                $txtUserName.removeClass("invalid").addClass("valid");
                this.socketHandler.connectToChatRoom(ChatView.disconnectTime);
            }
            else
            {
               $("#error").show();
               $txtUserName.removeClass("valid").addClass("invalid");
            }
          }
        }
  });

var NameEntryView = new NameEntryView();
