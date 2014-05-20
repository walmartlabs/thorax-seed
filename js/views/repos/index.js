var RepoView = Application.View.extend({
  name: "repos/index",

  events: {
    'click button': function(event) {
      var model = $(event.currentTarget).model();

      alert(model.attributes.size);
    }
  }
});
