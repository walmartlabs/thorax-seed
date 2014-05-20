module.exports = function(grunt) {
  var port = 8000,
      buildDir = './build',
      lumbarFile = './lumbar.json',
      hostname = 'localhost';
  
  grunt.file.mkdir(buildDir);

  grunt.initConfig({
    lumbar: {
      // performs an initial build so when tests
      // and initial open are run, code is built
      init: {
        build: lumbarFile,
        output: buildDir
      },
      // a long running process that will watch
      // for updates, to include another long
      // running task such as "watch", set
      // background: true
      watch: {
        background: false,
        watch: lumbarFile,
        output: buildDir
      }
    },
    'hapi-routes': {
      map: {
        options: {
          package: 'web',
          dest: buildDir + '/module-map.json'
        }
      }
    },
    // allows files to be opened when the
    // Thorax Inspector Chrome extension
    // is installed
    thorax: {
      inspector: {
        background: true,
        editor: "subl",
        paths: {
          views: "./js/views",
          models: "./js/models",
          collections: "./js/collections",
          templates: "./templates"
        }
      }
    }
  });

  grunt.registerTask('hapi-server', function() {
    // Self running.
    require('./server');
  });
  grunt.registerTask('open-browser', function() {
    var open = require('open');
    open('http://' + hostname + ':' + port);
  });
  
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('thorax-inspector');
  grunt.loadNpmTasks('lumbar');
  grunt.loadNpmTasks('hula-hoop');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('default', [
    'ensure-installed',
    'thorax:inspector',
    'hapi-routes',
    'lumbar:init',
    'hapi-server',
    'open-browser',
    'lumbar:watch'
  ]);
};
