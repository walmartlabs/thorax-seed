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
    handlebars = require('handlebars'),
    red = '\u001b[31m',
    reset = '\u001b[0m';

function ThoraxGenerator(options) {
  options = options || {};
  this._lumbarJSONPath = options.lumbarJSONPath || path.join(process.cwd(), 'lumbar.json');
  this._baseJSONPath = options.baseJSONPath || path.join(process.cwd(), 'config/base-lumbar.json');
  this._generatorsPath = path.join(__dirname, 'generators');
  this._modifyLumbarJSON = options.modifyLumbarJSON || true;
  this.lumbarJSON = JSON.parse(fs.readFileSync(this._lumbarJSONPath));
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
  this.write(target, this.render('view.handlebars', {
    name: name
  }));
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
  context.applicationName = this.baseJSON.application.name;
  return handlebars.compile(fs.readFileSync(path.join(this._generatorsPath, file)).toString())(context);
};

function pathWithoutProjectDir(filePath) {
  return filePath.substr(process.cwd().length + 1);
}

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
      console.log('    Created directory ' + pathWithoutProjectDir(createdDir));
    }, this);
  }
}

function camelize(string) {
  return string.replace(/(?:^|[-_])(\w)/g, function (_, c) {
    return c ? c.toUpperCase() : '';
  });
}