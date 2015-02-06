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
        }
      });

    var ChatView = new ChatView();