'use strict';

// configures browsers to run test against
// any of [ 'PhantomJS', 'Chrome', 'Firefox', 'IE']
var CHROME_BIN = (process.env.CHROME_BIN || 'chrome').replace(/^\s+|\s+$/, '');
var CHROME_OPEN = (process.env.CHROME_OPEN || CHROME_BIN + ' --load-and-launch-app="' + __dirname + '/dist" resources/simple.bpmn').replace(/^\s+|\s+$/, '');

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    config: {
      dist: 'dist',
      src: 'app',
      chrome_reload: CHROME_OPEN
    },

    watch: {
      dist: {
        files: [ '<%= config.dist %>/**/*' ],
        tasks: [ 'open' ]
      },

      app: {
        files: [ '<%= config.src %>/**/*', '!<%= config.src %>/vendor/**/*' ],
        tasks: [ 'copy:app' ]
      }
    },

    copy: {

      app: {
        files: [{
          expand: true,
          cwd: '<%= config.src %>',
          dest: '<%= config.dist %>/',
          src: [ '**/*', '!vendor/**/*' ]
        }]
      },

      diagram_js: {
        files: [{
          src: require.resolve('diagram-js/assets/diagram-js.css'),
          dest: '<%= config.dist %>/vendor/diagram-js/diagram-js.css'
        }]
      }
    },

    exec: {
      chrome_reload: '<%= config.chrome_reload %>'
    },

    browserify: {
      modeler: {
        options: {
          browserifyOptions: {
            builtins: false
          },
          bundleOptions: {
            detectGlobals: false,
            insertGlobalVars: []
          },
          require: [
            'bpmn-js/lib/Modeler',
            'diagram-js-origin',
            'lodash',
            'jquery'
          ]
        },
        files: {
          '<%= config.dist %>/vendor/bpmn-js/bpmn.js': [ '<%= config.src %>/vendor/bpmn-js/bpmn.js' ]
        }
      },
      watchModeler: {
        options: {
          browserifyOptions: {
            builtins: false
          },
          bundleOptions: {
            detectGlobals: false,
            insertGlobalVars: []
          },
          require: [
            'bpmn-js/lib/Modeler',
            'diagram-js-origin',
            'lodash',
            'jquery'
          ],
          watch: true
        },
        files: {
          '<%= config.dist %>/vendor/bpmn-js/bpmn.js': [ '<%= config.src %>/vendor/bpmn-js/bpmn.js' ]
        }
      }
    }
  });

  grunt.registerTask('test', [ ]);

  grunt.registerTask('open', 'exec:chrome_reload');

  grunt.registerTask('build', [ 'copy', 'browserify:modeler' ]);

  grunt.registerTask('auto-build', [ 'build', 'browserify:watchModeler', 'open', 'watch']);

  grunt.registerTask('default', [ 'test', 'build' ]);
};
