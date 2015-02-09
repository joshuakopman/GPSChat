ChatView = Backbone.View.extend({
        el: "#chat",
        initialize: function(){
          this.render();
        },
        render: function(){
            var self = this;
            $.get('/templates/ChatTemplate.html', function (data) {
              template = _.template(data, {  });
              self.$el.html(template);  
            }, 'html');
        },
        events:{
        'click #timestampChkBox':'toggleTimestamps'
    	},
    	toggleTimestamps : function(){
    		if($(".timestamp").is(":visible")){
    			$(".timestamp").hide();
    		}
    		else{
    			$(".timestamp").show();
    		}
    	}
      });

    var ChatView = new ChatView();