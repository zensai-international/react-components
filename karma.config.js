module.exports = function (config) {
  config.set({
    autoWatch: true,
    browsers: ['Chrome'/*'PhantomJS'*/],
    files: ['./dist/index.tests.js'],
    frameworks: ['mocha'],
    plugins: ['karma-chrome-launcher', 'karma-mocha', 'karma-mocha-reporter'/*, 'karma-phantomjs-launcher'*/],
    reporters: ['mocha'],
    singleRun: false
  });
    config.set({
        autoWatch: true,
        browsers: ['Chrome'/*'PhantomJS'*/],
        files: ['./dist/index.tests.js'],
        frameworks: ['mocha'],
        plugins: ['karma-chrome-launcher', 'karma-mocha', 'karma-mocha-reporter'/*, 'karma-phantomjs-launcher'*/],
        reporters: ['mocha'],
        singleRun: false
    });
};