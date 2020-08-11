/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const JsonReporter = require('./mocha-custom-json-reporter');
const KarmaMimicReporter = require('./mocha-karma-mimic-reporter');
const mocha = require('mocha');
const {Base} = mocha.reporters;

function ciReporter(runner, options) {
  Base.call(this, runner, options);
  this._karmaMimicReporter = new KarmaMimicReporter(runner, options);
  this._jsonReporter = new JsonReporter(runner, options);
  return this;
}
ciReporter.prototype.__proto__ = Base.prototype;

module.exports = ciReporter;
