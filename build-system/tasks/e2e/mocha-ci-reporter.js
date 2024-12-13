const {reporters} = require('mocha');
const JsonReporter = require('./mocha-custom-json-reporter');
const MochaJUnitReporter = require('mocha-junit-reporter');

class CiReporter extends reporters.Base {
  /**
   * @param {import('mocha').Runner} runner
   * @param {import('mocha').MochaOptions} options
   */
  constructor(runner, options) {
    super(runner, options);
    this._mochaSpecReporter = new reporters.Spec(runner);
    this._jsonReporter = new JsonReporter(runner);
    this._mochaJunitReporter = new MochaJUnitReporter(runner, options);
  }
}

module.exports = CiReporter;
