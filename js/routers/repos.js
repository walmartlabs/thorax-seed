new (Backbone.Router.extend({
  routes: module.routes,

  index: function() {
    var collection = new ReposCollection();
    collection.org = 'walmartlabs';

    var view = new RepoView({
      collection: collection
    });

    Application.setView(view);
    // Application.setView(view, {serverRender: true});
  }
}));
