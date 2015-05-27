module.exports = function (grunt) {
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
        less: {
            production: {
                options: {
                    cleancss: true
                },
                files: {
                    "lib/static/static/css/main.css": "lib/static/less/main.less"
                }
            }
        },
        watch: {
            less: {
                files: ['lib/static/less/main.less'],
                tasks: ['less']
            }
        },
        protractor_webdriver: {
            huburn: {},
        },
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('compile-less-dev', ['watch:less']);
    grunt.registerTask('compile-less', ['less']);
};
