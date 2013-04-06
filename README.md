Thorax Seed
===========

The [Thorax Seed](https://github.com/walmartlabs/thorax-seed) contains a blank [Thorax](http://thoraxjs.org/) + [Lumbar](http://walmartlabs.github.com/lumbar) project that you can download and clone to start building you app.

**To report issues or submit pull requests on Thorax itself visit the [core library repository](http://github.com/thorax).**

From Zero to Todos
------------------
The **[Thorax intro screencast](https://vimeo.com/60230630)** demonstrates how to build a simple todo list in a few minutes. It also shows the optional [Thorax Inspector Chrome Extension](https://chrome.google.com/webstore/detail/thorax-inspector/poioalbefcopgeaeaadelomciijaondk?hl=en-US). To start from scratch and build your own you'll need git and [Node](http://nodejs.org) installed on your system. You'll then need to download or clone this repository:

    git clone git://github.com/walmartlabs/thorax-seed.git

Once your clone is complete, change directories into your cloned seed and run:

    npm install

This may take a minute. Note that all of the dependencies are specific to making it easier to build, run and test your app. Once your app is written it can be deployed in any environment. Once `npm install` is finished you can start your app:

    npm start

Your project is ready to run and a browser window will be opened with the running app. You'll see that nothing at all is there since it's a blank project.

File Structure
--------------

- **config** : Extra config files, if you need to add or remove libraries (such as jQuery) from your application, edit `base.json`
- **Gruntfile.js** : Your friendly [Grunt](http://gruntjs.com) configuration file, `npm start` will run the default task specified in this file
- **js** : All of your application code lives in here
- **lumbar.json** : A config containing all of the routes and files that compose your application
- **package.json** : Standard npm config file, only needed while still developing your app
- **public** : Will be served as the root directory by the server
- **public/modules** : Your generated application code, this folder should generally not be checked into git
- **stylesheets** : Generally speaking your styles should be application wide (in `base.css`) or split up per module
- **tasks** : Any extra grunt tasks, including the scaffolding
- **templates** : Handlebars templates, if a template shares the name / path as a view it will be auto assigned as the `template` property of the view

Scaffolding
-----------
The seed comes with some simple code generation tools that will automatically create files, folders and update your `lumbar.json` file. To run the code generation tools you first need the `grunt-cli`:

    npm install -g grunt-cli

Once you've got that installed you can run any of the following commands:

- `grunt generate:module:moduleName`
- `grunt generate:view:moduleName/viewName`
- `grunt generate:collection-view:moduleName/viewName`
- `grunt generate:model:moduleName/modelName`
- `grunt generate:collection:moduleName/collectionName`
- `grunt generate:router:moduleName`
- `grunt generate:stylesheet:moduleName`

To generate your first view run:

    grunt generate:view:todos/index

In addition to modifying `lumbar.json` a number of files will be created:

- `js/views/todos/index.js`
- `templates/todos/index.handlebars`

It will also initialize a `todos` module since it doesn't exist yet. This will in turn create:

- `js/routers/todos.js`
- `stylesheets/todos.css`

Modules and lumbar.json
-----------------------
A Lumbar module is composed of routes (to be passed to `Backbone.Router`s), stylesheets and JavaScripts. When a route is visited the scripts and styles associated with the module will be loaded. After running the `generate:view` task your `lumbar.json` should look like this:

    {
      "mixins": [
        "node_modules/lumbar-loader",
        "node_modules/thorax",
        "config/base.json"
      ],
      "modules": {
        "todos": {
          "routes": {},
          "scripts": [
            "js/routers/todos.js",
            "js/views/todos/index.js"
          ],
          "styles": [
            "stylesheets/todos.css"
          ]
        }
      },
      "templates": {
        "js/init.js": [
          "templates/application.handlebars"
        ]
      }
    }

`mixins` loads up the base configurations for the project. To edit what libraries (jQuery / Bootstrap, etc) are included in the project open up `config/base.json`. The `templates` hash defines what templates map to a given view. An entry only needs to be added if the name of a view doesn't match the name of a template. For instance, the generator created `js/views/todos/index.js` and `templates/todos/index.js`, but it doesn't need to be defined here as the names match.

Since all routes are specified in `lumbar.json`, to create our first route it needs to be added there so we will create an empty (root) route pointing at an `index` method:

    "modules": {
      "todos": {
        "routes": {
          "": "index"
        },
        ...

In `js/routers/todos.js` we will then implement the method:

    new (Backbone.Router.extend({
      routes: module.routes,
      index: function() {

      }
    }));

Note that `module.routes` is automatically made available and will contain the hash of routes specified in `lumbar.json` for the todos module.

Application and Views
---------------------
The `Application` object contains a number of subclasses defined in the `js` folder:

- `js/view.js` contains `Application.View` descends from `Thorax.View`
- `js/collection.js` contains `Application.Collection` descends from `Thorax.Collection`
- `js/model.js` contains `Application.Model` descends from `Thorax.Model`

Any application specific methods can be defined in those files.

To place the first view on your page take a look at `js/views/todos/index.js`:

    Application.View.extend({
      name: "todos/index"
    });

When a view class is created with `extend` that has `name` property it will automatically be available on the `Application.Views` hash:

    Application.Views["todos/index"]

Any template with the same name will also automatically be set as the `template` property, in this case `templates/todos/index.handlebars` will be automatically set as the `template` property.

The `Application` object also serves as our root view and it's `el` is already attached to the page. It is an instance of `Thorax.LayoutView` which is meant to display a single view at a time and has a `setView` method. In `js/routers/todos.js` we can call:

    index: function() {
      var view = new Application.Views["todos/index"]({});
      Application.setView(view);
    }

Update `templates/todos/index.handlebars` with some content to see that it's displaying properly.

Rendering a Collection
----------------------
To implement a todos list we need to create a collection and set it on the view. Unlike a `Backbone.View` instance a `Throax.View` (and therefore `Application.View`) instance does not have an `options` object. All properties passed to the constructor are set on the instance and also become available inside of the handlebars template.

Our `index` method in `js/routers/todos.js` should look like:

    index: function() {
      var collection = new Application.Collection([{
        title: 'First Todo',
        done: true
      }]);
      var view = new Application.Views["todos/index"]({
        collection: collection
      });
      Application.setView(view);
    }

To display the collection we will edit `templates/todos/index.handlebars` and use the `collection` helper which will render the block for each model in the collection setting `model.attributes`  as the context inside the block. A `tag` option may be specified to define what type of HTML tag will be used when creating the collection element:

    {{#collection tag="ul"}}
      <li>{{title}}</li>
    {{/collection}}

Since we want to be able to mark our todos as done and add new ones, we will add a checkbox to each item in the collection and a form to make new items at the bottom. Our `templates/todos/index.handlebars` should now look like:

    {{#collection tag="ul"}}
      <li {{#done}}class="done"{{/done}}>
        <input type="checkbox" {{#done}}checked{{/done}}>
        {{title}}
      </li>
    {{/collection}}
    <form>
      <input name="title">
      <input type="submit" value="Add">
    </form>

Lastly add an associated style in `stylesheets/todos.css`:

    .done {
      text-decoration: line-through;
    }

View Behaviors
--------------
In order to add new items to the list we should listen to the `submit` event on `form` elements in our view. We can use the events hash in `js/views/todos/index.js`:

    "submit form": function(event) {
      event.preventDefault();
      var attrs = this.serialize();
      this.collection.add(attrs);
      this.$('input[name="title"]').val('');
    }

The `serialize` method will return a hash of all attributes in form elements on the page. Since we had an input with a name of `title` attrs will be set to: `{title: "your todo"}`. When using the `collection` helper or a `CollectionView` Thorax adds, removes and updates views in the collection as appropriate, so once we `add` a new model to the collection the view will automatically update.

    'change input[type="checkbox"]': function(event) {
      var model = $(event.target).model();
      model.set({done: event.target.checked});
    }

We also need to listen for a change in a checkbox so we can mark a model as done. Thorax extends the jQuery or Zepto `$` object with three methods: `$.view`, `$.model` and `$.collection`. They will retrieve closest bound object to an element. In this case a model was automatically bound to the `li` tag passed into the `collection` helper in the template. Now that we have a reference to the `model` we can update it and the view will automatically update.

Our finished `js/views/todos.js` file should look like:

    Application.View.extend({
      name: "todos/index",
      events: {
        "submit form": function(event) {
          event.preventDefault();
          var attrs = this.serialize();
          this.collection.add(attrs);
          this.$('input[name="title"]').val('');
        },
        'change input[type="checkbox"]': function(event) {
          var model = $(event.target).model();
          model.set({done: event.target.checked});
        }
      }
    });

And that's a finished non persistent todo list application! For a more complex todos example see the [Thorax + Lumbar TodoMVC example](https://github.com/addyosmani/todomvc/tree/gh-pages/labs/dependency-examples/thorax_lumbar)

More Seeds
----------

- [Todos](https://github.com/eastridge/thorax-seed-todos) : The project in the state at the end of the screencast (and described in this document)
- [Mocha](https://github.com/eastridge/thorax-seed-mocha) : Blank seed with a [Mocha](http://visionmedia.github.com/mocha/) test harness setup
