module.exports = function(grunt) {
  [
    'module',
    'spec',
    'style',
    'router',
    'view',
    'collection-view',
    'model',
    'collection'
  ].forEach(function(action) {
    grunt.registerTask('generate:' + action, function(path) {
      if (!path) {
        throw new Error('Path argument required to thorax:' + action);
      }
      var generator = new ThoraxGenerator();
      ThoraxGenerator.currentAction = action;
      generator[action].apply(generator, [path]);
      generator.save();
    });
  });

};

var mode = 0777 ^ process.umask(),
    path = require('path'),
    fs = require('fs'),
    handlebars = require('handlebars');

function ThoraxGenerator(options) {
  options = options || {};
  this._lumbarJSONPath = options.lumbarJSONPath || path.join(process.cwd(), 'lumbar.json');
  this._baseJSONPath = options.baseJSONPath || path.join(process.cwd(), 'config/base-lumbar.json');
  this._generatorsPath = path.join(__dirname, 'generators');
  this._modifyLumbarJSON = options.modifyLumbarJSON || true;
  this.lumbarJSON = JSON.parse(fs.readFileSync(this._lumbarJSONPath));
  console.log(this._baseJSONPath);
  this.baseJSON = JSON.parse(fs.readFileSync(this._baseJSONPath));
  this.paths = {
    views: "js/views",
    collections: "js/collections",
    models: "js/models",
    routers: "js/routers",
    stylesheets: "stylesheets",
    templates: "templates",
    specs: "specs"
  };
  this.language = 'js';
}

ThoraxGenerator.prototype.module = function(name) {
  this.lumbarJSON.modules[name] = {
    routes: {},
    scripts: [],
    styles: []
  };
  this.spec(name);
  this.style(name, name);
  this.router(name, name);
};

ThoraxGenerator.prototype.spec = function(name) {
  this.write(path.join(this.paths.specs, name + '.' + this.language), this.render('spec.handlebars', {
    name: name
  }));
};

ThoraxGenerator.prototype.style = function(name, moduleName) {
  var target = path.join(this.paths.stylesheets, name + '.css');
  this.write(target, '');
  addStyle.call(this, moduleName, target);
};

ThoraxGenerator.prototype.router = function(name, moduleName) {
  var target = path.join(this.paths.routers, name + '.' + this.language);
  this.write(target, this.render('router.handlebars', {
    name: name
  }));
  addScript.call(this, moduleName, target);
};

ThoraxGenerator.prototype.view = function(name) {
  var target = path.join(this.paths.views, name + '.' + this.language),
      moduleName = name.split('/').shift();
  addScript.call(this, moduleName, target);
};

ThoraxGenerator.prototype['collection-view'] = function(name) {
  var target = path.join(this.paths.views, name + '.' + this.language),
      moduleName = name.split('/').shift();
  addScript.call(this, moduleName, target);
};

ThoraxGenerator.prototype.collection = function(name) {
  var target = path.join(this.paths.collections, name + '.' + this.language),
      moduleName = name.split('/').shift();
  addScript.call(this, moduleName, target);
};

ThoraxGenerator.prototype.model = function(name) {
  var target = path.join(this.paths.models, name + '.' + this.language),
      moduleName = name.split('/').shift();
  addScript.call(this, moduleName, target);
};

ThoraxGenerator.prototype.template = function(name) {
  var target = path.join(this.paths.templates, name + '.handlebars');
};

ThoraxGenerator.prototype.save = function() {
  if (this._modifyLumbarJSON) {
    console.log('Saved ' + this._lumbarJSONPath);
    fs.writeFileSync(this._lumbarJSONPath, JSON.stringify(this.lumbarJSON, null, 2));
  }
};

ThoraxGenerator.prototype.write = function(file, contents) {
  var target = path.join(process.cwd(), file);
  if (fs.existsSync(target)) {
    console.warn(target + ' already exists');
    return false;
  }
  ensureDirs(target);
  console.log('writing ' + target);
  fs.writeFileSync(target, contents);
};

ThoraxGenerator.prototype.render = function(file, context) {
  context = context || {};
  context.applicationName = this.baseJSON.application.name;
  return handlebars.compile(fs.readFileSync(path.join(this._generatorsPath, file)).toString())(context);
};

function addScript(moduleName, script) {
  if (moduleName) {
    try {
      this.lumbarJSON.modules[moduleName].scripts.push(script);
    } catch(e) {

    }
  }
}

