module.exports = function(grunt) {
	grunt.initConfig({
		meta: {
			package: grunt.file.readJSON('package.json'),
			src: {
				main: 'src/main',
				test: 'src/test',
			},
			bin: {
				coverage: 'bin/coverage'
			},
			temp: {
				integration: '.grunt/integration'
			},
			doc: 'doc'
		},
		// test template functionality
		nodeunit: {
			template: '<%= meta.src.test %>/js/template.js',
			reporter: '<%= meta.src.test %>/js/reporter.js',
			integration: '<%= meta.src.test %>/js/integration.js',
		},
		// test common use-case
		jasmine: {
			integration: {
				src: ['<%= meta.src.test %>/js/Generator.js'],
				options: {
					specs: ['<%= meta.src.test %>/js/GeneratorTest.js'],
					template: require('./'),
					templateOptions: {
						coverage: '<%= meta.temp.integration %>/coverage.json',
						report: [
							{
								type: 'html',
								options: {
									dir: '<%= meta.temp.integration %>/html'
								}
							},
							{
								type: 'cobertura',
								options: {
									dir: '<%= meta.temp.integration %>/cobertura'
								}
							}
						],
						template: '<%= meta.src.test %>/html/integration.tmpl',
						templateOptions: {
							helpers: ['<%= meta.src.test %>/js/integration-helper.js']
						}
					}
				}
			}
		},
		clean: {
			temp: ['.grunt'],
			bin: ['bin']
		},
		yuidoc: {
			compile: {
				name: '<%= meta.package.name %>',
				description: '<%= meta.package.description %>',
				version: '<%= meta.package.version %>',
				options: {
					paths: '<%= meta.src.main %>',
					outdir: '<%= meta.doc %>'
				}
			}
		},
		jshint: {
			main: '<%= meta.src.main %>/js/*.js',
			test: '<%= meta.src.test %>/js/*.js',
			options: {
				// enforce
				bitwise: true,
				camelcase: true,
				curly: true,
				eqeqeq: false,
				forin: true,
				immed: true,
				indent: 4,
				latedef: true,
				newcap: true,
				noarg: true,
				noempty: true,
				nonew: true,
				plusplus: true,
				quotmark: 'single',
				undef: true,
				unused: true,
				strict: false, // i don't get it
				trailing: true,
				maxparams: 5,
				maxdepth: 3,
				maxstatements: 42,
				maxcomplexity: 5,
				maxlen: 80,
				// relax
				eqnull: true,
				laxbreak: true, // break on + etc.
				sub: true
			}
		}
	});
	
	grunt.registerTask('report', 'Write coverage report', function () {
		var istanbul = require('istanbul');
		var collector = new istanbul.Collector();
		var reporter = istanbul.Report.create('html', {
			dir: grunt.config.process('<%= meta.bin.coverage %>')
		});
		grunt.file.expand(grunt.config.process('<%= meta.bin.coverage %>/coverage-*.json')).forEach(function (file) {
			collector.add(grunt.file.readJSON(file));
		});
		reporter.writeReport(collector, true);
	});
	
	var path = require('path');
	
	var NAME = grunt.file.readJSON('package.json').name;
	var MODULE = path.join('node_modules', NAME);
	var REPORTER_SOURCE = path.normalize('src/main/js/reporter.js');
	var REPORTER_DESTINATION = path.join(MODULE, REPORTER_SOURCE);
	
	grunt.registerTask('dummyInstall', 'Pretend installation', function () {
		grunt.file.copy(REPORTER_SOURCE, REPORTER_DESTINATION);
	});
	grunt.registerTask('dummyUninstall', 'Pretend uninstallation', function () {
		grunt.file.delete(MODULE);
	});
	
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	
	grunt.registerTask('check', ['jshint:main', 'jshint:test']);		
	grunt.registerTask('doc', 'yuidoc');
	grunt.registerTask('test:template', ['nodeunit:template']);
	grunt.registerTask('test:reporter', ['nodeunit:reporter']);
	grunt.registerTask('test:integration', ['clean:temp', 'dummyInstall', 'jasmine:integration', 'nodeunit:integration', 'dummyUninstall']);
	grunt.registerTask('test', ['test:template', 'test:reporter', 'test:integration']);
	grunt.registerTask('test:coverage', ['clean:bin', 'test', 'report']);
};