Application.View.extend({
  name: "todos/sub-index",
  events: {
    'click' : function(event){
      $('body').append($('<p>', {text: new Date()}));
    }
  }
});
