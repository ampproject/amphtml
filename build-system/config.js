var path = require('path');

var karmaConf = path.resolve('karma.conf.js');

var paths = [
  'test/**/*.js',
  'extensions/**/test/**/*.js',
  'test/fixtures/**/*.html',
  {
    pattern: 'dist/**/*.js',
    included: false,
  },
  {
    pattern: 'build/**/*.js',
    included: false,
    served: true
  },
  {
    pattern: 'examples/**/*.js',
    included: false,
    served: true
  }
];

var karma = {
  default: {
    configFile: karmaConf,
    files: paths,
    singleRun: true,
    client: {
      captureConsole: false
    }
  },
  firefox: {
    configFile: karmaConf,
    files: paths,
    singleRun: true,
    browsers: ['Firefox'],
    client: {
      mocha: {
        timeout: 10000
      },
      captureConsole: false
    }
  },
  safari: {
    configFile: karmaConf,
    files: paths,
    singleRun: true,
    browsers: ['Safari'],
    client: {
      mocha: {
        timeout: 10000
      },
      captureConsole: false
    }
  }
};

/** @const  */
module.exports = {
  paths: paths,
  karma: karma
};
