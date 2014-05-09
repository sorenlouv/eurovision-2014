/*jslint node: true */
module.exports = function(grunt) {
  'use strict';

  // Load NPM modules as needed
  require('jit-grunt')(grunt);

  grunt.initConfig({

    /*
    * Project variables
    ****************************/
    pkg: grunt.file.readJSON('package.json'),

    // Dist files
    dist_js_file: 'dist/js/eurovision.js',
    dist_css_file: 'dist/css/eurovision.css',
    compiled_css_file: 'dist/css/compiled.css',

    // Source files
    source_js_file: 'src/js/**/*.js',
    source_less_file: 'src/less/**/*.less',

    /*
    * Jshint
    * All javascript files in src/js
    ****************************/
    jshint: {
      files: ['<%= source_js_file %>'],
      // JSHint options http://jshint.com/docs/options/
      options: {
        jshintrc: '.jshintrc'
      }
    },

    /*
    * Concatenate js files
    * All javascript files in src/js
    ****************************/
    concat: {
      options: {
        // separator: '\n'
      },
      dist: {
        src: ['<%= source_js_file %>'],
        dest: '<%= dist_js_file %>'
      }
    },

    /*
    * Uglify
    * Minify JS
    ****************************/
    uglify: {
      options: {
        mangle: true,
        compress: {
          drop_console: true
        }
      },
      dist: {
        files: {
          '<%= dist_js_file %>': ['<%= dist_js_file %>']
        }
      }
    },

    /*
    * Less: compile less to css
    ****************************/
    less: {
      dist: {
        options: {
          paths: ['src/less/']
        },
        src: 'src/less/main.less',
        dest: '<%= compiled_css_file %>'
      }
    },

    /*
    * Prefixer: Add/remove css prefixes
    ****************************/
    autoprefixer: {
      dist: {
        options: {
          browsers: ['last 2 version', 'ie 9']
        },
        src: '<%= compiled_css_file %>',
        dest: '<%= dist_css_file %>'
      }
    },

    /*
    * CssLint
    * Final distribution css file
    ****************************/
    csslint: {
      options: {
        csslintrc: '.csslintrc' // Get CSSLint options from external file.
      },
      strict: {
        src: ['<%= dist_css_file %>']
      }
    },

    /*
    * CssMin
    * Minify CSS
    ****************************/
    cssmin: {
      combine: {
        files: {
          '<%= dist_css_file %>': ['<%= dist_css_file %>']
        }
      }
    },

    /*
    * Watch changes and invoke specified tasks
    ****************************/
    watch: {
      options: {
        livereload: true
      },

      // Javacript: jshint and concat
      js: {
        files: '<%= source_js_file %>',
        tasks: ['jshint', 'concat']
      },

      // Less: Compiles to CSS and CSSLint (no page-reload)
      less: {
        files: '<%= source_less_file %>',
        tasks: ['less:dist'],
        options: {
          livereload: false
        }
      },

      // Prefix and CSSLint
      css: {
        files: '<%= compiled_css_file %>',
        tasks: ['autoprefixer:dist', 'csslint'],
        options: {
          livereload: false
        }
      },

      // Live reload on change (no tasks)
      css_reload: {
        files: '<%= dist_css_file %>'
      },

      // Live reload on change (no tasks)
      templates: {
        files: ['templates/**/*.html', 'index.html']
      }
    }
  });

  /*
  * Tasks
  ****************************/
  grunt.registerTask('default', ['jshint', 'concat', 'less:dist', 'autoprefixer:dist', 'csslint']);

  grunt.registerTask('production', ['jshint', 'concat', 'less:dist', 'autoprefixer:dist', 'csslint', 'uglify', 'cssmin']);

};
