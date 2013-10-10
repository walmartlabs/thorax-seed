new (Backbone.Router.extend({
  routes: module.routes,
  index: function(){
    
    var collection = new Application.Collection([
      {
        title: 'First Todo',
        done: true
      },
      {
        title: 'Second Todo',
        done: true
      }
    ]);

    var subView = new Application.Views["todos/sub-index"]();

    var view = new Application.Views["todos/index"]({
      collection: collection,
      subView: subView
    });
    
    Application.setView(view);
  }
}));