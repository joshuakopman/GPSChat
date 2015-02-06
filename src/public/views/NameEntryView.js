NameEntryView = Backbone.View.extend({
        el: "#userDiv",
        initialize: function(){
          this.render();
        },
        render: function(){
            var self = this;
            $.get('/templates/NameEntryTemplate.html', function (data) {
              template = _.template(data, {  });
              self.$el.html(template);  
            }, 'html');
        }
      });

var nameEntryView = new NameEntryView();