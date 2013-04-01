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
    grunt.registerTask('generate:' + action, function(path, moduleName) {
      if (!path) {
        throw new Error('Path argument required to generate:' + action);
      }
      var generator = new ThoraxGenerator();
      ThoraxGenerator.currentAction = action;
      generator[action].apply(generator, [path, moduleName]);
      generator.save();
    });
  });

};

var mode = 0777 ^ process.umask(),
    path = require('path'),
    fs = require('fs'),
    handlebars = require('handlebars'),
    red = '\u001b[31m',
    blue = '\u001b[33m',
    reset = '\u001b[0m';

function ThoraxGenerator(options) {
  options = options || {};
  this._lumbarJSONPath = options.lumbarJSONPath || path.join(process.cwd(), 'lumbar.json');
  //this._baseJSONPath = options.baseJSONPath || path.join(process.cwd(), 'config/base.json');
  this._generatorsPath = path.join(__dirname, 'generators');
  this._modifyLumbarJSON = options.modifyLumbarJSON || true;
  this.lumbarJSON = JSON.parse(fs.readFileSync(this._lumbarJSONPath));
  //this.baseJSON = JSON.parse(fs.readFileSync(this._baseJSONPath));
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
  ensureModule.call(this, name);
};

ThoraxGenerator.prototype.spec = function(name) {
  this.write((this.paths.specs + '/' + name + '.' + this.language), this.render('spec.handlebars', {
    name: name
  }));
};

ThoraxGenerator.prototype.style = function(name, moduleName) {
  var target = this.paths.stylesheets + '/' + name + '.css',
      moduleName = moduleName || name.split('/').shift();
  ensureModule.call(this, moduleName);
  this.write(target, '');
  addStyle.call(this, name, target);
};

ThoraxGenerator.prototype.router = function(name, moduleName) {
  var target = this.paths.routers + '/' + name + '.' + this.language,
      moduleName = moduleName || name.split('/').shift();
  ensureModule.call(this, moduleName, true);
  this.write(target, this.render('router.handlebars', {
    name: name
  }));
  addScript.call(this, name, target);
};

ThoraxGenerator.prototype.view = function(name, moduleName) {
  var target = this.paths.views + '/' + name + '.' + this.language,
      moduleName = moduleName || name.split('/').shift();
  ensureModule.call(this, moduleName);
  addScript.call(this, moduleName, target);
  this.write(target, this.render('view.handlebars', {
    name: name
  }));
  this.template(name);
};

ThoraxGenerator.prototype['collection-view'] = function(name, moduleName) {
  var target = this.paths.views + '/' + name + '.' + this.language,
      moduleName = moduleName || name.split('/').shift();
  ensureModule.call(this, moduleName);
  addScript.call(this, moduleName, target);
  this.write(target, this.render('collection-view.handlebars', {
    name: name
  }));
  this.template(name);
  this.template(name + '-item');
  this.template(name + '-empty');
};

ThoraxGenerator.prototype.collection = function(name, moduleName) {
  var target = this.paths.collections + '/' + name + '.' + this.language,
      moduleName = moduleName || name.split('/').shift();
  ensureModule.call(this, moduleName);
  addScript.call(this, moduleName, target);
  this.write(target, this.render('collection.handlebars', {
    name: name
  }));
};

ThoraxGenerator.prototype.model = function(name, moduleName) {
  var target = this.paths.models + '/' + name + '.' + this.language,
      moduleName = moduleName || name.split('/').shift();
  ensureModule.call(this, moduleName);
  addScript.call(this, moduleName, target);
  this.write(target, this.render('model.handlebars', {
    name: name
  }));
};

ThoraxGenerator.prototype.template = function(name) {
  var target = this.paths.templates + '/' + name + '.handlebars';
  this.write(target, '');
};

ThoraxGenerator.prototype.save = function() {
  if (this._modifyLumbarJSON) {
    console.log('    Updated ' + pathWithoutProjectDir(this._lumbarJSONPath));
    fs.writeFileSync(this._lumbarJSONPath, JSON.stringify(this.lumbarJSON, null, 2));
  }
};

ThoraxGenerator.prototype.write = function(file, contents) {
  var target = path.join(process.cwd(), file);
  if (fs.existsSync(target)) {
    console.log(red + '    Not overwriting ' + pathWithoutProjectDir(target) + reset);
    return false;
  }
  ensureDirs(target);
  console.log('    Creating ' + pathWithoutProjectDir(target));
  fs.writeFileSync(target, contents);
};

ThoraxGenerator.prototype.render = function(file, context) {
  context = context || {};
  context.applicationName = this.lumbarJSON.application.name;
  return handlebars.compile(fs.readFileSync(path.join(this._generatorsPath, file)).toString())(context);
};

function pathWithoutProjectDir(filePath) {
  return filePath.substr(process.cwd().length + 1);
}

function addScript(moduleName, script) {
  if (moduleName) {
    ensureModuleInJSON.call(this, moduleName);
    this.lumbarJSON.modules[moduleName].scripts.push(script);
  }
}

function addStyle(moduleName, style) {
  if (moduleName) {
    ensureModuleInJSON.call(this, moduleName);
    this.lumbarJSON.modules[moduleName].styles.push(style);
  }
}

function ensureModule(moduleName, preventRouterInit) {
  if (!ensureModuleInJSON.call(this, moduleName)) {
    console.log(blue + '    Creating module ' + moduleName + reset);
    this.style(moduleName, moduleName);
    if (!preventRouterInit) {
      this.router(moduleName, moduleName);
    }
  }
}

function ensureModuleInJSON(moduleName) {
  if (!this.lumbarJSON.modules) {
    this.lumbarJSON.modules = {};
  }
  if (!this.lumbarJSON.modules[moduleName]) {
    this.lumbarJSON.modules[moduleName] = defaultModuleJSON();
    return false;
  }
  return true;
}

function defaultModuleJSON() {
  return {
    routes: {},
    scripts: [],
    styles: []
  };
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
      console.log('    Created directory ' + pathWithoutProjectDir(createdDir));
    }, this);
  }
}

function camelize(string) {
  return string.replace(/(?:^|[-_])(\w)/g, function (_, c) {
    return c ? c.toUpperCase() : '';
  });
}