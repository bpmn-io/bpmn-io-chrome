'use strict';

var path = require('path');

var tmpDir = path.join(__dirname, 'tmp', 'chrome-user-dir');

var CHROME_START_OPTS =
  '--user-data-dir="' + tmpDir + '" ' +
  '--no-default-browser-check ' +
  '--no-first-run';


// configures browsers to run test against
// any of [ 'PhantomJS', 'Chrome', 'Firefox', 'IE']
var CHROME_BIN = (process.env.CHROME_BIN || 'chrome').replace(/^\s+|\s+$/, '');
var CHROME_OPEN = (process.env.CHROME_OPEN || CHROME_BIN + ' ' + CHROME_START_OPTS +' --load-and-launch-app="' + __dirname + '/dist" resources/simple.bpmn').replace(/^\s+|\s+$/, '');


module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    config: {
      dist: 'dist',
      src: 'app',
      less: 'app/less',
      chrome_reload: CHROME_OPEN
    },

    watch: {
      dist: {
        files: [ '<%= config.dist %>/**/*' ],
        tasks: [ 'open' ]
      },

      statics: {
        files: [
          '<%= config.src %>/**/*'
        ],
        tasks: [ 'less', 'copy:statics' ]
      }
    },

    copy: {
      statics: {
        files: [{
          expand: true,
          cwd: '<%= config.src %>',
          dest: '<%= config.dist %>',
          src: [
            'icons/*',
            'lib/index.html',
            '*'
          ]
        }]
      },

      font: {
        files: [{
          expand: true,
          cwd: '<%= config.src %>/font/font',
          dest: '<%= config.dist %>/font',
          src: [ '*' ]
        }]
      },

      diagram_js: {
        files: [{
          src: require.resolve('diagram-js/assets/diagram-js.css'),
          dest: '<%= config.dist %>/vendor/diagram-js/diagram-js.css'
        }]
      }
    },


    less: {
      app: {
        options: {
          cleancss: true,
          paths: [ '<%= config.less %>', 'node_modules' ]
        },

        files: {
          '<%= config.dist %>/css/app.css': [
            '<%= config.less %>/app.less'
          ]
        }
      }
    },

    exec: {
      chrome_reload: '<%= config.chrome_reload %>'
    },

    browserify: {
      options: {
        browserifyOptions: {
          builtins: [ 'events' ],
          insertGlobalVars: {
            process: function () {
                return 'undefined';
            },
            Buffer: function () {
                return 'undefined';
            }
          }
        },
        transform: [ 'stringify' ]
      },
      modeler: {
        files: {
          '<%= config.dist %>/lib/index.js': [ '<%= config.src %>/lib/index.js' ]
        }
      },
      watchModeler: {
        options: {
          watch: true
        },
        files: {
          '<%= config.dist %>/lib/index.js': [ '<%= config.src %>/lib/index.js' ]
        }
      }
    }
  });

  grunt.registerTask('test', [ ]);

  grunt.registerTask('open', 'exec:chrome_reload');

  grunt.registerTask('build', [ 'copy', 'less', 'browserify:modeler' ]);

  grunt.registerTask('auto-build', [ 'copy', 'less', 'browserify:watchModeler', 'open', 'watch']);

  grunt.registerTask('default', [ 'test', 'build' ]);
};
