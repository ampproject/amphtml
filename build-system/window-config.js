var minimist = require('minimist');

var argv = minimist(process.argv.slice(2));
var isCanary = argv.type === 'canary';

exports.getTemplate = function() {
  return `window.AMP_CONFIG={canary:${isCanary}};/*AMP_CONFIG*/`;
};