function addStyle(moduleName, style) {
  if (moduleName) {
    try {
      this.lumbarJSON.modules[moduleName].styles.push(style);
    } catch(e) {

    }
  }
}

function mkdirsSync(dirname) {
  var pathsNotFound = [];
  var fn = dirname;
  while (true) {
    try {
      var stats = fs.statSync(fn);
      if (stats.isDirectory()) {
        break;
      }
      throw new Error('Unable to create directory at ' + fn);
    }
    catch (e) {
      pathsNotFound.push(fn);
      fn = path.dirname(fn);
    }
  }
  for (var i = pathsNotFound.length - 1; i >- 1; i--) {
    var fn = pathsNotFound[i];
    fs.mkdirSync(fn, mode);
  }
  return pathsNotFound;
}

function ensureDirs(file) {
  var targetPath = path.dirname(file);
  if (!fs.existsSync(targetPath)) {
    mkdirsSync.call(this, targetPath).forEach(function(createdDir) {
      console.log('created directory: ' + createdDir);
    }, this);
  }
}

function camelize(string) {
  return string.replace(/(?:^|[-_])(\w)/g, function (_, c) {
    return c ? c.toUpperCase() : '';
  });
}

/*

ThoraxGenerator.help = [
  "Usage:",
  "",
  "Create a new project & directory:",
  "",
  "  thorax create project-name",
  "",
  "In project directory:",
  "",
  "  thorax:create:view:name",
  "  thorax:create:collection-view:name",
  "  thorax:create:model:name",
  "  thorax:create:collection:name",
  "  thorax:create:router:name",
  "  thorax:create:module:name",
  "  thorax:create:style:name",
  "  thorax:create:template:script-path:template-path",
  "  thorax:create:spec:name"
].join("\n");

//instance methods
ThoraxGenerator.prototype = {
  save: function(next) {
    fs.writeFileSync(this._packageJSONPath, JSON.stringify(this.packageJSON, null, 2));
    fs.writeFileSync(this._lumbarJSONPath, JSON.stringify(this.lumbarJSON, null, 2));
    if (next) {
      next();
    }
  },

  help: function(messages) {
    if (!this.helpMessages) {
      this.helpMessages = [];
    }
    this.helpMessages.push('');
    this.helpMessages = this.helpMessages.concat(messages);
  },
  
  log: function(message) {
    console.log(message);
  },
  
  error: function(message) {
    console.log('error: ' + message);
  },

  warn: function(message) {
    console.log('warning: ' + message);
  },
  
  mkdir: function(name) {
    fs.mkdirSync((!name ? this.target : path.join(this.target, name)), mode);
  },
  
  copy: function(src, dest) {
    fs.writeFileSync(path.join(this.target, dest), fs.readFileSync(src));
  },

  symlink: function(src, dest) {
    fs.symlinkSync(src, path.join(this.target, dest));
  },

  checkPath: function(dir) {
    var target_path = path.join(this.target, path.dirname(dir));
    if (!fs.existsSync(target_path)) {
      mkdirsSync.call(this, target_path).forEach(function(created_dir) {
        this.log('created directory: ' + created_dir.substring(this.target.length + 1, created_dir.length));
      }, this);
    }
  },
    
  writeFile: function(dest, contents) {
    if (fs.existsSync(dest)) {
      this.warn(dest + ' already exists');
      return false;
    }
    fs.writeFileSync(path.join(this.target, dest), contents);
    return true;
  },

  render: function(src, context) {
    var template_src = fs.readFileSync(src).toString(),
      template = handlebars.compile(template_src);
    context = context || {};
    context.applicationName = this.applicationName;
    context.target = this.target;
    context.loadPrefix = this.loadPrefix;
    context.packageJSON = this.packageJSON;
    context.lumbarJSON = this.lumbarJSON;
    return template(context);
  },

  view: function(module_name, file_name) {
    file_name = fileNameFromArguments.call(this, arguments);
    module_name = moduleNameFromArguments.call(this, arguments);
    if (module_name) {
      file_name = cleanFileName.call(this, file_name, /^\/?js\/views\/?/);
      var full_path = path.join(this.thoraxJSON.paths.views, file_name),
        engine = 'handlebars',
        template_path = path.join(this.thoraxJSON.paths.generators, 'view.handlebars'),
        view_template_path = path.join(this.thoraxJSON.paths.templates, file_name).replace(/\.(js|coffee)$/, '.' + engine)
      
      this.checkPath(full_path);
      this.checkPath(view_template_path);

      if(this.writeFile(full_path, this.render(template_path, {
        fileName: full_path,
        moduleName: module_name,
        name: file_name.replace(/\.(js|coffee)$/, ''),
        className: camelize(file_name.replace(/\.(js|coffee)$/, '').replace(/\//g, '-'))
      }))) {
        this.log('created view: ' + full_path);
      }

      if (this.writeFile(view_template_path, '')) {
        this.log('created template: ' + view_template_path);
      }

      if (this.thoraxJSON.modifyLumbarJSON) {
        this.lumbarJSON.modules[module_name].scripts.push(full_path);
        this.lumbarJSON.templates[full_path] = [view_template_path];
      } else {
        this.help([
          'in modules.' + module_name + '.scripts:',
          '',
          '        "' + full_path + '"',
          '',
          'in templates:',
          '',
          '    "' + full_path + '": [',
          '      "' + view_template_path + '"',
          '    ]'
        ]);
      }
    }
  },

  'collection-view': function(module_name, file_name) {
    module_name = moduleNameFromArguments.call(this, arguments);
    file_name = fileNameFromArguments.call(this, arguments);
    if (module_name) {
      file_name = cleanFileName.call(this, file_name, /^\/?js\/views\/?/);

      var full_path = path.join(this.thoraxJSON.paths.views, file_name),
        engine = 'handlebars',
        template_path = path.join(this.thoraxJSON.paths.generators, 'collection-view.handlebars'),
        view_template_path = path.join(this.thoraxJSON.paths.templates, file_name).replace(/\.(js|coffee)$/, '.' + engine);
      
      this.checkPath(full_path);

      //view file
      if(this.writeFile(full_path, this.render(template_path, {
        fileName: full_path,
        moduleName: module_name,
        name: file_name.replace(/\.(js|coffee)$/, ''),
        className: camelize(file_name.replace(/\.(js|coffee)$/, '').replace(/\//g, '-'))
      }))) {
        this.log('created view: ' + file_name);
      }

      if (this.thoraxJSON.modifyLumbarJSON) {
        this.lumbarJSON.modules[module_name].scripts.push(full_path);
  
        //templates
        this.lumbarJSON.templates[full_path] = [
          view_template_path,
          view_template_path.replace(new RegExp('.' + engine + '$'), '-item.' + engine),
          view_template_path.replace(new RegExp('.' + engine + '$'), '-empty.' + engine)
        ];
        this.lumbarJSON.templates[full_path].forEach(function(_view_template_path) {
          this.checkPath(_view_template_path);
          if (this.writeFile(_view_template_path, '')) {
            this.log('created template: ' + _view_template_path);
          }
        }, this);
      } else {
        this.help([
          'in modules.' + module_name + '.scripts:',
          '',
          '        "' + full_path + '"',
          '',
          'in templates:',
          '    "' + full_path + '": [',
          '      "' + view_template_path + '"',
          '      "' + view_template_path.replace(new RegExp('.' + engine + '$'), '-item.' + engine) + '"',
          '      "' + view_template_path.replace(new RegExp('.' + engine + '$'), '-empty.' + engine) + '"',          
          '    ]'
        ]);
      }
    }
  },

  model: function(module_name, file_name) {
    file_name = fileNameFromArguments.call(this, arguments);
    module_name = moduleNameFromArguments.call(this, arguments);
    if (module_name) {
      file_name = cleanFileName.call(this, file_name, /^\/?js\/models\/?/);

      var full_path = path.join(this.thoraxJSON.paths.models, file_name),
        template_path = path.join(this.thoraxJSON.paths.generators, 'model.handlebars');
      
      this.checkPath(full_path);

      if(this.writeFile(full_path, this.render(template_path, {
        fileName: full_path,
        moduleName: module_name,
        name: file_name.replace(/\.(js|coffee)$/, ''),
        className: camelize(file_name.replace(/\.(js|coffee)$/, '').replace(/\//g, '-'))
      }))) {
        this.log('created model: ' + full_path);
      }

      if (this.thoraxJSON.modifyLumbarJSON) {
        this.lumbarJSON.modules[module_name].scripts.push(full_path);
      } else {
        this.help([
          'in modules.' + module_name + '.scripts:',
          '',
          '        "' + full_path + '"'
        ]);
      }
    }
  },

  collection: function(module_name, file_name) {
    file_name = fileNameFromArguments.call(this, arguments);
    module_name = moduleNameFromArguments.call(this, arguments);
    if (module_name) {
      file_name = cleanFileName.call(this, file_name, /^\/?js\/models\/?/);

      var full_path = path.join(this.thoraxJSON.paths.collections, file_name),
        template_path = path.join(this.thoraxJSON.paths.generators, 'collection.handlebars');

      this.checkPath(full_path);

      if (this.writeFile(full_path, this.render(template_path, {
        fileName: full_path,
        moduleName: module_name,
        name: file_name.replace(/\.(js|coffee)$/, ''),
        className: camelize(file_name.replace(/\.(js|coffee)$/, '').replace(/\//g, '-'))
      }))) {
        this.log('created collection: ' + full_path);
      }

      if (this.thoraxJSON.modifyLumbarJSON) {
        this.lumbarJSON.modules[module_name].scripts.push(full_path);
      } else {
        this.help([
          'in modules.' + module_name + '.scripts:',
          '',
          '        "' + full_path + '"'
        ]);
      }
    }
  },

  router: function(file_name) {
    file_name = cleanFileName.call(this, file_name, /^\/?js\/routers\/?/);
    file_name = path.join(this.thoraxJSON.paths.routers, file_name);
    
    this.checkPath(file_name);

    var template_path = path.join(this.thoraxJSON.paths.generators, 'router.handlebars'),
      name = nameFromFileName(file_name),
      template_output = this.render(template_path,{
        name: name,
        fileName: file_name,
        name: name,
        className: camelize(name)
      });

    if(this.writeFile(file_name, template_output)) {
      this.log('created router: ' + file_name);
    }

    if (!this.lumbarJSON.modules[name]) {
      this.module(name);
    }  
  },

  style: function(module_name) {
    var file_name = cleanFileName.call(this, module_name, /^\/?js\/styles\/?/).replace(/\.js$/, '');
    var full_path = path.join(this.thoraxJSON.paths.styles, file_name);
    this.checkPath(full_path);
    if (this.writeFile(full_path, '')) {
      this.log('created stylesheet: ' + file_name);
    }
    if (this.thoraxJSON.modifyLumbarJSON) {
      this.lumbarJSON.modules[module_name].styles.push(full_path);
    } else {
      this.help([
        'in modules.' + module_name + '.styles:',
        '',
        '        "' + full_path + '"'
      ]);
    }
  },

  template: function(script_name) {
    var originalScriptName = script_name;
    script_name = cleanFileName.call(this, script_name, /^\/?js\/views\/?/);
    for (var i = 1; i < arguments.length; ++i) {
      var template_path = cleanFileName.call(this, arguments[i], /^\/?templates\/?/).replace(/\.js$/, '');
      var full_path = path.join(this.thoraxJSON.paths.templates, template_path);
      this.checkPath(full_path);
      if (this.writeFile(full_path, '')) {
        this.log('created template: ' + full_path);
      }
      if (this.thoraxJSON.modifyLumbarJSON) {
        if (!this.lumbarJSON.templates[originalScriptName]) {
          this.lumbarJSON.templates[originalScriptName] = [];
        }
        this.lumbarJSON.templates[originalScriptName].push(full_path);
      }
    }
  },

  'module': function(name) {
    if (this.thoraxJSON.modifyLumbarJSON) {
      this.lumbarJSON.modules[name] = {
        routes: {},
        scripts: [],
        styles: []
      };
      this.log('created module: ' + name);
      this.spec(name);
      this.style(name);
      this.router(name);
    }
  },

  spec: function(module_name) {
    var file_name = cleanFileName.call(this, module_name, /^\/?specs\/?/);
    file_name = path.join(this.thoraxJSON.paths.specs, file_name);
    
    this.checkPath(file_name);

    var template_path = path.join(this.thoraxJSON.paths.generators, 'spec.handlebars'),
      name = nameFromFileName(file_name),
      template_output = this.render(template_path,{
        name: name,
        fileName: file_name,
        name: name,
        className: camelize(name)
      });

    if(this.writeFile(file_name, template_output)) {
      this.log('created spec: ' + file_name);
    }
  }
};
*/