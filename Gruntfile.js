module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            app: { // "app" target - this creates min safe versions of each file you speficy:
                files: {
                    './public/min-safe/site/angular/app.js': ['./public/site/angular/app.js'],
                    './public/min-safe/site/angular/controllers/controllers.js': ['./public/site/angular/controllers/*.js'],
                    './public/min-safe/site/angular/services/services.js': ['./public/site/angular/services/*.js']
                }
            }
        },
        concat: {
            js: {
                src: [
                    './public/min-safe/site/angular/app.js',
                    './public/min-safe/site/angular/services/*.js',
                    './public/min-safe/site/angular/controllers/*.js'
                ],
                dest: './public/min/app.js'
            },
            vendor: { 
                src: [
                    './public/site/js/knob.js',
                    './public/site/js/spin.js',
                    './public/site/js/moment.js',
                    './public/site/js/pi.init.tab.js',
                    './public/site/js/jquery.form.js',
                    './public/site/angular/thirdparty/fileupload/angular-file-upload-shim.js',
                    './public/site/bower_components/angular/angular.min.js',
                    './public/site/bower_components/angular-sanitize/angular-sanitize.min.js',
                    './public/site/angular/thirdparty/fileupload/angular-file-upload.js',
                    './public/site/bower_components/angular-resource/angular-resource.js'
                ],
                dest: './public/min/vendor.js'
            }

        },
        uglify: {
            js: { // target
                src: ['./public/min/app.js'],
                dest: './public/min/app.js'
            },
            vendor: { // target
                src: ['./public/min/vendor.js'],
                dest: './public/min/vendor.js'
            }
        }



        //grunt task configuration will go here     
    });

    //load grunt task
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ng-annotate');

    //register grunt default task
    grunt.registerTask('default', ['ngAnnotate', 'concat', 'uglify']);
}