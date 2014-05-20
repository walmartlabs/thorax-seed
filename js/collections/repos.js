var ReposCollection = Application.Collection.extend({
  url: function() {
    // return 'https://api.github.com/orgs/' + this.org  + '/repos';
    return '/data';
  },
  comparator: function(model) {
    return -model.get('stargazers_count');
  }
});
