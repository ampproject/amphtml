const JsonReporter = require('./mocha-custom-json-reporter');
const mocha = require('mocha');
const MochaDotsReporter = require('./mocha-dots-reporter');
const MochaJUnitReporter = require('mocha-junit-reporter');
const {Base} = mocha.reporters;

/**
 * @param {*} runner
 * @param {*} options
 * @return {MochaDotsReporter}
 */
function ciReporter(runner, options) {
  Base.call(this, runner, options);
  this._mochaDotsReporter = new MochaDotsReporter(runner);
  this._jsonReporter = new JsonReporter(runner);
  this._mochaJunitReporter = new MochaJUnitReporter(runner, options);
  // TODO(#28387) clean up this typing.
  return /** @type {*} */ (this);
}
ciReporter.prototype.__proto__ = Base.prototype;

module.exports = ciReporter;
