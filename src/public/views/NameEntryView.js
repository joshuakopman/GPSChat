NameEntryView = Backbone.View.extend({
        el: "#userDiv",
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
        validateInput: function(event){
          if (typeof event !='undefined' && (event.which == '13' || event.type == 'click')) {
              event.preventDefault();
              if(!$("#userExistsError").is(':visible'))
              {
                 return true;
              }
           }
        },
        startChat:function(event){
          this.hideErrors();
          if(this.validateInput(event))
          {
              var $txtUserName = $("#txtUserName");
              var userName = $txtUserName.val();
              if(userName)
              {                 
                  $txtUserName.removeClass("invalid").addClass("valid");
                  $("#error").hide();
                  $("#userDiv").hide();
                  $("#chatLoader").show();
                  this.userName = userName;
                  EventHandler.trigger('connect');
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

