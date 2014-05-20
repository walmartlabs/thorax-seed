// Create the Application object, Application.setView() will
// place a view inside the {{layout-element}} in
// templates/application.handlebars
var Application = window.Application = new Thorax.LayoutView({
  name: 'application'
});

// Alias the special hashes for naming consistency
Application.templates = Thorax.templates;
Application.Views = Thorax.Views;
Application.Models = Thorax.Models;
Application.Collections = Thorax.Collections;

// Allows load:end and load:start events to propagate
// to the application object
Thorax.setRootObject(Application);

// This configures our Application object with values
// from the lumbar config, then sets it as the exported
// value from the base module.
_.extend(Application, module.exports);
module.exports = Application;

Application.initBackboneLoader(Application, function(type, module) {
  // You have failed to load the module. Let the world know.
});

$(window).ready(function() {
  // Check to see if we have rendered content that we can try to restore
  var appEl = $('[data-view-name="application"]');
  if (appEl.length) {
    // Restore the application view explicitly
    Application.restore(appEl);
  } else {
    // We are starting with a blank page, render a new element
    $('body').append(Application.el);
    Application.render();
  }

  // Application and other templates included by the base
  // Application may want to use the link and url helpers
  // which use hasPushstate, etc. so setup history, then
  // render, then dispatch
  Backbone.history.start({
    pushState: true,
    root: '/'
  });
});

