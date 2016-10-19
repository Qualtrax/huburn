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
        karma: {
            options: {
                configFile: 'karma.conf.js',
            },
            debug: {
                browsers: ['Chrome'],
                singleRun: false,
            }
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
                files: ['lib/static/less/*.less'],
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
    grunt.registerTask('unit', [], function () {
        grunt.loadNpmTasks('grunt-karma');
        grunt.task.run('karma:debug');
    });
};
