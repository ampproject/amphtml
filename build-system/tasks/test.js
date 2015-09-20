var argv = require('minimist')(process.argv.slice(2));
var gulp = require('gulp');
var karma = require('karma').server;
var config = require('../config');
var karmaConfig = config.karma;
var extend = require('util')._extend;

function getConfig() {
  var obj = Object.create(null);
  if (argv.safari) {
    return extend(obj, karmaConfig.safari);
  }

  if (argv.firefox) {
    return extend(obj, karmaConfig.firefox);
  }

  return extend(obj, karmaConfig.default);
}


gulp.task('test', ['build'], function(done) {
  var config = getConfig();
  var browsers = [];

  if (argv.watch) {
    config.singleRun = false;
  }

  if (argv.verbose) {
    config.client.captureConsole = true;
  }

  karma.start(config, done);
});
