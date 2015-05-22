'use strict';

var path = require('path');

var CHROME_START_OPTS = [
  '--user-data-dir=tmp/chrome-user-dir',
  '--no-default-browser-check',
  '--no-first-run',
  '--enable-apps-file-associations',
  '--load-and-launch-app=dist',
  'resources/simple.bpmn'
];


var CHROME_BIN = (process.env.CHROME_BIN || 'chrome').replace(/^\s+|\s+$/, '');


module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      dist: {
        files: [ 'dist/**/*' ],
        tasks: [ 'open' ]
      },

      statics: {
        files: [
          'app/icons/*',
          'app/lib/index.html',
          'app/manifest.json',
          'app/main.js'
        ],
        tasks: [ 'copy:statics' ]
      },

      less: {
        files: [
          'app/less/**/*'
        ],
        tasks: [ 'less' ]
      }
    },

    copy: {
      statics: {
        files: [{
          expand: true,
          cwd: 'app',
          dest: 'dist',
          src: [
            'icons/*',
            'lib/index.html',
            'manifest.json',
            'main.js'
          ]
        }]
      },

      font: {
        files: [{
          expand: true,
          cwd: 'app/font/font',
          dest: 'dist/font',
          src: [ '*' ]
        }]
      },

      diagram_js: {
        files: [{
          src: require.resolve('diagram-js/assets/diagram-js.css'),
          dest: 'dist/vendor/diagram-js/diagram-js.css'
        }]
      }
    },


    less: {
      app: {
        options: {
          cleancss: true,
          paths: [ 'app/less', 'node_modules' ]
        },

        files: {
          'dist/css/app.css': [
            'app/less/app.less'
          ]
        }
      }
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
          'dist/lib/index.js': [ 'app/lib/index.js' ]
        }
      },
      watchModeler: {
        options: {
          watch: true
        },
        files: {
          'dist/lib/index.js': [ 'app/lib/index.js' ]
        }
      }
    }
  });

  grunt.registerTask('open', function() {

    var fs = require('fs');

    var exec = require('child_process').exec;

    // create temp dir for log files
    try {
      fs.mkdirSync('tmp');
    } catch (e) {
      // already exists? just chill
    }

    var options = {
      detached: true,
      stdio: [ 'ignore', fs.openSync('tmp/app.out', 'w'), fs.openSync('tmp/app.err', 'w') ]
    };

    var chrome = exec(CHROME_BIN + ' ' + CHROME_START_OPTS.join(' '), options);

    // do not wait for child
    chrome.unref();
  });

  grunt.registerTask('test', [ ]);

  grunt.registerTask('build', [ 'copy', 'less', 'browserify:modeler' ]);

  grunt.registerTask('auto-build', [ 'copy', 'less', 'browserify:watchModeler', 'open', 'watch']);

  grunt.registerTask('default', [ 'test', 'build' ]);
};
