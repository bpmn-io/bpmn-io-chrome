'use strict';

// configures browsers to run test against
// any of [ 'PhantomJS', 'Chrome', 'Firefox', 'IE']
var CHROME_OPEN = ((process.env.CHROME_OPEN || '').replace(/^\s+|\s+$/, '') || 'PhantomJS').split(/\s*,\s*/g);

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    config: {
      dist: 'dist',
      src: 'app',
      chrome_reload: 'chrome --load-and-launch-app="$(pwd)/dist" resources/simple.bpmn'
    },

    watch: {
      app: {
        files: [ '<%= config.dist %>/**/*' ],
        tasks: [ 'open' ]
      }
    },

    copy: {

      app: {
        files: [{
          expand: true,
          cwd: '<%= config.src %>',
          dest: '<%= config.dist %>/',
          src: [ '**/*', '!vendor' ]
        }]
      },

      diagram_js: {
        files: [{
          src: require.resolve('diagram-js/assets/diagram.css'),
          dest: '<%= config.dist %>/vendor/diagram-js/diagram.css'
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
            'jquery'
          ],
          watch: true
        },
        files: {
          '<%= config.dist %>/vendor/bpmn-js/bpmn.js': [ '<%= config.src %>/vendor/bpmn-js/bpmn.js' ]
        }
      }
    },
  });

  grunt.registerTask('test', [ ]);

  grunt.registerTask('open', 'exec:chrome_reload');

  grunt.registerTask('build', [ 'copy', 'browserify:modeler' ]);

  grunt.registerTask('auto-build', [ 'build', 'browserify:watchModeler', 'open', 'watch']);

  grunt.registerTask('default', [ 'test', 'build' ]);
};
