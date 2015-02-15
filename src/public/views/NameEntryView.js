NameEntryView = Backbone.View.extend({
        el: "#userTemplate",
        initialize: function(){
          this.userName = '';
          var socketHandler = new SocketHandler();
          this.render();
        },
        render: function(){
            var self = this;
            $.get('/templates/NameEntryTemplate.html', function (data) {
              template = _.template(data, {  });
              self.$el.html(template);  
            }, 'html');
        },
        events:{
          'focus #txtUserName':'hideErrors',
          'keypress #txtUserName':'startChat',
          'click #btnSendUser':'startChat'
        },
        showStartButton:function(){
          $("#entryLoader").hide();
          $("#txtUserName").show();
          $("#btnSendUser").show();
        },
        hideErrors:function(){
           $("#error").hide();
           $("#userExistsError").hide();
           $("#txtUserName").removeClass("invalid").addClass("valid");
        },
        showChatTemplate : function(){
          $("#userTemplate").hide();
          $("#chatTemplate").show();
        },
        startChat:function(event){
          this.hideErrors();
          if (typeof event !='undefined' && (event.which == '13' || event.type == 'click')) {
            event.preventDefault();
            var $txtUserName = $("#txtUserName");
            var enteredUserName = $txtUserName.val();
            if(enteredUserName && /\S/.test(enteredUserName))
            {       
                this.userName = enteredUserName; 
                $txtUserName.removeClass("invalid").addClass("valid");       
                EventHandler.trigger('connect');
                this.showChatTemplate();
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

