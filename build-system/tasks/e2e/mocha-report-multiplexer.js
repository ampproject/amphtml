/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
const Mocha = require('mocha');
const {Base} = Mocha.reporters;

/**
 * Creates a custom Mocha reporter which runs many reporters at once.
 * @param {Base[]} reporters
 * @return {Function<*,MochaReportMultiplexer>}
 */
function createMultiplexedReporter(reporters) {
  return class DynamicReportMultiplexer extends Base {
    /**
     * @param {*} runner
     * @param {Mocha.Runner.options} options
     */
    constructor(runner, options) {
      super(runner, options);
      // If there are too many reporters listening to events on the runner a
      // warning will be displayed about a potential emitter leak. This should
      // allow each reporter to listen to every event without exceeding the max.
      // The default max listeners is 10.
      const potentialEvents = Object.keys(Mocha.Runner.constants);
      runner.setMaxListeners(potentialEvents.length * reporters.length);

      this.reporters = reporters.map(
        (reporter) => new reporter(runner, options)
      );
    }
  };
}

module.exports = {
  createMultiplexedReporter,
};
