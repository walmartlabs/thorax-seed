module.exports = function(grunt) {
  var port = 8000,
      publicDir = './public',
      lumbarFile = './lumbar.json';
  
  grunt.initConfig({
    server: {
      base: publicDir,
      port: port
    },
    lumbar: {
      // performs an initial build so when tests
      // and initial open are run, code is built
      build: {
        lumbarFile: lumbarFile,
        outputDir: publicDir
      },
      // a long running process that will watch
      // for updates, to include another long
      // running task such as "watch", set
      // background: true
      watch: {
        background: false,
        lumbarFile: lumbarFile,
        outputDir: publicDir
      }
    },
    // allows files to be opened when the
    // Thorax Inspector Chrome extension
    // is installed
    'thorax-inspector': {
      background: true,
      editor: "subl",
      paths: {
        views: "./js/views",
        models: "./js/models",
        collections: "./js/collections"
      }
    }
  });
  
  grunt.registerTask('open-browser', function() {
    var open = require('open');
    open('http://' + require('os').hostname() + ':' + port);
  });
  
  // load all tasks in the tasks folder
  grunt.loadNpmTasks('thorax-inspector');
  grunt.loadNpmTasks('lumbar');
  
  grunt.registerTask('default', [
    'thorax-inspector',
    'lumbar:build',
    'server',
    'open-browser',
    'lumbar:watch'
  ].join(' '));
};