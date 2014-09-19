'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);


  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: { },

    copy: {
      diagram_js: {
        files: [{
          src: require.resolve('diagram-js/assets/diagram.css'),
          dest: 'app/vendor/diagram-js/diagram.css'
        }]
      }
    },

    browserify: {
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

      modeler: {
        files: {
          'app/vendor/bpmn-js/bpmn.js': [ 'js/bpmn.js' ]
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
          'app/vendor/bpmn-js/bpmn.js': [ 'js/bpmn.js' ]
        }
      }
    },
  });

  grunt.registerTask('test', [ ]);

  grunt.registerTask('build', [ 'copy', 'browserify:modeler' ]);

  grunt.registerTask('auto-build', [ 'build', 'browserify:watchModeler', 'watch' ]);

  grunt.registerTask('default', [ 'test', 'build' ]);
};
