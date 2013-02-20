module.exports = function(grunt) {
  var port = 8000,
      publicDir = './public',
      lumbarFile = './lumbar.json',
      hostname = require('os').hostname();
  
  grunt.initConfig({
    // create a static webserver
    connect: {
      server: {
        options: {
          hostname: hostname,
          base: publicDir,
          port: port
        }
      },
      'test-server': {
        options: {
          hostname: hostname,
          base: publicDir,
          port: 8981,
        }
      }
    },
    lumbar: {
      // performs an initial build so when tests
      // and initial open are run, code is built
      init: {
        build: lumbarFile,
        output: publicDir
      },
      // a long running process that will watch
      // for updates, to include another long
      // running task such as "watch", set
      // background: true
      watch: {
        background: false,
        watch: lumbarFile,
        output: publicDir
      },
      // builds tests
      test: {
        build: 'config/test.json',
        output: publicDir
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
          collections: "./js/collections"
        }
      }
    },

    // test runner
    mocha: {
      test: {
        options: {
          urls: ['http://' + hostname + ':8981/test.html']
        }
      }
    }
  });
  
  grunt.registerTask('open-browser', function() {
    var open = require('open');
    open('http://' + hostname + ':' + port);
  });
  
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('thorax-inspector');
  grunt.loadNpmTasks('lumbar');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mocha');

  grunt.registerTask('test', [
    'lumbar:init',
    'lumbar:test',
    'connect:test-server',
    'mocha:test'
  ]);

  grunt.registerTask('default', [
    'thorax:inspector',
    'lumbar:init',
    'connect:server',
    'open-browser',
    'lumbar:watch'
  ]);
};