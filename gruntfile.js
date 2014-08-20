module.exports = function(grunt) {
  var shell = require('shelljs');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    protractor: {
      options: {
        configFile: "protractor.conf.js",
        keepAlive: true,
        noColor: false,
        args: {}
      },
      chrome: {
        options: {
          args: {
            browser: "chrome"
          }
        }
      },
    },
    protractor_webdriver: {
      huburn: {},
    },
  });

  grunt.loadNpmTasks('grunt-protractor-runner');
};
